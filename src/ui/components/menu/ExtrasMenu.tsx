import React from 'react'
import { getConfig, saveConfig } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Menu from './Menu'

import './ExtrasMenu.css'
import BigButton from '../common/BigButton'
import { invoke } from '@tauri-apps/api'
import Tr from '../../../utils/language'
import { getGameExecutable } from '../../../utils/game'

interface IProps {
  children: React.ReactNode | React.ReactNode[]
  closeFn: () => void
  playGame: (exe?: string, proc_name?: string) => void
}

interface IState {
  migoto?: string
  akebi?: string
  reshade?: string
  launch_migoto: boolean
  launch_akebi: boolean
  launch_reshade: boolean
}

export class ExtrasMenu extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      launch_migoto: false,
      launch_akebi: false,
      launch_reshade: false,
    }

    this.launchPreprograms = this.launchPreprograms.bind(this)
    this.toggleMigoto = this.toggleMigoto.bind(this)
    this.toggleAkebi = this.toggleAkebi.bind(this)
    this.toggleReshade = this.toggleReshade.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      migoto: config.migoto_path,
      akebi: config.akebi_path,
      reshade: config.reshade_path,
      launch_akebi: config?.last_extras?.akebi ?? false,
      launch_migoto: config?.last_extras?.migoto ?? false,
      launch_reshade: config?.last_extras?.reshade ?? false,
    })
  }

  async launchPreprograms() {
    const config = await getConfig()

    config.last_extras = {
      migoto: this.state.launch_migoto,
      akebi: this.state.launch_akebi,
      reshade: this.state.launch_reshade,
    }

    await saveConfig(config)

    // Close menu
    this.props.closeFn()

    // This injects independent of the game
    if (this.state.launch_migoto) {
      if (await this.launchMigoto()) {
        // Already launched the game (ie. via XXMI)
        return
      }
    }

    // This injects independent of the game
    if (this.state.launch_reshade) {
      await this.launchReshade()
    }

    // This will launch the game
    if (this.state.launch_akebi) {
      await this.launchAkebi()

      // This already launches the game
      return
    }

    // Launch the game
    await this.props.playGame()
  }

  async launchAkebi() {
    const config = await getConfig()

    // Get game exe from game path, so we can watch it
    const pathArr = config.game_install_path.replace(/\\/g, '/').split('/')
    const gameExec = pathArr[pathArr.length - 1]

    await this.props.playGame(config.akebi_path, gameExec)
  }

  async launchMigoto() {
    const config = await getConfig()

    if (!config.migoto_path) return alert('Migoto not installed or set!')

    if (config.migoto_path?.toLowerCase().includes('xxmi')) {
      // Get game exe from game path, so we can watch it
      const pathArr = config.migoto_path.replace(/\\/g, '/').split('/')
      const gameExec = pathArr[pathArr.length - 1]

      this.props.playGame(config.migoto_path, gameExec)
      return true
    }

    await invoke('run_program_relative', { path: config.migoto_path })
    return false
  }

  async launchReshade() {
    const config = await getConfig()

    if (!config.reshade_path) return alert('Reshade not installed or set!')

    await invoke('run_command', {
      program: config.reshade_path,
      args: [await getGameExecutable()],
      relative: true,
    })
  }

  toggleMigoto() {
    this.setState({
      launch_migoto: !this.state.launch_migoto,
    })
  }

  toggleAkebi() {
    this.setState({
      launch_akebi: !this.state.launch_akebi,
    })
  }

  toggleReshade() {
    this.setState({
      launch_reshade: !this.state.launch_reshade,
    })
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} heading="Extras" className="ExtrasMenu">
        <div className="ExtrasMenuContent">
          {this.state.migoto && (
            <div className="ExtraItem">
              <div className="ExtraItemLabel">
                <Tr text="swag.migoto_name" />
              </div>
              <Checkbox id="MigotoCheckbox" checked={this.state.launch_migoto} onChange={this.toggleMigoto} />
            </div>
          )}

          {this.state.akebi && (
            <div className="ExtraItem">
              <div className="ExtraItemLabel">
                <Tr text="swag.akebi_name" />
              </div>
              <Checkbox id="AkebiCheckbox" checked={this.state.launch_akebi} onChange={this.toggleAkebi} />
            </div>
          )}

          {this.state.reshade && (
            <div className="ExtraItem">
              <div className="ExtraItemLabel">
                <Tr text="swag.reshade_name" />
              </div>
              <Checkbox id="ReshadeCheckbox" checked={this.state.launch_reshade} onChange={this.toggleReshade} />
            </div>
          )}
        </div>
        <div className="ExtraLaunch">
          <BigButton id="ExtraLaunch" onClick={this.launchPreprograms}>
            <Tr text="main.launch_button" />
          </BigButton>
        </div>
      </Menu>
    )
  }
}
