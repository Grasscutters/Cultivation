import React from 'react'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr from '../../../utils/language'
import './Options.css'
import { setConfigOption, getConfig, getConfigOption } from '../../../utils/configuration'
import Checkbox from '../common/Checkbox'
import Divider from './Divider'

interface IProps {
  closeFn: () => void;
}

interface IState {
  game_install_path: string
  grasscutter_path: string
  grasscutter_with_game: boolean
}

export default class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      game_install_path: '',
      grasscutter_path: '',
      grasscutter_with_game: false
    }
  }

  componentDidMount() {
    getConfig().then(config => {
      this.setState({
        game_install_path: config.game_install_path || '',
        grasscutter_path: config.grasscutter_path || '',
        grasscutter_with_game: config.grasscutter_with_game || false
      })
    })

    this.forceUpdate()
  }

  setGameExec(value: string) {
    setConfigOption('game_install_path', value)
  }

  setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value)
  }

  async toggleGrasscutterWithGame() {
    setConfigOption('grasscutter_with_game', !(await getConfigOption('grasscutter_with_game')))
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
      </Menu>
    )
  }
}