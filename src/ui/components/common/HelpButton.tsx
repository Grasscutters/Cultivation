import React from 'react'

import './HelpButton.css'
import Help from '../../../resources/icons/help.svg'

interface IProps {
  id?: string
}

interface IState {
  opened: boolean
}

export default class HelpButton extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <div className="HelpSection">
        <div className="HelpButton">
          <img src={Help} />
        </div>
      </div>
    )
  }
}