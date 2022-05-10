import React from 'react'

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
      total: this.props.downloadManager.getDownloadProgress(this.props.path).total,
    }
  }

  componentDidMount() {
    // Periodically check the progress of passed file path
    const intv = setInterval(() => {
      const prog = this.props.downloadManager.getDownloadProgress(this.props.path)
      this.setState({
        progress: prog.progress,
        status: prog.status,
      })

      if (prog.status === 'finished') {
        clearInterval(intv)
      }
    }, 100)
  }

  render() {
    return (
      <div className="ProgressBar">
        <div className="InnerProgress" style={{
          width: `${this.state.progress / this.state.total}%`,
        }}></div>
        <div className="ProgressText">
          {this.state.status}
        </div>
      </div>
    )
  }
}