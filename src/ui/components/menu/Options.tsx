import React from 'react'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr, { getLanguages } from '../../../utils/language'
import './Options.css'
import { setConfigOption, getConfig, getConfigOption } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Divider from './Divider'
import { invoke } from '@tauri-apps/api'

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
      bg_url_or_path: ''
    }

    this.toggleGrasscutterWithGame = this.toggleGrasscutterWithGame.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()
    const languages = await getLanguages()

    this.setState({
      game_install_path: config.game_install_path || '',
      grasscutter_path: config.grasscutter_path || '',
      java_path: config.java_path || '',
      grasscutter_with_game: config.grasscutter_with_game || false,
      language_options: languages,
      current_language: config.language || 'en',
      bg_url_or_path: config.customBackground || ''
    })

    this.forceUpdate()
  }

  setGameExec(value: string) {
    setConfigOption('game_install_path', value)
  }

  setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value)
  }

  setJavaPath(value: string) {
    setConfigOption('java_path', value)
  }

  setLanguage(value: string) {
    setConfigOption('language', value)
  }

  async toggleGrasscutterWithGame() {
    const changedVal = !(await getConfigOption('grasscutter_with_game'))
    setConfigOption('grasscutter_with_game', changedVal)

    this.setState({
      grasscutter_with_game: changedVal
    })
  }

  setCustomBackground() {
    setConfigOption('customBackground', this.state.bg_url_or_path)
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
            <DirInput onChange={this.setCustomBackground} readonly={false} value={this.state?.bg_url_or_path} extensions={['exe']} />
          </div>
        </div>

        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.language" />
          </div>
          <div className='OptionValue'>
            <select defaultValue={this.state.current_language} onChange={(event) => {
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