import React from 'react'
import Checkbox from '../common/Checkbox'
import Menu from './Menu'
import './Options.css'

export default class Options extends React.Component<Record<string, never>, never> {
  constructor(props: Record<string, never>) {
    super(props)
  }

  render() {
    return (
      <Menu className="Options" heading="Options">
        <div className='OptionSection'>
          <div className='OptionLabel'>Test Option</div>
          <div className='OptionValue'>
            <Checkbox id="testOption" label="" checked={true} onChange={() => console.log('Test Option Changed')} />
          </div>
        </div>
      </Menu>
    )
  }
}