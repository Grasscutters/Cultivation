<<<<<<< HEAD
import DownloadHandler from '../../../utils/download';
import ProgressBar from './ProgressBar';
=======
import DownloadHandler from '../../../utils/download'
import ProgressBar from './ProgressBar'
>>>>>>> aa45f04 (feat: move to solid-js)

import './DownloadSection.css';

interface IProps {
  downloadManager: DownloadHandler;
  downloadName: string;
}

export default function DownloadSection(props: IProps) {
  function getFilenameFromPath() {
<<<<<<< HEAD
    const name = props.downloadName.replace(/\\/g, '/');
    return name.split('/').pop();
=======
    const name = props.downloadName.replace(/\\/g, '/')
    return name.split('/').pop()
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  return (
    <div class="DownloadSection">
      <div class="DownloadTitle">
        <div class="DownloadPath">{getFilenameFromPath()}</div>
<<<<<<< HEAD
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
=======
        <div class="DownloadStatus"> - {props.downloadManager.getDownloadSize(props.downloadName)}</div>
      </div>
      <div class="DownloadSectionInner">
        <ProgressBar path={props.downloadName} downloadManager={props.downloadManager} />
      </div>
    </div>
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
