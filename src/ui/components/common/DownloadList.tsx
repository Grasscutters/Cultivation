import React from 'react'
import DownloadHandler from '../../../utils/download'
import DownloadSection from './DownloadSection'

import './DownloadList.css'

interface IProps {
  downloadManager: DownloadHandler
}

export default class DownloadList extends React.Component<IProps, never> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    const list = this.props.downloadManager.getDownloads().map((download) => {
      return (
        <DownloadSection
          key={download.path}
          downloadName={download.path}
          downloadManager={this.props.downloadManager}
        />
      )
    })

    return <div className="DownloadList">{list.length > 0 ? list : 'No downloads present'}</div>
  }
}
