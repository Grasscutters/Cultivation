import Stop from 'resources/icons/close.svg';
import { batch, createMemo, createSignal } from 'solid-js';
import type DownloadHandler from 'utils/download';
import { translate } from 'utils/language';
import { capitalize } from 'utils/string';
import { makeTimer } from '@solid-primitives/timer';

import * as styles from './style.css';

interface ProgressBarProps {
  path: string;
  downloadManager: DownloadHandler;
}

export function ProgressBar(props: ProgressBarProps) {
  const [progress, setProgress] = createSignal(0);
  const [status, setStatus] = createSignal('');
  const [total, setTotal] = createSignal(
    props.downloadManager.getDownloadProgress(props.path)?.total ?? 0
  );

  async function checker() {
    const downloadProgress = props.downloadManager.getDownloadProgress(
      props.path
    );
    const newStatus =
      (await translate(
        `download_status.${downloadProgress?.status || 'stopped'}`
      )) ?? 'stopped';
    batch(() => {
      setProgress(downloadProgress?.progress ?? 0);
      setStatus(newStatus);
      setTotal(downloadProgress?.total ?? 0);
    });

    if (status() === 'finished' || status() === 'error') {
      // Ensure progress is 100%
      cleanInterval();
    }
  }

  const cleanInterval = makeTimer(checker, 500, setInterval);

  const stopDownload = () => props.downloadManager.stopDownload(props.path);

  const progressStyle = createMemo(() => ({
    width: `${(() => {
      // Handles files with content-lengths of 0
      if (status() === 'finished') {
        return '100';
      }

      if (total() <= 0) {
        return '0';
      }

      return (progress() / total()) * 100;
    })()}%`,
  }));

  return (
    <div class={styles.wrapper}>
      <div
        style={{
          width: '80%',
        }}>
        <div class={styles.bar}>
          <div class={styles.inner} style={progressStyle()} />
        </div>
        <div class={styles.downloadControls}>
          <div onClick={stopDownload} class={styles.downloadStop}>
            <img src={Stop}></img>
          </div>
        </div>
      </div>

      <div class={styles.progressText}>{capitalize(status()) || 'Waiting'}</div>
    </div>
  );
}

export { MainProgressBar } from 'shared/ui/atoms/progress-bar/main-progress-bar';
