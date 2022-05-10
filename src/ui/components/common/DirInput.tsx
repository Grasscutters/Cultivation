import React from 'react'
import TextInput from './TextInput'
import File from '../../../resources/icons/folder.svg'

import './DirInput.css'

interface IProps {
  value?: string;
}

interface IState {
  value: string
}

export default class DirInput extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      value: props.value || ''
    }
  }

  handleFileSelect() {
    console.log('piss')
  }

  render() {
    return (
      <div className='DirInput'>
        <TextInput value={this.state.value} placeholder='Set Game Location...' readOnly={true} />
        <div className="FileSelectIcon">
          <img src={File} />
        </div>
      </div>
    )
  }
}