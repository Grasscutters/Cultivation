import React from 'react'
import { invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr, { getLanguages } from '../../../utils/language'
import { setConfigOption, getConfig, getConfigOption, Configuration } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Divider from './Divider'
import { getThemeList } from '../../../utils/themes'
import * as server from '../../../utils/server'

import './Options.css'
import BigButton from '../common/BigButton'
import DownloadHandler from '../../../utils/download'
import * as meta from '../../../utils/rsa'
import HelpButton from '../common/HelpButton'
import TextInput from '../common/TextInput'
import SmallButton from '../common/SmallButton'

interface IProps {
  closeFn: () => void
  downloadManager: DownloadHandler
}

interface IState {
  game_install_path: string
  grasscutter_path: string
  java_path: string
  grasscutter_with_game: boolean
  language_options: { [key: string]: string }[]
  current_language: string
  bg_url_or_path: string
  themes: string[]
  theme: string
  encryption: boolean
  patch_rsa: boolean
  use_internal_proxy: boolean
  wipe_login: boolean
  horny_mode: boolean
  auto_mongodb: boolean
  swag: boolean
  platform: string
  un_elevated: boolean

  // Swag stuff
  akebi_path: string
  migoto_path: string
  reshade_path: string
}

export default class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      game_install_path: '',
      grasscutter_path: '',
      java_path: '',
      grasscutter_with_game: false,
      language_options: [],
      current_language: 'en',
      bg_url_or_path: '',
      themes: ['default'],
      theme: '',
      encryption: false,
      patch_rsa: false,
      use_internal_proxy: false,
      wipe_login: false,
      horny_mode: false,
      swag: false,
      auto_mongodb: false,
      platform: '',
      un_elevated: false,

      // Swag stuff
      akebi_path: '',
      migoto_path: '',
      reshade_path: '',
    }

    this.setGameExecutable = this.setGameExecutable.bind(this)
    this.setGrasscutterJar = this.setGrasscutterJar.bind(this)
    this.setJavaPath = this.setJavaPath.bind(this)
    this.setAkebi = this.setAkebi.bind(this)
    this.setMigoto = this.setMigoto.bind(this)
    this.toggleGrasscutterWithGame = this.toggleGrasscutterWithGame.bind(this)
    this.setCustomBackground = this.setCustomBackground.bind(this)
    this.toggleEncryption = this.toggleEncryption.bind(this)
    this.removeRSA = this.removeRSA.bind(this)
    this.addMigotoDelay = this.addMigotoDelay.bind(this)
    this.toggleUnElevatedGame = this.toggleUnElevatedGame.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()
    const languages = await getLanguages()
    const platform: string = await invoke('get_platform')

    // Remove jar from path
    const path = config.grasscutter_path.replace(/\\/g, '/')
    const folderPath = path.substring(0, path.lastIndexOf('/'))
    const encEnabled = await server.encryptionEnabled(folderPath + '/config.json')

    console.log(platform)

    this.setState({
      game_install_path: config.game_install_path || '',
      grasscutter_path: config.grasscutter_path || '',
      java_path: config.java_path || '',
      grasscutter_with_game: config.grasscutter_with_game || false,
      language_options: languages,
      current_language: config.language || 'en',
      bg_url_or_path: config.custom_background || '',
      themes: (await getThemeList()).map((t) => t.name),
      theme: config.theme || 'default',
      encryption: encEnabled || false,
      patch_rsa: config.patch_rsa || false,
      use_internal_proxy: config.use_internal_proxy || false,
      wipe_login: config.wipe_login || false,
      horny_mode: config.horny_mode || false,
      swag: config.swag_mode || false,
      auto_mongodb: config.auto_mongodb || false,
      platform,
      un_elevated: config.un_elevated || false,

      // Swag stuff
      akebi_path: config.akebi_path || '',
      migoto_path: config.migoto_path || '',
      reshade_path: config.reshade_path || '',
    })

    this.forceUpdate()
  }

  setGameExecutable(value: string) {
    setConfigOption('game_install_path', value)

    // I hope this stops people setting launcher.exe because oml it's annoying
    if (value.endsWith('launcher.exe')) {
      const pathArr = value.replace(/\\/g, '/').split('/')
      pathArr.pop()
      const path = pathArr.join('/') + '/Genshin Impact Game/'

      alert(
        `You have set your game execuatable to "launcher.exe". You should not do this. Your game executable is located in:\n\n${path}`
      )
    }

    this.setState({
      game_install_path: value,
    })
  }

  async setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value)

    this.setState({
      grasscutter_path: value,
    })

    const config = await getConfig()
    const path = config.grasscutter_path.replace(/\\/g, '/')
    const folderPath = path.substring(0, path.lastIndexOf('/'))
    const encEnabled = await server.encryptionEnabled(folderPath + '/config.json')

    // Update encryption button when setting new jar
    this.setState({
      encryption: encEnabled,
    })

    window.location.reload()
  }

  setJavaPath(value: string) {
    setConfigOption('java_path', value)

    this.setState({
      java_path: value,
    })
  }

  setAkebi(value: string) {
    setConfigOption('akebi_path', value)

    this.setState({
      akebi_path: value,
    })
  }

  setMigoto(value: string) {
    setConfigOption('migoto_path', value)

    this.setState({
      migoto_path: value,
    })

    // Set game exe in Migoto ini
    invoke('set_migoto_target', {
      migotoPath: value,
    })
  }

  setReshade(value: string) {
    setConfigOption('reshade_path', value)

    this.setState({
      reshade_path: value,
    })
  }

  async setLanguage(value: string) {
    await setConfigOption('language', value)
    window.location.reload()
  }

  async setTheme(value: string) {
    await setConfigOption('theme', value)
    window.location.reload()
  }

  async toggleGrasscutterWithGame() {
    const changedVal = !(await getConfigOption('grasscutter_with_game'))
    setConfigOption('grasscutter_with_game', changedVal)

    this.setState({
      grasscutter_with_game: changedVal,
    })
  }

  async setCustomBackground(value: string) {
    const isUrl = /^(?:http(s)?:\/\/)/gm.test(value)

    if (!value) return await setConfigOption('custom_background', '')

    if (!isUrl) {
      const filename = value.replace(/\\/g, '/').split('/').pop()
      const localBgPath = ((await dataDir()) as string).replace(/\\/g, '/')

      await setConfigOption('custom_background', `${localBgPath}/cultivation/bg/${filename}`)

      // Copy the file over to the local directory
      await invoke('copy_file', {
        path: value.replace(/\\/g, '/'),
        newPath: `${localBgPath}cultivation/bg/`,
      })

      window.location.reload()
    } else {
      await setConfigOption('custom_background', value)
      window.location.reload()
    }
  }

  async toggleEncryption() {
    const config = await getConfig()

    // Check if grasscutter path is set
    if (!config.grasscutter_path) {
      alert('Grasscutter not set!')
      return
    }

    // Remove jar from path
    const path = config.grasscutter_path.replace(/\\/g, '/')
    const folderPath = path.substring(0, path.lastIndexOf('/'))

    await server.toggleEncryption(folderPath + '/config.json')

    this.setState({
      encryption: await server.encryptionEnabled(folderPath + '/config.json'),
    })

    // Check if Grasscutter is running, and restart if so to apply changes
    if (await invoke('is_grasscutter_running')) {
      alert('Automatically restarting Grasscutter to apply encryption changes!')
      await invoke('restart_grasscutter')
    }
  }

  async toggleUnElevatedGame() {
    const changedVal = !(await getConfigOption('un_elevated'))
    setConfigOption('un_elevated', changedVal)

    this.setState({
      un_elevated: changedVal,
    })
  }

  async removeRSA() {
    await meta.unpatchGame()
  }

  async addMigotoDelay() {
    invoke('set_migoto_delay', {
      migotoPath: this.state.migoto_path,
    })
  }

  async installCert() {
    await invoke('generate_ca_files', {
      path: (await dataDir()) + 'cultivation',
    })
  }

  async toggleOption(opt: keyof Configuration) {
    const changedVal = !(await getConfigOption(opt))

    await setConfigOption(opt, changedVal)

    // @ts-expect-error shut up bitch
    this.setState({
      [opt]: changedVal,
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Options" heading="Options">
        {!this.state.platform || this.state.platform === 'windows' ? (
          <div className="OptionSection" id="menuOptionsContainerGamePath">
            <div className="OptionLabel" id="menuOptionsLabelGamePath">
              <Tr text="options.game_path" />
            </div>
            <div className="OptionValue" id="menuOptionsDirGamePath">
              <DirInput onChange={this.setGameExecutable} value={this.state?.game_install_path} extensions={['exe']} />
            </div>
          </div>
        ) : (
          <div className="OptionSection" id="menuOptionsContainerGameCommand">
            <div className="OptionLabel" id="menuOptionsLabelGameCommand">
              <Tr text="options.game_command" />
            </div>
            <div className="OptionValue" id="menuOptionsGameCommand">
              <TextInput />
            </div>
          </div>
        )}
        <div className="OptionSection" id="menuOptionsContainermetaDownload">
          <div className="OptionLabel" id="menuOptionsLabelmetaDownload">
            <Tr text="options.recover_rsa" />
            <HelpButton contents="help.emergency_rsa" />
          </div>
          <div className="OptionValue" id="menuOptionsButtonmetaDownload">
            <BigButton onClick={this.removeRSA} id="metaDownload">
              <Tr text="components.delete" />
            </BigButton>
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerPatchMeta">
          <div className="OptionLabel" id="menuOptionsLabelPatchMeta">
            <Tr text="options.patch_rsa" />
            <HelpButton contents="help.patch_rsa" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxPatchMeta">
            <Checkbox onChange={() => this.toggleOption('patch_rsa')} checked={this.state?.patch_rsa} id="patchMeta" />
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerUseProxy">
          <div className="OptionLabel" id="menuOptionsLabelUseProxy">
            <Tr text="options.use_proxy" />
            <HelpButton contents="help.use_proxy" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxUseProxy">
            <Checkbox
              onChange={() => this.toggleOption('use_internal_proxy')}
              checked={this.state?.use_internal_proxy}
              id="useProxy"
            />
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerWipeLogin">
          <div className="OptionLabel" id="menuOptionsLabelWipeLogin">
            <Tr text="options.wipe_login" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxWipeLogin">
            <Checkbox
              onChange={() => this.toggleOption('wipe_login')}
              checked={this.state?.wipe_login}
              id="wipeLogin"
            />
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerAutoMongodb">
          <div className="OptionLabel" id="menuOptionsLabelAutoMongodb">
            <Tr text="options.auto_mongodb" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxAutoMongodb">
            <Checkbox
              onChange={() => this.toggleOption('auto_mongodb')}
              checked={this.state?.auto_mongodb}
              id="autoMongodb"
            />
          </div>
        </div>

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerGCJar">
          <div className="OptionLabel" id="menuOptionsLabelGCJar">
            <Tr text="options.grasscutter_jar" />
          </div>
          <div className="OptionValue" id="menuOptionsDirGCJar">
            <DirInput onChange={this.setGrasscutterJar} value={this.state?.grasscutter_path} extensions={['jar']} />
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerToggleEnc">
          <div className="OptionLabel" id="menuOptionsLabelToggleEnc">
            <Tr text="options.toggle_encryption" />
            <HelpButton contents="help.encryption" />
          </div>
          <div className="OptionValue" id="menuOptionsButtonToggleEnc">
            <Checkbox onChange={() => this.toggleEncryption()} checked={this.state.encryption} id="toggleEnc" />
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerInstallCert">
          <div className="OptionLabel" id="menuOptionsLabelInstallCert">
            <Tr text="options.install_certificate" />
          </div>
          <div className="OptionValue" id="menuOptionsButtonInstallCert">
            <BigButton disabled={false} onClick={this.installCert} id="installCert">
              <Tr text="components.install" />
            </BigButton>
          </div>
        </div>
        {this.state.swag && (
          <>
            <Divider />
            <div className="OptionSection" id="menuOptionsContainerAkebi">
              <div className="OptionLabel" id="menuOptionsLabelAkebi">
                <Tr text="swag.akebi" />
              </div>
              <div className="OptionValue" id="menuOptionsDirAkebi">
                <DirInput onChange={this.setAkebi} value={this.state?.akebi_path} extensions={['exe']} />
              </div>
            </div>
            <div className="OptionSection" id="menuOptionsContainerMigoto">
              <div className="OptionLabel" id="menuOptionsLabelMigoto">
                <Tr text="swag.migoto" />
              </div>
              <div className="OptionValue" id="menuOptionsDirMigoto">
                <SmallButton onClick={this.addMigotoDelay} id="migotoDelay" contents="help.add_delay"></SmallButton>
                <DirInput onChange={this.setMigoto} value={this.state?.migoto_path} extensions={['exe']} />
              </div>
            </div>
            <div className="OptionSection" id="menuOptionsContainerReshade">
              <div className="OptionLabel" id="menuOptionsLabelReshade">
                <Tr text="swag.reshade" />
              </div>
              <div className="OptionValue" id="menuOptionsDirReshade">
                <DirInput onChange={this.setReshade} value={this.state?.reshade_path} extensions={['exe']} />
              </div>
            </div>
          </>
        )}

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerGCWGame">
          <div className="OptionLabel" id="menuOptionsLabelGCWDame">
            <Tr text="options.grasscutter_with_game" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxGCWGame">
            <Checkbox
              onChange={() => this.toggleOption('grasscutter_with_game')}
              checked={this.state?.grasscutter_with_game}
              id="gcWithGame"
            />
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerUEGame">
          <div className="OptionLabel" id="menuOptionsLabelUEGame">
            <Tr text="options.un_elevated" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxUEGame">
            <Checkbox
              onChange={() => this.toggleOption('un_elevated')}
              checked={this.state?.un_elevated}
              id="unElevatedGame"
            />
          </div>
        </div>
        {this.state.swag ? (
          <div className="OptionSection" id="menuOptionsContainerHorny">
            <div className="OptionLabel" id="menuOptionsLabelHorny">
              <Tr text="options.horny_mode" />
            </div>
            <div className="OptionValue" id="menuOptionsCheckboxHorny">
              <Checkbox
                onChange={() => this.toggleOption('horny_mode')}
                checked={this.state?.horny_mode}
                id="hornyMode"
              />
            </div>
          </div>
        ) : null}

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerThemes">
          <div className="OptionLabel" id="menuOptionsLabelThemes">
            <Tr text="options.theme" />
          </div>
          <div className="OptionValue" id="menuOptionsSelectThemes">
            <select
              value={this.state.theme}
              id="menuOptionsSelectMenuThemes"
              onChange={(event) => {
                this.setTheme(event.target.value)
              }}
            >
              {this.state.themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerJavaPath">
          <div className="OptionLabel" id="menuOptionsLabelJavaPath">
            <Tr text="options.java_path" />
          </div>
          <div className="OptionValue" id="menuOptionsDirJavaPath">
            <DirInput onChange={this.setJavaPath} value={this.state?.java_path} extensions={['exe']} />
          </div>
        </div>

        <div className="OptionSection" id="menuOptionsContainerBG">
          <div className="OptionLabel" id="menuOptionsLabelBG">
            <Tr text="options.background" />
          </div>
          <div className="OptionValue" id="menuOptionsDirBG">
            <DirInput
              onChange={this.setCustomBackground}
              value={this.state?.bg_url_or_path}
              extensions={['png', 'jpg', 'jpeg']}
              readonly={false}
              clearable={true}
              customClearBehaviour={async () => {
                await setConfigOption('custom_background', '')
                window.location.reload()
              }}
            />
          </div>
        </div>

        <div className="OptionSection" id="menuOptionsContainerLang">
          <div className="OptionLabel" id="menuOptionsLabelLang">
            <Tr text="options.language" />
          </div>
          <div className="OptionValue" id="menuOptionsSelectLang">
            <select
              value={this.state.current_language}
              id="menuOptionsSelectMenuLang"
              onChange={(event) => {
                this.setLanguage(event.target.value)
              }}
            >
              {this.state.language_options.map((lang) => (
                <option key={Object.keys(lang)[0]} value={Object.keys(lang)[0]}>
                  {lang[Object.keys(lang)[0]]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Menu>
    )
  }
}
