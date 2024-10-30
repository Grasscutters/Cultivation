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
import SmallButton from '../common/SmallButton'
import { ask, confirm } from '@tauri-apps/api/dialog'
import TextInput from '../common/TextInput'
import { unzip } from '../../../utils/zipUtils'
import { getGameExecutable } from '../../../utils/game'
import { emit } from '@tauri-apps/api/event'

export enum GrasscutterElevation {
  None = 'None',
  Capability = 'Capability',
  Root = 'Root',
}

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
  use_theme_background: boolean
  encryption: boolean
  patch_rsa: boolean
  use_internal_proxy: boolean
  wipe_login: boolean
  horny_mode: boolean
  auto_mongodb: boolean
  swag: boolean
  platform: string
  un_elevated: boolean
  redirect_more: boolean
  launch_args: string
  offline_mode: boolean
  newer_game: boolean

  // Linux stuff
  grasscutter_elevation: string

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
      use_theme_background: false,
      encryption: false,
      patch_rsa: false,
      use_internal_proxy: false,
      wipe_login: false,
      horny_mode: false,
      swag: false,
      auto_mongodb: false,
      platform: '',
      un_elevated: false,
      redirect_more: false,
      launch_args: '',
      offline_mode: false,
      newer_game: false,

      // Linux stuff
      grasscutter_elevation: GrasscutterElevation.None,

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
    this.deleteWebCache = this.deleteWebCache.bind(this)
    this.addMigotoDelay = this.addMigotoDelay.bind(this)
    this.toggleUnElevatedGame = this.toggleUnElevatedGame.bind(this)
    this.setLaunchArgs = this.setLaunchArgs.bind(this)
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
      use_theme_background: config.use_theme_background || false,
      encryption: encEnabled || false,
      patch_rsa: config.patch_rsa || false,
      use_internal_proxy: config.use_internal_proxy || false,
      wipe_login: config.wipe_login || false,
      horny_mode: config.horny_mode || false,
      swag: config.swag_mode || false,
      auto_mongodb: config.auto_mongodb || false,
      platform,
      un_elevated: config.un_elevated || false,
      redirect_more: config.redirect_more || false,
      launch_args: config.launch_args,
      offline_mode: config.offline_mode || false,
      newer_game: config.newer_game || false,

      // Linux stuff
      grasscutter_elevation: config.grasscutter_elevation || GrasscutterElevation.None,

      // Swag stuff
      akebi_path: config.akebi_path || '',
      migoto_path: config.migoto_path || '',
      reshade_path: config.reshade_path || '',
    })

    this.forceUpdate()
  }

  async setGameExecutable(value: string) {
    await setConfigOption('game_install_path', value)

    // I hope this stops people setting launcher.exe because oml it's annoying
    if (value.endsWith('launcher.exe') || value.endsWith('.lnk')) {
      const pathArr = value.replace(/\\/g, '/').split('/')
      pathArr.pop()
      const path = pathArr.join('/') + '/Genshin Impact Game/'

      if (value.endsWith('.lnk')) {
        alert(
          'You have set your game executable to a shortcut. You should not do this. Your patching will not work, and your proxy may shut off unexpectedly.'
        )
      } else {
        alert(
          `You have set your game execuatable to "launcher.exe". You should not do this. Your game executable is located in:\n\n${path}`
        )
      }
    }

    // If setting any other game, automatically set to redirect more
    if (!value.toLowerCase().includes('genshin') || !value.toLowerCase().includes('yuanshen')) {
      if (!this.state.redirect_more) {
        this.toggleOption('redirect_more')
      }
    }

    this.setState({
      game_install_path: value,
    })

    emit('set_game', { game_path: value })
  }

  async setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value)
    const config = await getConfig()
    const path = config.grasscutter_path.replace(/\\/g, '/')
    const folderPath = path.substring(0, path.lastIndexOf('/'))
    const encEnabled = await server.encryptionEnabled(folderPath + '/config.json')

    this.setState({
      grasscutter_path: value,
      encryption: encEnabled,
    })

    // Encryption refuses to re-render w/o reload unless updated twice
    this.forceUpdateEncyption()
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

  async forceUpdateEncyption() {
    const config = await getConfig()
    const path = config.grasscutter_path.replace(/\\/g, '/')
    const folderPath = path.substring(0, path.lastIndexOf('/'))

    this.setState({
      encryption: await server.encryptionEnabled(folderPath + '/config.json'),
    })
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

    if (!(await server.encryptionEnabled(folderPath + '/config.json'))) {
      if (
        !(await confirm(
          'Cultivation requires encryption DISABLED to connect and play locally. \n\n Are you sure you want to enable encryption?',
          'Warning!'
        ))
      ) {
        return
      }
    }

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

  async setGCElevation(value: string) {
    setConfigOption('grasscutter_elevation', value)

    this.setState({
      grasscutter_elevation: value,
    })
  }

  async removeRSA() {
    await meta.unpatchGame()
  }

  async addMigotoDelay() {
    if (
      !(await ask(
        'Set delay for 3dmigoto loader? This is specifically made for GIMI v6 and earlier. Using it on latest GIMI or SRMI will cause issues!!! \n\nWould you like to continue?',
        { title: 'GIMI Delay', type: 'warning' }
      ))
    ) {
      return
    }

    invoke('set_migoto_delay', {
      migotoPath: this.state.migoto_path,
    })
  }

  async installCert() {
    await invoke('generate_ca_files', {
      path: (await dataDir()) + 'cultivation',
    })
  }

  async deleteWebCache() {
    if (await ask('Would you like to clear login cache? Yes to clear login cache. No to clear web cache.')) {
      await invoke('wipe_registry', {
        // The exe is always PascalCase so we can get the dir using regex
        execName: (await getGameExecutable())?.split('.exe')[0].replace(/([a-z\d])([A-Z])/g, '$1 $2'),
      })
      alert('Cleared login cache!')
      return
    }

    alert('Cultivation may freeze for a moment while this occurs!')

    // Get webCaches folder path
    const pathArr = this.state.game_install_path.replace(/\\/g, '/').split('/')
    pathArr.pop()
    const path = pathArr.join('/') + '/GenshinImpact_Data/webCaches'
    const path2 = pathArr.join('/') + '/Yuanshen_Data/webCaches'

    // Delete the folder
    if (await invoke('dir_exists', { path: path })) {
      await invoke('dir_delete', { path: path })
    }
    if (await invoke('dir_exists', { path: path2 })) {
      await invoke('dir_delete', { path: path2 })
    }
  }

  async fixRes() {
    const config = await getConfig()

    const path = config.grasscutter_path.replace(/\\/g, '/')
    let folderPath = path.substring(0, path.lastIndexOf('/'))

    // Set to default if not set
    if (!path || path === '') {
      const appdata = await dataDir()
      folderPath = appdata + 'cultivation\\grasscutter'
    }

    if (path.includes('/')) {
      folderPath = path.substring(0, path.lastIndexOf('/'))
    } else {
      folderPath = path.substring(0, path.lastIndexOf('\\'))
    }

    // Check if Grasscutter path exists
    if (folderPath.length < 1) {
      alert('Grasscutter not installed or not set! This option can only work when it is installed.')
      return
    }

    // Check if resources zip exists
    if (
      !(await invoke('dir_exists', {
        path: folderPath + '\\GC-Resources-4.0.zip',
      }))
    ) {
      alert('Resources are already unzipped or do not exist! Ensure your resources zip is named "GC-Resources-4.0.zip"')
      return
    }

    alert(
      'This may fix white screen issues on login! Please be patient while extraction occurs, it may take some time (5-10 minutes). \n\n !! You will be alerted when it is done !!'
    )

    // Unzip resources
    await unzip(folderPath + '\\GC-Resources-4.0.zip', folderPath + '\\', true)
    // Rename folder to resources
    invoke('rename', {
      path: folderPath + '\\Resources',
      newName: 'resources',
    })

    // Update config.json to read from folder
    await server.changeResourcePath(folderPath + '/config.json')

    // Check if Grasscutter is running, and restart if so to apply changes
    if (await invoke('is_grasscutter_running')) {
      alert('Automatically restarting Grasscutter for changes to apply!')
      await invoke('restart_grasscutter')
    }

    alert('Resource fixing finished! Please launch the server again and try playing.')
  }

  async toggleOption(opt: keyof Configuration) {
    const changedVal = !(await getConfigOption(opt))

    await setConfigOption(opt, changedVal)

    // @ts-expect-error shut up bitch
    this.setState({
      [opt]: changedVal,
    })
  }

  async setLaunchArgs(value: string) {
    await setConfigOption('launch_args', value)

    this.setState({
      launch_args: value,
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Options" heading="Options">
        <div className="OptionSection" id="menuOptionsContainerGamePath">
          <div className="OptionLabel" id="menuOptionsLabelGamePath">
            <Tr text="options.game_path" />
          </div>
          <div className="OptionValue" id="menuOptionsDirGamePath">
            <DirInput onChange={this.setGameExecutable} value={this.state?.game_install_path} extensions={['exe']} />
          </div>
        </div>
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
        <div className="OptionSection" id="menuOptionsContainerRedirect">
          <div className="OptionLabel" id="menuOptionsLabelRedirect">
            <Tr text="options.redirect_more" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxRedirect">
            <Checkbox
              onChange={() => this.toggleOption('redirect_more')}
              checked={this.state?.redirect_more}
              id="RedirectMore"
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
        {this.state.platform === 'linux' && (
          <>
            <Divider />
            <div className="OptionSection" id="menuOptionsContainerGCElevation">
              <div className="OptionLabel" id="menuOptionsLabelGCElevation">
                <Tr text="options.grasscutter_elevation" />
                <HelpButton contents="help.grasscutter_elevation_help_text" />
              </div>
              <select
                value={this.state.grasscutter_elevation}
                id="menuOptionsSelectGCElevation"
                onChange={(event) => {
                  this.setGCElevation(event.target.value)
                }}
              >
                {Object.keys(GrasscutterElevation).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="OptionSection" id="menuOptionsContainerCheckAAGL">
              <div className="OptionLabel" id="menuOptionsLabelCheckAAGL">
                <Tr text="options.check_aagl" />
              </div>
            </div>
          </>
        )}
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
                <SmallButton onClick={this.addMigotoDelay} id="migotoDelay"></SmallButton>
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
        {this.state.platform !== 'linux' && (
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
        )}
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
        <div className="OptionSection" id="menuOptionsContainerOffline">
          <div className="OptionLabel" id="menuOptionsLabelOffline">
            <Tr text="options.offline_mode" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxOffline">
            <Checkbox
              onChange={() => this.toggleOption('offline_mode')}
              checked={this.state?.offline_mode}
              id="offlineMode"
            />
          </div>
        </div>

        <div className="OptionSection" id="menuOptionsContainerNewerGame">
          <div className="OptionLabel" id="menuOptionsLabelNewerGame">
            <Tr text="Patch Mihoyonet" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxNewerGame">
            <Checkbox
              onChange={() => this.toggleOption('newer_game')}
              checked={this.state?.newer_game}
              id="newerGame"
            />
          </div>
        </div>

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

        <div className="OptionSection" id="menuOptionsContainerUseThemeBG">
          <div className="OptionLabel" id="menuOptionsLabelUseThemeBG">
            <Tr text="options.use_theme_background" />
          </div>
          <div className="OptionValue" id="menuOptionsUseThemeBG">
            <Checkbox
              onChange={() => this.toggleOption('use_theme_background')}
              checked={this.state?.use_theme_background}
              id="useThemeBG"
            />
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

        <Divider />

        <div className="OptionSection" id="menuOptionsContainerAdvanced">
          <div className="OptionLabel" id="menuOptionsLabelWebCache">
            <Tr text="options.web_cache" />
          </div>
          <div className="OptionValue" id="menuOptionsButtondeleteWebcache">
            <BigButton onClick={this.deleteWebCache} id="deleteWebcache">
              <Tr text="components.delete" />
            </BigButton>
          </div>
          <div className="OptionLabel" id="menuOptionsLaunchArgs">
            <Tr text="options.launch_args" />
          </div>
          <TextInput
            id="launch_args"
            key="launch_args"
            placeholder={'-arg=value'}
            onChange={this.setLaunchArgs}
            value={this.state.launch_args}
          />
        </div>

        <div className="OptionLabel" id="menuOptionsLabelFixRes">
          <Tr text="options.fix_res" />
        </div>
        <div className="OptionValue" id="menuOptionsButtonfixRes">
          <BigButton onClick={this.fixRes} id="fixRes">
            <Tr text="components.fix" />
          </BigButton>
        </div>
      </Menu>
    )
  }
}
