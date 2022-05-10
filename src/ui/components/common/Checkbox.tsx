import React from 'react'

interface IProps {
  label: string,
  checked: boolean,
  onChange: () => void,
}

interface IState {
  checked: boolean
}

export default class Checkbox extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      checked: props.checked
    }
  }

  handleChange = () => {
    this.setState({ checked: !this.state.checked })
    this.props.onChange()
  }

  render() {
    return (
      <div className="Checkbox">
        <input type="checkbox" onChange={this.handleChange} />
        <label>{this.props.label}</label>
      </div>
    )
  }
}