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
    const name = this.props.downloadName.replace(/\\/g, '/')
    return name.split('/').pop()
  }

  render() {
    return (
      <div className="DownloadSection" id="commonDownloadSectionContainer">
        <div className="DownloadTitle" id="commonDownloadSectionTitle">
          <div className="DownloadPath" id="commonDownloadSectionPath">{this.getFilenameFromPath()}</div>
          <div className="DownloadStatus" id="commonDownloadSectionSize"> - {this.props.downloadManager.getDownloadSize(this.props.downloadName)}</div>
        </div>
        <div className="DownloadSectionInner" id="commonDownloadSectionProgress">
          <ProgressBar path={this.props.downloadName} downloadManager={this.props.downloadManager} />
        </div>
      </div>
    )
  }
}