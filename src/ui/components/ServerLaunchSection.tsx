import React from 'react'
import Checkbox from './common/Checkbox'
import BigButton from './common/BigButton'
import TextInput from './common/TextInput'
import HelpButton from './common/HelpButton'
import { getConfig, saveConfig, setConfigOption } from '../../utils/configuration'
import { translate } from '../../utils/language'
import { invoke } from '@tauri-apps/api/tauri'

import Server from '../../resources/icons/server.svg'
import Plus from '../../resources/icons/plus.svg'

import './ServerLaunchSection.css'
import { dataDir } from '@tauri-apps/api/path'
import { getGameExecutable, getGameVersion, getGrasscutterJar } from '../../utils/game'
import { patchGame, unpatchGame } from '../../utils/rsa'
import { listen } from '@tauri-apps/api/event'

interface IProps {
  openExtras: (playGame: () => void) => void
}

interface IState {
  grasscutterEnabled: boolean
  buttonLabel: string
  checkboxLabel: string
  ip: string
  port: string
  launchServer: (proc_name?: string) => void

  ipPlaceholder: string
  portPlaceholder: string

  portHelpText: string

  httpsLabel: string
  httpsEnabled: boolean

  swag: boolean
  akebiSet: boolean
  migotoSet: boolean

  unElevated: boolean
}

export default class ServerLaunchSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      grasscutterEnabled: false,
      buttonLabel: '',
      checkboxLabel: '',
      ip: '',
      port: '',
      ipPlaceholder: '',
      portPlaceholder: '',
      portHelpText: '',
      httpsLabel: '',
      httpsEnabled: false,
      launchServer: () => {
        alert('Error launching grasscutter')
      },
      swag: false,
      akebiSet: false,
      migotoSet: false,
      unElevated: false,
    }

    this.toggleGrasscutter = this.toggleGrasscutter.bind(this)
    this.playGame = this.playGame.bind(this)
    this.setIp = this.setIp.bind(this)
    this.setPort = this.setPort.bind(this)
    this.toggleHttps = this.toggleHttps.bind(this)
    this.launchServer = this.launchServer.bind(this)

    listen('start_grasscutter', async () => {
      this.launchServer()
    })
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      grasscutterEnabled: config.toggle_grasscutter || false,
      buttonLabel: await translate('main.launch_button'),
      checkboxLabel: await translate('main.gc_enable'),
      ip: config.last_ip || '',
      port: config.last_port || '',
      ipPlaceholder: await translate('main.ip_placeholder'),
      portPlaceholder: await translate('help.port_placeholder'),
      portHelpText: await translate('help.port_help_text'),
      httpsLabel: await translate('main.https_enable'),
      httpsEnabled: config.https_enabled || false,
      swag: config.swag_mode || false,
      akebiSet: config.akebi_path !== '',
      migotoSet: config.migoto_path !== '',
      unElevated: config.un_elevated || false,
    })
  }

  async toggleGrasscutter() {
    const config = await getConfig()

    config.toggle_grasscutter = !config.toggle_grasscutter

    // Set state as well
    this.setState({
      grasscutterEnabled: config.toggle_grasscutter,
    })

    await saveConfig(config)
  }

  async playGame(exe?: string, proc_name?: string) {
    const config = await getConfig()

    if (!(await getGameExecutable())) {
      alert('Game executable not set!')
      return
    }

    // Connect to proxy
    if (config.toggle_grasscutter) {
      if (config.patch_rsa) {
        const gameVersion = await getGameVersion()
        console.log(gameVersion)

        if (gameVersion == null) {
          alert(
            'Game version could not be determined. Please make sure you have the game correctly selected and try again.'
          )
          return
        }

        if (gameVersion?.major == 2 && gameVersion?.minor < 9) {
          alert('Game version is too old for RSA patching. Please disable RSA patching in the settings and try again.')
          return
        }

        if (gameVersion?.major == 3 && gameVersion?.minor < 1) {
          alert('Game version is too old for RSA patching. Please disable RSA patching in the settings and try again.')
          return
        }

        const patched = await patchGame()

        if (!patched) {
          alert('Could not patch! Try launching again, or patching manually.')
          return
        }
      }

      const game_exe = await getGameExecutable()

      // Save last connected server and port
      await setConfigOption('last_ip', this.state.ip)
      await setConfigOption('last_port', this.state.port)

      await invoke('enable_process_watcher', {
        process: proc_name || game_exe,
      })

      if (config.use_internal_proxy) {
        // Set IP
        await invoke('set_proxy_addr', {
          addr: (this.state.httpsEnabled ? 'https' : 'http') + '://' + this.state.ip + ':' + this.state.port,
        })
        // Connect to proxy
        await invoke('connect', { port: 8365, certificatePath: (await dataDir()) + '\\cultivation\\ca' })
      }

      // Open server as well if the options are set
      if (config.grasscutter_with_game) {
        this.launchServer()
      }
    } else {
      await unpatchGame()
    }

    if (config.wipe_login) {
      // First wipe registry if we have to
      await invoke('wipe_registry', {
        // The exe is always PascalCase so we can get the dir using regex
        execName: (await getGameExecutable())?.split('.exe')[0].replace(/([a-z\d])([A-Z])/g, '$1 $2'),
      })
    }

    // Launch the program
    const gameExists = await invoke('dir_exists', {
      path: exe || config.game_install_path,
    })

    if (gameExists)
      if (config.un_elevated) {
        await invoke('run_un_elevated', {
          path: config.game_install_path,
        })
      } else {
        await invoke('run_program_relative', { path: exe || config.game_install_path })
      }
    else alert('Game not found! At: ' + (exe || config.game_install_path))
  }

  async launchServer(proc_name?: string) {
    if (await invoke('is_grasscutter_running')) {
      alert('Grasscutter already running!')
      return
    }
    const config = await getConfig()

    if (!config.grasscutter_path) return alert('Grasscutter not installed or set!')

    if (config.auto_mongodb) {
      const grasscutter_jar = await getGrasscutterJar()
      await invoke('enable_grasscutter_watcher', {
        process: proc_name || grasscutter_jar,
      })
      // Check if MongoDB is running and start it if not
      await invoke('service_status', { service: 'MongoDB' })
    }

    let jarFolder = config.grasscutter_path

    if (jarFolder.includes('/')) {
      jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('/'))
    } else {
      jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('\\'))
    }

    // Launch the jar
    await invoke('run_jar', {
      path: config.grasscutter_path,
      executeIn: jarFolder,
      javaPath: config.java_path || '',
    })
  }

  setIp(text: string) {
    this.setState({
      ip: text,
    })
  }

  setPort(text: string) {
    this.setState({
      port: text,
    })
  }

  async toggleHttps() {
    const config = await getConfig()

    config.https_enabled = !config.https_enabled

    // Set state as well
    this.setState({
      httpsEnabled: config.https_enabled,
    })

    await saveConfig(config)
  }

  render() {
    return (
      <div id="playButton">
        <div id="serverControls">
          <Checkbox
            id="enableGC"
            label={this.state.checkboxLabel}
            onChange={this.toggleGrasscutter}
            checked={this.state.grasscutterEnabled}
          />
        </div>

        {this.state.grasscutterEnabled && (
          <div>
            <div className="ServerConfig" id="serverConfigContainer">
              <TextInput
                id="ip"
                key="ip"
                placeholder={this.state.ipPlaceholder}
                onChange={this.setIp}
                initalValue={this.state.ip}
              />
              <TextInput
                style={{
                  width: '10%',
                }}
                id="port"
                key="port"
                placeholder={this.state.portPlaceholder}
                onChange={this.setPort}
                initalValue={this.state.port}
              />
              <HelpButton contents={this.state.portHelpText} />
              <Checkbox
                id="httpsEnable"
                label={this.state.httpsLabel}
                onChange={this.toggleHttps}
                checked={this.state.httpsEnabled}
              />
            </div>
          </div>
        )}

        <div className="ServerLaunchButtons" id="serverLaunchContainer">
          <BigButton onClick={this.playGame} id="officialPlay">
            {this.state.buttonLabel}
          </BigButton>
          {this.state.swag && (
            <BigButton onClick={() => this.props.openExtras(this.playGame)} id="ExtrasMenuButton">
              <img className="ExtrasIcon" id="extrasIcon" src={Plus} />
            </BigButton>
          )}
          <BigButton onClick={this.launchServer} id="serverLaunch">
            <img className="ServerIcon" id="serverLaunchIcon" src={Server} />
          </BigButton>
        </div>
      </div>
    )
  }
}
