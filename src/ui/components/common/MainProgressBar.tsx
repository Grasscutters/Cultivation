import React from 'react'
import './ProgressBar.css'

interface IProps {
  downloadManager: any,
}

interface IState {
  average: number,
  files: number,
  total: number
}

/**
 * This component differes because it averages all downloads together
 */
export default class ProgressBar extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    const { average, files, total } = this.props.downloadManager.getTotalAverage()

    this.state = {
      average,
      files,
      total
    }
  }

  componentDidMount() {
    // Periodically check the progress of passed file path
    const intv = setInterval(() => {
      const prog = this.props.downloadManager.getTotalAverage()
      this.setState({
        average: parseInt(prog?.avergae || 0, 10),
        files: prog?.files,
        total: prog?.total || 0,
      })

      console.log(prog)
    }, 500)
  }

  render() {
    return (
      <div className="ProgressBarWrapper">
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

        <div className="ProgressText">
          Files Downloading: {this.state.files}
        </div>
      </div>
    )
  }
}