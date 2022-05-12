import React from 'react'
import Checkbox from './common/Checkbox'
import BigButton from './common/BigButton'
import { getConfig, saveConfig } from '../../utils/configuration'
import Tr, { translate } from '../../utils/language'
import { invoke } from '@tauri-apps/api/tauri'

import './ServerLaunchSection.css'

interface IProps {
  [key: string]: any
}

interface IState {
  grasscutterEnabled: boolean;
  buttonLabel: string;
  checkboxLabel: string;
}

export default class ServerLaunchSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      grasscutterEnabled: false,
      buttonLabel: '',
      checkboxLabel: ''
    }

    this.toggleGrasscutter = this.toggleGrasscutter.bind(this)
    this.playGame = this.playGame.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      grasscutterEnabled: config.toggle_grasscutter,
      buttonLabel: await translate('main.launch_button'),
      checkboxLabel: await translate('main.gc_enable')
    })

    console.log(this.state)
  }

  async toggleGrasscutter() {
    const config = await getConfig()

    config.toggle_grasscutter = !config.toggle_grasscutter

    await saveConfig(config)
  }

  async playGame() {
    const config = await getConfig()
  
    if (!config.game_path) return
    
    // Connect to proxy
    if (config.toggle_grasscutter) await invoke('connect', { port: 8365 })
  
    // Launch the program
    await invoke('run_program', { path: config.game_path })
  }

  render() {
    return (
      <div id="playButton">
        <div id="serverControls">
          <Checkbox id="enableGC" label={this.state.checkboxLabel} onChange={this.toggleGrasscutter} checked={this.state.grasscutterEnabled}/>
        </div>
        <BigButton text={this.state.buttonLabel} onClick={this.playGame} id="officialPlay" />
      </div>
    )
  }
}