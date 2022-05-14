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
        <span>{this.getFilenameFromPath()} - {this.props.downloadManager.getDownloadSize(this.props.downloadName)}</span>
        <div className="DownloadSectionInner">
          <ProgressBar path={this.props.downloadName} downloadManager={this.props.downloadManager} />
        </div>
      </div>
    )
  }
}