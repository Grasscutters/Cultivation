import React from 'react'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr from '../../../utils/language'
import './Options.css'
import { setConfigOption, getConfig } from '../../../utils/configuration'

interface IProps {
  closeFn: () => void;
}

interface IState {
  game_path: string
  grasscutter_path: string
}

export default class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      game_path: '',
      grasscutter_path: ''
    }
  }

  componentDidMount() {
    getConfig().then(config => {
      this.setState({
        game_path: config.game_path || '',
        grasscutter_path: config.grasscutter_path || ''
      })
    })

    this.forceUpdate()
  }

  setGameExec(value: string) {
    setConfigOption('game_path', value)
  }

  setGrasscutterJar(value: string) {
    setConfigOption('grasscutter_path', value)
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Options" heading="Options">
        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.game_exec" />
          </div>
          <div className='OptionValue'>
            <DirInput onChange={this.setGameExec} value={this.state?.game_path} extensions={['exe']} />
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
      </Menu>
    )
  }
}