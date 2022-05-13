import React from 'react'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import Tr from '../../../utils/language'
import './Options.css'
import { setConfigOption } from '../../../utils/configuration'

interface IProps {
  closeFn: () => void;
}

export default class Options extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
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
            <DirInput onChange={this.setGameExec} />
          </div>
        </div>
      </Menu>
    )
  }
}