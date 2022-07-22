import React from 'react'
import { invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr, { getLanguages, translate } from '../../../utils/language'
import { setConfigOption, getConfig, getConfigOption } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Divider from './Divider'
import { getThemeList } from '../../../utils/themes'
import * as server from '../../../utils/server'

import './Options.css'
import BigButton from '../common/BigButton'
import DownloadHandler from '../../../utils/download'
import * as meta from '../../../utils/metadata'

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
  patch_metadata: boolean
  use_internal_proxy: boolean
  swag: boolean

  // Swag stuff
  akebi_path: string
  migoto_path: string
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
      patch_metadata: false,
      use_internal_proxy: false,
      swag: false,

      // Swag stuff
      akebi_path: '',
      migoto_path: '',
    }

    this.setGameExecutable = this.setGameExecutable.bind(this)
    this.setGrasscutterJar = this.setGrasscutterJar.bind(this)
    this.setJavaPath = this.setJavaPath.bind(this)
    this.setAkebi = this.setAkebi.bind(this)
    this.toggleGrasscutterWithGame = this.toggleGrasscutterWithGame.bind(this)
    this.setCustomBackground = this.setCustomBackground.bind(this)
    this.toggleEncryption = this.toggleEncryption.bind(this)
    this.restoreMetadata = this.restoreMetadata.bind(this)
    this.toggleMetadata = this.toggleMetadata.bind(this)
    this.toggleProxy = this.toggleProxy.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()
    const languages = await getLanguages()

    // Remove jar from path
    const path = config.grasscutter_path.replace(/\\/g, '/')
    const folderPath = path.substring(0, path.lastIndexOf('/'))
    const encEnabled = await server.encryptionEnabled(folderPath + '/config.json')

    this.setState({
      game_install_path: config.game_install_path || '',
      grasscutter_path: config.grasscutter_path || '',
      java_path: config.java_path || '',
      grasscutter_with_game: config.grasscutter_with_game || false,
      language_options: languages,
      current_language: config.language || 'en',
      bg_url_or_path: config.customBackground || '',
      themes: (await getThemeList()).map((t) => t.name),
      theme: config.theme || 'default',
      encryption: await translate(encEnabled ? 'options.enabled' : 'options.disabled'),
      patch_metadata: config.patch_metadata || false,
      use_internal_proxy: config.use_internal_proxy || false,
      swag: config.swag_mode || false,

      // Swag stuff
      akebi_path: config.akebi_path || '',
      migoto_path: config.migoto_path || '',
    })

    this.forceUpdate()
  }

  setGameExecutable(value: string) {
    setConfigOption('game_install_path', value)

    this.setState({
      game_install_path: value,
    })
  }

  setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value)

    this.setState({
      grasscutter_path: value,
    })
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

    if (!value) return await setConfigOption('customBackground', '')

    if (!isUrl) {
      const filename = value.replace(/\\/g, '/').split('/').pop()
      const localBgPath = ((await dataDir()) as string).replace(/\\/g, '/')

      await setConfigOption('customBackground', `${localBgPath}/cultivation/bg/${filename}`)

      // Copy the file over to the local directory
      await invoke('copy_file', {
        path: value.replace(/\\/g, '/'),
        newPath: `${localBgPath}cultivation/bg/`,
      })

      window.location.reload()
    } else {
      await setConfigOption('customBackground', value)
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
      encryption: await translate(
        (await server.encryptionEnabled(folderPath + '/config.json')) ? 'options.enabled' : 'options.disabled'
      ),
    })
  }

  async restoreMetadata() {
    console.log(this.props)
    await meta.restoreMetadata(this.props.downloadManager)
  }

  async installCert() {
    await invoke('generate_ca_files', {
      path: (await dataDir()) + 'cultivation',
    })
  }

  async toggleMetadata() {
    const changedVal = !(await getConfigOption('patch_metadata'))

    await setConfigOption('patch_metadata', changedVal)

    this.setState({
      patch_metadata: changedVal,
    })
  }

  async toggleProxy() {
    const changedVal = !(await getConfigOption('use_internal_proxy'))

    await setConfigOption('use_internal_proxy', changedVal)

    this.setState({
      use_internal_proxy: changedVal,
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
            <Tr text="options.recover_metadata" />
          </div>
          <div className="OptionValue" id="menuOptionsButtonmetaDownload">
            <BigButton onClick={this.restoreMetadata} id="metaDownload">
              <Tr text="components.download" />
            </BigButton>
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerPatchMeta">
          <div className="OptionLabel" id="menuOptionsLabelPatchMeta">
            <Tr text="options.patch_metadata" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxPatchMeta">
            <Checkbox onChange={this.toggleMetadata} checked={this.state?.patch_metadata} id="patchMeta" />
          </div>
        </div>
        <div className="OptionSection" id="menuOptionsContainerUseProxy">
          <div className="OptionLabel" id="menuOptionsLabelUseProxy">
            <Tr text="options.use_proxy" />
          </div>
          <div className="OptionValue" id="menuOptionsCheckboxUseProxy">
            <Checkbox onChange={this.toggleProxy} checked={this.state?.use_internal_proxy} id="useProxy" />
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
          </div>
          <div className="OptionValue" id="menuOptionsButtonToggleEnc">
            <BigButton onClick={this.toggleEncryption} id="toggleEnc">
              {this.state.encryption}
            </BigButton>
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
                <DirInput onChange={this.setMigoto} value={this.state?.migoto_path} extensions={['exe']} />
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
              onChange={this.toggleGrasscutterWithGame}
              checked={this.state?.grasscutter_with_game}
              id="gcWithGame"
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
                await setConfigOption('customBackground', '')
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
