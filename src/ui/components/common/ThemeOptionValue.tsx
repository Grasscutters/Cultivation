import React from 'react'
import TextInput from './TextInput'
import Checkbox from './Checkbox'

/*
 * Valid types for the theme option value.
 * - input: A text input.
 * - dropdown: A select/dropdown input.
 * - checkbox: A toggle.
 * - button: A button.
 */

interface IProps {
  type: string;
  className?: string;
  jsCallback?: string;
  data: InputSettings;
}

interface IState {
  toggled: boolean
}

export interface InputSettings {
  /* Input. */
  placeholder?: string;
  initialValue?: string;
  
  /* Dropdown. */
  options?: string[];
  
  /* Checkbox. */
  toggled?: boolean
  id?: string;
  
  /* Button. */
  text?: string;
}

export default class ThemeOptionValue extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    
    this.state = {
      toggled: false
    }
  }
  
  static getDerivedStateFromProps(props: IProps, state: IState) {
    return { toggled: props.data.toggled || state.toggled }
  }
  
  async componentDidMount() {
    const data = this.props.data
    
    if(this.props.type == 'checkbox')
      this.setState({ toggled: data.toggled || false })
  }
  
  async onChange() {
    // Change toggled state if needed.
    if(this.props.type == 'checkbox')
      this.setState({
        toggled: !this.state.toggled
      })
    
    if(!this.props.jsCallback)
      return
  }

  render() {
    const data = this.props.data
    
    switch(this.props.type) {
    case 'input':
      return (
        <div className={this.props.className}>
          <TextInput placeholder={data.placeholder} initalValue={data.initialValue} />
        </div>
      )
    case 'dropdown':
      return (
        <div className={this.props.className}>
          <select>
            {data.options ? data.options.map((option, index) => {
              return <option key={index}>{option}</option>
            }) : null}
          </select>
        </div>
      )
    case 'button':
      return (
        <div className={this.props.className}>
          <button>{data.text}</button>
        </div>
      )
    default:
      return (
        <div className={this.props.className}>
          <Checkbox checked={this.state?.toggled} onChange={this.onChange} id={this.props.className || 'a'} />
        </div>
      )
    }
  }
}