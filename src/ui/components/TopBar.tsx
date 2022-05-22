import React from 'react'
import { app } from '@tauri-apps/api'
import { appWindow } from '@tauri-apps/api/window'
import closeIcon from '../../resources/icons/close.svg'
import minIcon from '../../resources/icons/min.svg'
import cogBtn from '../../resources/icons/cog.svg'
import downBtn from '../../resources/icons/download.svg'

import Tr, { translate } from '../../utils/language'

import './TopBar.css'
import { listen } from '@tauri-apps/api/event'

interface IProps {
  optFunc: () => void;
  downFunc: () => void;
}

interface IState {
  version: string;
}

export default class TopBar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = { version: '0.0.0' }
  }

  async componentDidMount() {
    const version = await app.getVersion()
    this.setState({ version })
  }

  handleClose() {
    appWindow.close()
  }

  handleMinimize() {
    appWindow.minimize()
  }

  render() {
    return (
      <div className="TopBar" data-tauri-drag-region>
        <div id="title">
          <span data-tauri-drag-region>
            <Tr text="main.title" />
          </span>
          <span data-tauri-drag-region id="version">{this.state?.version}</span>
        </div>
        <div className="TopBtns">
          <div id="closeBtn" onClick={this.handleClose} className='TopButton'>
            <img src={closeIcon} alt="close" />
          </div>
          <div id="minBtn" onClick={this.handleMinimize} className='TopButton'>
            <img src={minIcon} alt="minimize" />
          </div>
          <div id="settingsBtn" onClick={this.props.optFunc} className='TopButton'>
            <img src={cogBtn} alt="settings" />
          </div>
          <div id="downloadsBtn" className='TopButton' onClick={this.props.downFunc}>
            <img src={downBtn} alt="downloads" />
          </div>
        </div>
      </div>
    )
  }
}