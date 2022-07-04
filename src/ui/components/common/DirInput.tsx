import React from 'react'
import { open } from '@tauri-apps/api/dialog'
import { translate } from '../../../utils/language'
import TextInput from './TextInput'
import File from '../../../resources/icons/folder.svg'

import './DirInput.css'

interface IProps {
  value?: string
  clearable?: boolean
  onChange?: (value: string) => void
  extensions?: string[]
  readonly?: boolean
  placeholder?: string
  folder?: boolean
  customClearBehaviour?: () => void
}

interface IState {
  value: string
  placeholder: string
  folder: boolean
}

export default class DirInput extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      value: props.value || '',
      placeholder: this.props.placeholder || 'Select file or folder...',
      folder: this.props.folder || false
    }

    this.handleIconClick = this.handleIconClick.bind(this)
  }

  static getDerivedStateFromProps(props: IProps, state: IState) {
    const newState = state

    if (props.value && state.value === '') {
      newState.value = props.value || ''
    }

    if (props.placeholder) {
      newState.placeholder = props.placeholder
    }

    return newState
  }

  async componentDidMount() {
    if (!this.props.placeholder) {
      const translation = await translate('components.select_file')
      this.setState( {
        placeholder: translation
      })
    }
  }

  async handleIconClick() {
    let path

    if (this.state.folder) {
      path = await open({
        directory: true
      })
    } else {
      path = await open({
        filters: [
          { name: 'Files', extensions: this.props.extensions || ['*'] }
        ]
      })
    }

    if (Array.isArray(path)) path = path[0]
    if (!path) return

    this.setState({
      value: path
    })

    if (this.props.onChange) this.props.onChange(path)
  }

  render() {
    return (
      <div className='DirInput'>
        <TextInput
          id='commonDirInputText'
          value={this.state.value}
          placeholder={this.state.placeholder}
          clearable={this.props.clearable !== undefined ? this.props.clearable : true}
          readOnly={this.props.readonly !== undefined ? this.props.readonly : true } onChange={(text: string) => {
            this.setState({ value: text })

            if (this.props.onChange) this.props.onChange(text)
            this.forceUpdate()
          }}
          customClearBehaviour={this.props.customClearBehaviour}
        />
        <div className="FileSelectIcon" onClick={this.handleIconClick}>
          <img src={File} />
        </div>
      </div>
    )
  }
}