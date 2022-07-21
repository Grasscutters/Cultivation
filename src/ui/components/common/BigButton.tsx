import React from 'react'
import './BigButton.css'

interface IProps {
  children: React.ReactNode
  onClick: () => unknown
  id: string
  disabled?: boolean
}

interface IState {
  disabled?: boolean
}

export default class BigButton extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      disabled: this.props.disabled,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  static getDerivedStateFromProps(props: IProps, _state: IState) {
    return {
      disabled: props.disabled,
    }
  }

  handleClick() {
    if (this.state.disabled) return

    this.props.onClick()
  }

  render() {
    return (
      <div
        className={'BigButton ' + (this.state.disabled ? 'disabled' : '')}
        onClick={this.handleClick}
        id={this.props.id}
      >
        <div className="BigButtonText">{this.props.children}</div>
      </div>
    )
  }
}
