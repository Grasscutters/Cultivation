import React from 'react'
import { open } from '@tauri-apps/api/dialog'
import { translate } from '../../../utils/language'
import TextInput from './TextInput'
import File from '../../../resources/icons/folder.svg'

import './DirInput.css'

interface IProps {
  value?: string
  onChange?: (value: string) => void
  extensions?: string[]
}

interface IState {
  value: string
  placeholder: string
}

export default class DirInput extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      value: props.value || '',
      placeholder: 'Select file or folder...'
    }

    this.handleIconClick = this.handleIconClick.bind(this)
  }

  static getDerivedStateFromProps(props: IProps, state: IState) {
    if (!props.value || state.value !== '') return state

    return { value: props.value || '' }
  }

  async componentDidMount() {
    const translation = await translate('components.select_file')
    this.setState( {
      placeholder: translation
    })
  }

  async handleIconClick() {
    let path = await open({
      filters: [
        { name: 'Files', extensions: this.props.extensions || ['*'] }
      ]
    })

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
        <TextInput value={this.state.value} placeholder={this.state.placeholder} readOnly={true} onChange={(text: string) => {
          this.setState({ value: text })

          if (this.props.onChange) this.props.onChange(text)
        }}/>
        <div className="FileSelectIcon" onClick={this.handleIconClick}>
          <img src={File} />
        </div>
      </div>
    )
  }
}