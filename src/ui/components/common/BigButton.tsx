import React from 'react'
import './BigButton.css'

interface IProps {
  text: string;
  onClick: () => any;
  id: string;
}

interface IState {
  text: string;
}

export default class BigButton extends React.Component<IProps, IState> {

  constructor(props: { text: string, onClick: () => any, id: string }) {
    super(props)

    this.state = {
      text: props.text
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    this.props.onClick()
  }

  render() {
    return (
      <div className="BigButton" onClick={this.handleClick} id={this.props.id}>
        <div className="BigButtonText">{this.state.text}</div>
      </div>
    )
  }
}