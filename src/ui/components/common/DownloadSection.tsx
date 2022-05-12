import React from 'react'
import DownloadHandler from '../../../utils/download'
import ProgressBar from './ProgressBar'

import './DownloadSection.css'

interface IProps {
  downloadManager: DownloadHandler;
  downloadName: string;
}

export default class MiniDialog extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <div className="DownloadSection">
        <span>{this.props.downloadName}</span>
        <div className="DownloadSectionInner">
          <ProgressBar path={this.props.downloadName} downloadManager={this.props.downloadManager} />
        </div>
      </div>
    )
  }
}