import React from 'react'
import './ProgressBar.css'

interface IProps {
  path: string,
  downloadManager: any,
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
        progress: parseInt(prog?.progress || 0, 10),
        status: prog?.status || 'error',
        total: prog?.total || 0,
      })

      console.log(prog)

      if (this.state.status === 'finished' /* || this.state.status === 'error' */) {
        // Ensure progress is 100%

        clearInterval(intv)
      }
    }, 500)
  }

  render() {
    return (
      <div className="ProgressBarWrapper">
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

        <div className="ProgressText">
          {this.state.status}
        </div>
      </div>
    )
  }
}