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

interface IProps {
  closeFn: () => void;
}

interface IState {
  game_install_path: string
  grasscutter_path: string
  java_path: string
  grasscutter_with_game: boolean
  language_options: { [key: string]: string }[],
  current_language: string
  bg_url_or_path: string
  themes: string[]
  theme: string
  encryption: boolean
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
      encryption: false
    }

    this.setGameExec = this.setGameExec.bind(this)
    this.setGrasscutterJar = this.setGrasscutterJar.bind(this)
    this.setJavaPath = this.setJavaPath.bind(this)
    this.toggleGrasscutterWithGame = this.toggleGrasscutterWithGame.bind(this)
    this.setCustomBackground = this.setCustomBackground.bind(this)
    this.toggleEncryption = this.toggleEncryption.bind(this)
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
      themes: (await getThemeList()).map(t => t.name),
      theme: config.theme || 'default',
      encryption: await translate(encEnabled ? 'options.enabled' : 'options.disabled')
    })

    this.forceUpdate()
  }

  setGameExec(value: string) {
    setConfigOption('game_install_path', value)

    this.setState({
      game_install_path: value
    })
  }

  setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value)

    this.setState({
      grasscutter_path: value
    })
  }

  setJavaPath(value: string) {
    setConfigOption('java_path', value)

    this.setState({
      java_path: value
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
      grasscutter_with_game: changedVal
    })
  }

  async setCustomBackground(value: string) {
    const isUrl = /^(?:http(s)?:\/\/)/gm.test(value)

    if (!value) return await setConfigOption('customBackground', '')

    if (!isUrl) {
      const filename = value.replace(/\\/g, '/').split('/').pop()
      const localBgPath = (await dataDir() as string).replace(/\\/g, '/')
  
      await setConfigOption('customBackground', `${localBgPath}/cultivation/bg/${filename}`)
  
      // Copy the file over to the local directory
      await invoke('copy_file', {
        path: value.replace(/\\/g, '/'),
        newPath: `${localBgPath}cultivation/bg/`
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
      encryption: await translate(await server.encryptionEnabled(folderPath + '/config.json') ? 'options.enabled' : 'options.disabled')
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Options" heading="Options">
        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.game_exec" />
          </div>
          <div className='OptionValue'>
            <DirInput onChange={this.setGameExec} value={this.state?.game_install_path} extensions={['exe']} />
          </div>
        </div>
        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.grasscutter_jar" />
          </div>
          <div className='OptionValue'>
            <DirInput onChange={this.setGrasscutterJar} value={this.state?.grasscutter_path} extensions={['jar']} />
          </div>
        </div>
        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.toggle_encryption" />
          </div>
          <div className='OptionValue'>
            <BigButton onClick={this.toggleEncryption} id="toggleEnc">
              {
                this.state.encryption
              }
            </BigButton>
          </div>
        </div>

        <Divider />
        
        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.grasscutter_with_game" />
          </div>
          <div className='OptionValue'>
            <Checkbox onChange={this.toggleGrasscutterWithGame} checked={this.state?.grasscutter_with_game} id="gcWithGame" />
          </div>
        </div>

        <Divider />

        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.theme" />
          </div>
          <div className='OptionValue'>
            <select value={this.state.theme} onChange={(event) => {
              this.setTheme(event.target.value)
            }}>
              {this.state.themes.map(t => (
                <option
                  key={t}
                  value={t}>

                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Divider />

        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.java_path" />
          </div>
          <div className='OptionValue'>
            <DirInput onChange={this.setJavaPath} value={this.state?.java_path} extensions={['exe']} />
          </div>
        </div>

        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.background" />
          </div>
          <div className='OptionValue'>
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

        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.language" />
          </div>
          <div className='OptionValue'>
            <select value={this.state.current_language} onChange={(event) => {
              this.setLanguage(event.target.value)
            }}>
              {this.state.language_options.map(lang => (
                <option
                  key={Object.keys(lang)[0]}
                  value={Object.keys(lang)[0]}>

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