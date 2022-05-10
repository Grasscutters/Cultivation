import React from 'react'
import Menu from './Menu'
import './Options.css'

export default class Options extends React.Component<{}, never> {
  constructor(props: Record<string, never>) {
    super(props)
  }

  render() {
    return (
      <Menu className="Options" heading="Options">
        <div className='OptionSection'>
          <div className='OptionLabel'>Test Option</div>
          <div className='OptionValue'>
            <input type="checkbox" />
          </div>
        </div>
      </Menu>
    )
  }
}