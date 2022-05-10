import React from 'react'

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
        {this.props.children}
      </div>
    )
  }
}