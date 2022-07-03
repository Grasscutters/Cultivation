import React from 'react'

import './HelpButton.css'
import Help from '../../../resources/icons/help.svg'
import MiniDialog from '../MiniDialog'

interface IProps {
  children?: React.ReactNode[] | React.ReactNode;
  contents?: string
  id?: string
}

interface IState {
  opened: boolean
}

export default class HelpButton extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      opened: false
    }

    this.setOpen = this.setOpen.bind(this)
    this.setClosed = this.setClosed.bind(this)
  }

  setOpen() {
    this.setState({ opened: true })
  }

  setClosed() {
    this.setState({ opened: false })
  }

  render() {
    return (
      <div className="HelpSection" id={'commonHelpButtonContainer'}>
        <div className="HelpButton" id={'commonHelpButtonClosed'} onMouseEnter={this.setOpen} onMouseLeave={this.setClosed}>
          <img id={'commonHelpButtonIcon'} src={Help} />
        </div>

        <div className="HelpContents" id={'commonHelpButtonContainerOpen'} style={{
          display: this.state.opened ? 'block' : 'none'
        }}>
          <MiniDialog closeFn={this.setClosed}>
            {this.props.contents || this.props.children}
          </MiniDialog>
        </div>
      </div>
    )
  }
}