import React from 'react'
import { getConfig } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Menu from './Menu'

import './ExtrasMenu.css'
import BigButton from '../common/BigButton'
import { invoke } from '@tauri-apps/api'
import Tr from '../../../utils/language'

interface IProps {
  children: React.ReactNode | React.ReactNode[]
  closeFn: () => void
  playGame: (exe?: string, proc_name?: string) => void
}

interface IState {
  migoto?: string
  akebi?: string
  launch_migoto: boolean
  launch_akebi: boolean
  reshade?: string
}

export class ExtrasMenu extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      launch_migoto: false,
      launch_akebi: false,
    }

    this.launchPreprograms = this.launchPreprograms.bind(this)
    this.toggleMigoto = this.toggleMigoto.bind(this)
    this.toggleAkebi = this.toggleAkebi.bind(this)
  }

  async componentDidMount() {
    const config = await getConfig()

    this.setState({
      migoto: config.migoto_path,
      akebi: config.akebi_path,
      // TODO reshade
    })
  }

  async launchPreprograms() {
    // This injects independent of the game
    if (this.state.launch_migoto) {
      await this.launchMigoto()
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

    await invoke('run_program_relative', { path: config.migoto_path })
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

  render() {
    return (
      <Menu closeFn={this.props.closeFn} heading="Extras" className="ExtrasMenu">
        <div className="ExtrasMenuContent">
          {this.state.migoto && (
            <div className="ExtraItem">
              <div className="ExtraItemLabel">Migoto</div>
              <Checkbox id="MigotoCheckbox" checked={this.state.launch_migoto} onChange={this.toggleMigoto} />
            </div>
          )}

          {this.state.akebi && (
            <div className="ExtraItem">
              <div className="ExtraItemLabel">Akebi</div>
              <Checkbox id="AkebiCheckbox" checked={this.state.launch_akebi} onChange={this.toggleAkebi} />
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
