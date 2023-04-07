import React from 'react'

import './SmallButton.css'
import Wrench from '../../../resources/icons/wrench.svg'
import { translate } from '../../../utils/language'

interface IProps {
  children?: React.ReactNode[] | React.ReactNode
  onClick: () => unknown
  id?: string
  contents?: string
}

export default class SmallButton extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  async showAlert() {
    if (this.props.contents) alert(await translate(this.props.contents))
  }

  handleClick() {
    this.props.onClick()
    this.showAlert()
  }

  render() {
    return (
      <div className="SmallButtonSection">
        <div className="SmallButtonButton" onClick={this.handleClick}>
          <img src={Wrench} />
        </div>
      </div>
    )
  }
}
