import React from 'react'
import Checkbox from './common/Checkbox'
import BigButton from './common/BigButton'
import TextInput from './common/TextInput'
import HelpButton from './common/HelpButton'
import { getConfig, saveConfig, setConfigOption } from '../../utils/configuration'
import { translate } from '../../utils/language'
import { invoke } from '@tauri-apps/api/tauri'

import Server from '../../resources/icons/server.svg'
import './ServerLaunchSection.css'
import {dataDir} from '@tauri-apps/api/path'

interface IState {
  grasscutterEnabled: boolean;
  buttonLabel: string;
  checkboxLabel: string;
  ip: string;
  port: string;

  ipPlaceholder: string;
  portPlaceholder: string;

  portHelpText: string;

  httpsLabel: string;
  httpsEnabled: boolean;
}

export default class ServerLaunchSection extends React.Component<{}, IState> {
  constructor(props: {}) {
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
      httpsEnabled: false
    }

    this.toggleGrasscutter = this.toggleGrasscutter.bind(this)
    this.playGame = this.playGame.bind(this)
    this.setIp = this.setIp.bind(this)
    this.setPort = this.setPort.bind(this)
    this.toggleHttps = this.toggleHttps.bind(this)
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
    })
  }

  async toggleGrasscutter() {
    const config = await getConfig()

    config.toggle_grasscutter = !config.toggle_grasscutter

    // Set state as well
    this.setState({
      grasscutterEnabled: config.toggle_grasscutter
    })

    await saveConfig(config)
  }

  async playGame() {
    const config = await getConfig()
  
    if (!config.game_install_path) return alert('Game path not set!')
    
    // Connect to proxy
    if (config.toggle_grasscutter) {
      let game_exe = config.game_install_path

      if (game_exe.includes('\\')) {
        game_exe = game_exe.substring(config.game_install_path.lastIndexOf('\\') + 1)
      } else {
        game_exe = game_exe.substring(config.game_install_path.lastIndexOf('/') + 1)
      }

      // Save last connected server and port
      await setConfigOption('last_ip', this.state.ip)
      await setConfigOption('last_port', this.state.port)

      // Set IP
      await invoke('set_proxy_addr', { addr: (this.state.httpsEnabled ? 'https':'http') + '://' + this.state.ip + ':' + this.state.port })
      await invoke('enable_process_watcher', {
        process: game_exe
      })

      // Connect to proxy
      await invoke('connect', { port: 8365, certificatePath: await dataDir() + '\\cultivation\\ca' })

      // Open server as well if the options are set
      if (config.grasscutter_with_game) {
        let jarFolder = config.grasscutter_path

        if (jarFolder.includes('/')) {
          jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('/'))
        } else {
          jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('\\'))
        }

        await invoke('run_jar', {
          path: config.grasscutter_path,
          executeIn: jarFolder,
          javaPath: config.java_path || ''
        })
      }
    }
  
    // Launch the program
    const gameExists = await invoke('dir_exists', {
      path: config.game_install_path
    })

    if (gameExists) await invoke('run_program', { path: config.game_install_path })
    else alert('Game not found! At: ' + config.game_install_path)
  }

  async launchServer() {
    const config = await getConfig()

    if (!config.grasscutter_path) return alert('Grasscutter not installed or set!')

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
      javaPath: config.java_path || ''
    })
  }

  setIp(text: string) {
    this.setState({
      ip: text
    })
  }

  setPort(text: string) {
    this.setState({
      port: text
    })
  }

  async toggleHttps() {
    const config = await getConfig()

    config.https_enabled = !config.https_enabled

    // Set state as well
    this.setState({
      httpsEnabled: config.https_enabled
    })

    await saveConfig(config)
  }

  render() {
    return (
      <div id="playButton">
        <div id="serverControls">
          <Checkbox id="enableGC" label={this.state.checkboxLabel} onChange={this.toggleGrasscutter} checked={this.state.grasscutterEnabled}/>
        </div>

        {
          this.state.grasscutterEnabled && (
            <div>
              <div className="ServerConfig" id="serverConfigContainer">
                <TextInput id="ip" key="ip" placeholder={this.state.ipPlaceholder} onChange={this.setIp} initalValue={this.state.ip} />
                <TextInput style={{
                  width: '10%',
                }} id="port" key="port" placeholder={this.state.portPlaceholder} onChange={this.setPort} initalValue={this.state.port} />
                <HelpButton contents={this.state.portHelpText} />
                <Checkbox id="httpsEnable" label={this.state.httpsLabel} onChange={this.toggleHttps} checked={this.state.httpsEnabled} />
              </div>
            </div>

          )
        }


        <div className="ServerLaunchButtons" id="serverLaunchContainer">
          <BigButton onClick={this.playGame} id="officialPlay">{this.state.buttonLabel}</BigButton>
          <BigButton onClick={this.launchServer} id="serverLaunch">
            <img className="ServerIcon" id="serverLaunchIcon" src={Server} />
          </BigButton>
        </div>
      </div>
    )
  }
}