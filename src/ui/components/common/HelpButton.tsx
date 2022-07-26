import React from 'react'

import './HelpButton.css'
import Help from '../../../resources/icons/help.svg'
import { translate } from '../../../utils/language'

interface IProps {
  children?: React.ReactNode[] | React.ReactNode
  contents?: string
  id?: string
}

export default class HelpButton extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)

    this.showAlert = this.showAlert.bind(this)
  }

  async showAlert() {
    if (this.props.contents) alert(await translate(this.props.contents))
  }

  render() {
    return (
      <div className="HelpSection">
        <div className="HelpButton" onClick={this.showAlert}>
          <img src={Help} />
        </div>
      </div>
    )
  }
}
