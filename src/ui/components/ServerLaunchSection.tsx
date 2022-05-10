import React from 'react'
import Checkbox from './common/Checkbox'
import BigButton from './common/BigButton'
import { getConfig, saveConfig } from '../../utils/configuration'
import { invoke } from '@tauri-apps/api/tauri'

interface IProps {
  [key: string]: any
}

interface IState {
  grasscutterEnabled: boolean
}

export default class ServerLaunchSection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      grasscutterEnabled: false
    }

    this.toggleGrasscutter = this.toggleGrasscutter.bind(this)
    this.playGame = this.playGame.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      grasscutterEnabled: config.toggle_grasscutter
    })
  }

  async toggleGrasscutter() {
    const config = await getConfig()

    config.toggle_grasscutter = !config.toggle_grasscutter

    await saveConfig(config)
  }

  async playGame() {
    const config = await getConfig()
  
    if (!config.game_path) return
  
    // Launch the program
    await invoke('run_program', { path: config.game_path })
  }
  

  render() {
    return (
      <div id="playButton">
        <div id="serverControls">
          <Checkbox id="enableGC" label="Connect via Grasscutter" onChange={this.toggleGrasscutter} checked={this.state.grasscutterEnabled}/>
        </div>
        <BigButton text="Launch" onClick={this.playGame} id="officialPlay" />
      </div>
    )
  }
}