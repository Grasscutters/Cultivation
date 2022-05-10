import React from 'react'
import Checkbox from '../common/Checkbox'
import TextInput from '../common/TextInput'
import DirInput from '../common/DirInput'
import Menu from './Menu'
import './Options.css'

interface IProps {
  closeFn: () => void;
}

export default class Options extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <Menu closeFn={this.props.closeFn} className="Options" heading="Options">
        <div className='OptionSection'>
          <div className='OptionLabel'>Test Option</div>
          <div className='OptionValue'>
            <Checkbox id="testOption" label="" checked={true} onChange={() => console.log('Test Option Changed')} />
          </div>
        </div>
        <div className='OptionSection'>
          <div className='OptionLabel'>Test Input</div>
          <div className='OptionValue'>
            <TextInput placeholder='Test Value...' />
          </div>
        </div>
        <div className='OptionSection'>
          <div className='OptionLabel'>Test File Input</div>
          <div className='OptionValue'>
            <DirInput />
          </div>
        </div>
      </Menu>
    )
  }
}