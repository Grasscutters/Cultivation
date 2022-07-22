import React from 'react'
import { app } from '@tauri-apps/api'
import { appWindow } from '@tauri-apps/api/window'
import closeIcon from '../../resources/icons/close.svg'
import minIcon from '../../resources/icons/min.svg'
import cogBtn from '../../resources/icons/cog.svg'
import downBtn from '../../resources/icons/download.svg'

import Tr from '../../utils/language'

import './TopBar.css'
import { getConfig, setConfigOption } from '../../utils/configuration'

interface IProps {
  optFunc: () => void
  downFunc: () => void
  gameFunc: () => void
  modFunc: () => void
}

interface IState {
  version: string
  clicks: number
  intv: NodeJS.Timeout | null
}

export default class TopBar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      version: '0.0.0',
      clicks: 0,
      intv: null,
    }

    this.activateClick = this.activateClick.bind(this)
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

  async activateClick() {
    const config = await getConfig()

    // They already got it, no need to reactivate
    if (config.swag_mode) return

    if (this.state.clicks === 2) {
      setTimeout(() => {
        // Gotta clear it so it goes back to regular colors
        this.setState({
          clicks: 0,
        })
      }, 600)

      // Activate... SWAG MODE
      await setConfigOption('swag_mode', true)

      // Reload the window
      window.location.reload()

      return
    }

    if (this.state.clicks < 3) {
      this.setState({
        clicks: this.state.clicks + 1,
        intv: setTimeout(() => this.setState({ clicks: 0 }), 1500),
      })

      return
    }
  }

  render() {
    return (
      <div className="TopBar" id="topBarContainer" data-tauri-drag-region>
        <div id="title">
          <span data-tauri-drag-region>
            <Tr text="main.title" />
          </span>
          <span data-tauri-drag-region id="version">
            {this.state?.version}
          </span>
        </div>
        {/**
         * HEY YOU
         *
         * If you're looking at the source code to find the swag mode thing, that's okay! If you're not, move along...
         * Just do me a favor and don't go telling everyone about how you found it. If you are just helping someone who
         * for some reason needs it, that's fine, but not EVERYONE needs it, which is why it exists in the first place.
         */}
        <div id="unassumingButton" className={this.state.clicks === 2 ? 'spin' : ''} onClick={this.activateClick}>
          ?
        </div>
        <div className="TopBtns" id="topBarButtonContainer">
          <div id="closeBtn" onClick={this.handleClose} className="TopButton">
            <img src={closeIcon} alt="close" />
          </div>
          <div id="minBtn" onClick={this.handleMinimize} className="TopButton">
            <img src={minIcon} alt="minimize" />
          </div>
          <div id="settingsBtn" onClick={this.props.optFunc} className="TopButton">
            <img src={cogBtn} alt="settings" />
          </div>
          <div id="downloadsBtn" className="TopButton" onClick={this.props.downFunc}>
            <img src={downBtn} alt="downloads" />
          </div>
          <div id="modsBtn" onClick={this.props.modFunc} className="TopButton">
            MODS
          </div>
          {/* <div id="gameBtn" className="TopButton" onClick={this.props.gameFunc}>
            <img src={gameBtn} alt="game" />
          </div> */}
        </div>
      </div>
    )
  }
}
