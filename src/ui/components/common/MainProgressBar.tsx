import React from 'react'
import DownloadHandler from '../../../utils/download'
import Tr from '../../../utils/language'
import './ProgressBar.css'

interface IProps {
  downloadManager: DownloadHandler
  withStats?: boolean
}

interface IState {
  average: number
  files: number
  extracting: number
  total: number
  speed: string
}

/**
 * This component differes because it averages all downloads together
 */
export default class ProgressBar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    const { average, files, extracting, totalSize } = this.props.downloadManager.getTotalAverage()

    this.state = {
      average,
      files,
      extracting,
      total: totalSize,
      speed: '0 B/s',
    }
  }

  componentDidMount() {
    // Periodically check the progress of passed file path
    setInterval(() => {
      const prog = this.props.downloadManager.getTotalAverage()
      this.setState({
        average: prog?.average || 0,
        files: prog?.files,
        extracting: prog?.extracting,
        total: prog?.totalSize || 0,
        speed: prog?.speed || '0 B/s',
      })
    }, 200)
  }

  render() {
    return (
      <div className="MainProgressBarWrapper">
        <div className="ProgressBar">
          <div
            className="InnerProgress"
            style={{
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
            }}
          ></div>
        </div>

        {this.props.withStats && (
          <div className="MainProgressText">
            <Tr text="main.files_downloading" /> {this.state.files} ({this.state.speed})
            <br />
            <Tr text="main.files_extracting" /> {this.state.extracting}
          </div>
        )}
      </div>
    )
  }
}
