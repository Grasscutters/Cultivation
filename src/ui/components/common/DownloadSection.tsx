import React from 'react'
import DownloadHandler from '../../../utils/download'
import ProgressBar from './ProgressBar'

import './DownloadSection.css'

interface IProps {
  downloadManager: DownloadHandler;
  downloadName: string;
}

export default class DownloadSection extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  getFilenameFromPath() {
    return this.props.downloadName.split('/').pop()
  }

  render() {
    return (
      <div className="DownloadSection">
        <div className="DownloadTitle">
          <div className="DownloadPath">{this.getFilenameFromPath()}</div>
          <div className="DownloadStatus"> - {this.props.downloadManager.getDownloadSize(this.props.downloadName)}</div>
        </div>
        <div className="DownloadSectionInner">
          <ProgressBar path={this.props.downloadName} downloadManager={this.props.downloadManager} />
        </div>
      </div>
    )
  }
}