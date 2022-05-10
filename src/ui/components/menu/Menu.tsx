import React from 'react'
import './Menu.css'

interface IProps {
  children: React.ReactNode[] | React.ReactNode;
  className?: string;
  heading: string;
}

export default class Menu extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <div className={'Menu ' + this.props.className}>
        <div className="MenuHeading">{this.props.heading}</div>
        <div className='MenuInner'>
          {this.props.children}
        </div>
      </div>
    )
  }
}