import { ProgressBar } from 'shared/ui/atoms/progress-bar';
import type DownloadHandler from 'utils/download';

import * as styles from './style.css';

interface DownloadSectionProps {
  downloadManager: DownloadHandler;
  downloadName: string;
}

function getFilenameFromPath(name: string) {
  return name.replace(/\\/g, '/').split('/').pop();
}

// TODO: remove downloadManager prop drill

export function DownloadSection(props: DownloadSectionProps) {
  return (
    <section class={styles.section}>
      <div class={styles.title}>
        <div class={styles.path}>{getFilenameFromPath(props.downloadName)}</div>
        <div class={styles.status}>
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
    </section>
  );
}
