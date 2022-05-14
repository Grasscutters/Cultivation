import React from 'react'
import Checkbox from './common/Checkbox'
import BigButton from './common/BigButton'
import { getConfig, saveConfig } from '../../utils/configuration'
import { translate } from '../../utils/language'
import { invoke } from '@tauri-apps/api/tauri'

import Server from '../../resources/icons/server.svg'
import './ServerLaunchSection.css'
import TextInput from './common/TextInput'

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
  
    if (!config.game_path) return
    
    // Connect to proxy
    if (config.toggle_grasscutter) await invoke('connect', { port: 8365 })
  
    // Launch the program
    await invoke('run_program', { path: config.game_path })
  }

  async launchServer() {
    const config = await getConfig()

    if (!config.grasscutter_path) return

    let jarFolder = config.grasscutter_path

    if (jarFolder.includes('/')) {
      jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('/'))
    } else {
      jarFolder = jarFolder.substring(0, config.grasscutter_path.lastIndexOf('\\'))
    }

    // Launch the jar
    await invoke('run_jar', {
      path: config.grasscutter_path,
      executeIn: jarFolder
    })
  }

  render() {
    return (
      <div id="playButton">
        <div id="serverControls">
          <Checkbox id="enableGC" label={this.state.checkboxLabel} onChange={this.toggleGrasscutter} checked={this.state.grasscutterEnabled}/>
        </div>

        <div className="ServerConfig">
          {
            this.state.grasscutterEnabled ?
              [ <TextInput id="ip" key="ip" placeholder="IP Address..." />,
                <TextInput id="port" key="port" placeholder="Port..." /> ]
              : null
          }
        </div>

        <div className="ServerLaunchButtons">
          <BigButton onClick={this.playGame} id="officialPlay">{this.state.buttonLabel}</BigButton>
          <BigButton onClick={this.launchServer} id="serverLaunch">
            <img className="ServerIcon" src={Server} />
          </BigButton>
        </div>

      </div>
    )
  }
}