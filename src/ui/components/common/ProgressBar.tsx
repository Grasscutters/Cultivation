import React from 'react'
import { capitalize } from '../../../utils/string'

import Stop from '../../../resources/icons/close.svg' 
import './ProgressBar.css'
import DownloadHandler from '../../../utils/download'

interface IProps {
  path: string,
  downloadManager: DownloadHandler,
}

interface IState {
  progress: number,
  status: string,
  total: number,
}

export default class ProgressBar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      progress: 0,
      status: '',
      total: this.props.downloadManager.getDownloadProgress(this.props.path)?.total || 0,
    }
  }

  componentDidMount() {
    // Periodically check the progress of passed file path
    const intv = setInterval(() => {
      const prog = this.props.downloadManager.getDownloadProgress(this.props.path)
      this.setState({
        progress: prog?.progress || 0,
        status: prog?.status || 'error',
        total: prog?.total || 0,
      })

      if (this.state.status === 'finished' || this.state.status === 'error') {
        // Ensure progress is 100%
        clearInterval(intv)
      }
    }, 500)
  }

  stopDownload() {
    this.props.downloadManager.stopDownload(this.props.path)
  }

  render() {
    return (
      <div className="ProgressBarWrapper">
        <div style={{
          width: '100%'
        }}>
          <div className="ProgressBar">
            <div className="InnerProgress" style={{
              width: `${(() => {
                // Handles files with content-lengths of 0
                if (this.state.status === 'finished') {
                  return '100'
                }

                if (this.state.total <= 0) {
                  return '0'
                }

                return this.state.progress / this.state.total * 100
              })()}%`,
            }}></div>
          </div>
          <div className="DownloadControls">
            <div onClick={this.stopDownload}>
              <img src={Stop}></img>
            </div>
          </div>
        </div>


        <div className="ProgressText">
          {capitalize(this.state.status)}
        </div>
      </div>
    )
  }
}