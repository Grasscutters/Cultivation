import React from 'react'
import DownloadHandler from '../../../utils/download'
import './ProgressBar.css'

interface IProps {
  downloadManager: DownloadHandler,
}

interface IState {
  average: number,
  files: number,
  total: number,
  speed: string,
}

/**
 * This component differes because it averages all downloads together
 */
export default class ProgressBar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    const { average, files, totalSize } = this.props.downloadManager.getTotalAverage()

    this.state = {
      average,
      files,
      total: totalSize,
      speed: '0 B/s'
    }
  }

  componentDidMount() {
    // Periodically check the progress of passed file path
    setInterval(() => {
      const prog = this.props.downloadManager.getTotalAverage()
      this.setState({
        average: prog?.average || 0,
        files: prog?.files,
        total: prog?.totalSize || 0,
        speed: prog?.speed || '0 B/s',
      })
    }, 200)
  }

  render() {
    return (
      <div className="MainProgressBarWrapper">
        <div className="ProgressBar">
          <div className="InnerProgress" style={{
            width: `${(() => {
              // Handles no files downloading
              if (this.state.files === 0) {
                return '100'
              }

              if (this.state.total <= 0) {
                return '0'
              }

              return this.state.average
            })()}%`,
          }}></div>
        </div>

        <div className="MainProgressText">
          Files Downloading: {this.state.files} ({this.state.speed})
        </div>
      </div>
    )
  }
}