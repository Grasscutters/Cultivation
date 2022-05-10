import React from 'react'
import './Menu.css'

import Close from '../../../resources/icons/close.svg'

interface IProps {
  children: React.ReactNode[] | React.ReactNode;
  className?: string;
  heading: string;
  closeFn: () => void;
}

export default class Menu extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <div className={'Menu ' + this.props.className}>
        <div className='MenuTop'>
          <div className="MenuHeading">{this.props.heading}</div>
          <div className="MenuExit" onClick={this.props.closeFn}>
            <img src={Close} className="MenuClose" />
          </div>
        </div>
        <div className='MenuInner'>
          {this.props.children}
        </div>
      </div>
    )
  }
}