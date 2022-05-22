import React from 'react'

import './TextInput.css'
import Close from '../../../resources/icons/close.svg'

interface IProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  id?: string;
  clearable?: boolean;
  style?: {
    [key: string]: any;
  }
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
    if (!props.readOnly) {
      return {
        value: state.value
      }
    }

    return { value: props.value || '' }
  }

  render() {
    return (
      <div className="TextInputWrapper" style={this.props.style || {}}>
        <input id={this.props?.id} readOnly={this.props.readOnly || false} placeholder={this.props.placeholder || ''} className="TextInput" value={this.state.value} onChange={(e) => {
          this.setState({ value: e.target.value })
          if (this.props.onChange) this.props.onChange(e.target.value)
        }} />
        {
          this.props.clearable ?
            <div className="TextClear" onClick={() => {
              this.setState({ value: '' })
    
              if (this.props.onChange) this.props.onChange('')

              this.forceUpdate()
            }}>
              <img src={Close} className="TextInputClear" />
            </div> : null
        }
      </div>
    )
  }
}