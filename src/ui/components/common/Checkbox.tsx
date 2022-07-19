import React from 'react'
import checkmark from '../../../resources/icons/check.svg'

import './Checkbox.css'

interface IProps {
  label?: string
  checked: boolean
  onChange: () => void
  id: string
}

interface IState {
  checked: boolean
}

export default class Checkbox extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      checked: props.checked,
    }
  }

  static getDerivedStateFromProps(props: IProps, state: IState) {
    if (props.checked !== state.checked) {
      return {
        checked: props.checked,
      }
    }

    return { checked: props.checked }
  }

  handleChange = () => {
    this.setState({ checked: !this.state.checked })
    this.props.onChange()
  }

  render() {
    return (
      <div className="Checkbox">
        <input type="checkbox" id={this.props.id} checked={this.state.checked} onChange={this.handleChange} />
        <label htmlFor={this.props.id}>
          <div className="CheckboxDisplay">{this.state.checked ? <img src={checkmark} alt="Checkmark" /> : null}</div>
          <span>{this.props.label || ''}</span>
        </label>
      </div>
    )
  }
}
