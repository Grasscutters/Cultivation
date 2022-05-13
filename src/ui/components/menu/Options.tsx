import React from 'react'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr from '../../../utils/language'
import './Options.css'
import { getConfigOption, setConfigOption } from '../../../utils/configuration'

interface IProps {
  closeFn: () => void;
}

interface IState {
  game_path: string
}

export default class Options extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      game_path: '',
    }
  }

  componentDidMount() {
    getConfigOption('game_path').then((value: string) => {
      this.setState({
        game_path: value || ''
      })
    })

    this.forceUpdate()
  }

  setGameExec(value: string) {
    setConfigOption('game_path', value)
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Options" heading="Options">
        <div className='OptionSection'>
          <div className='OptionLabel'>
            <Tr text="options.game_exec" />
          </div>
          <div className='OptionValue'>
            <DirInput onChange={this.setGameExec} value={this.state?.game_path}/>
          </div>
        </div>
      </Menu>
    )
  }
}