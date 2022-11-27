import DownloadHandler from '../../../utils/download';
import ProgressBar from './ProgressBar';

import './DownloadSection.css';

interface IProps {
  downloadManager: DownloadHandler;
  downloadName: string;
}

export default function DownloadSection(props: IProps) {
  function getFilenameFromPath() {
    const name = props.downloadName.replace(/\\/g, '/');
    return name.split('/').pop();
  }

  return (
    <div class="DownloadSection">
      <div class="DownloadTitle">
        <div class="DownloadPath">{getFilenameFromPath()}</div>
        <div class="DownloadStatus">
          {' '}
          - {props.downloadManager.getDownloadSize(props.downloadName)}
        </div>
      </div>
      <div class="DownloadSectionInner">
        <ProgressBar
          path={props.downloadName}
          downloadManager={props.downloadManager}
        />
      </div>
    </div>
  );
}
