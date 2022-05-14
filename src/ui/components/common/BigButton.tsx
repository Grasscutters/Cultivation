import React from 'react'
import './BigButton.css'

interface IProps {
  children: React.ReactNode;
  onClick: () => any;
  id: string;
}

export default class BigButton extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    this.props.onClick()
  }

  render() {
    return (
      <div className="BigButton" onClick={this.handleClick} id={this.props.id}>
        <div className="BigButtonText">{this.props.children}</div>
      </div>
    )
  }
}