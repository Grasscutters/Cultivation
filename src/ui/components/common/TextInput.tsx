import React from 'react'
import './TextInput.css'

interface IProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

interface IState {
  value: string
}

export default class TextInput extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      value: props.value || ''
    }
  }

  static getDerivedStateFromProps(props: IProps, state: IState) {
    return { value: props.value || '' }
  }

  render() {
    return (
      <input readOnly={this.props.readOnly || false} placeholder={this.props.placeholder || ''} className="TextInput" value={this.state.value} onChange={(e) => {
        this.setState({ value: e.target.value })
        if (this.props.onChange) this.props.onChange(e.target.value)
      }} />
    )
  }
}