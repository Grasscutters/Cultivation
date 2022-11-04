import { cc } from 'shared/lib/classcat-extension';
import { useEnrichedI18n } from 'shared/lib/i18n';
import { createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import type DownloadHandler from 'utils/download';
import { makeTimer } from '@solid-primitives/timer';

import styles from 'shared/ui/atoms/progress-bar/style.css';

interface MainProgressBarProps {
  downloadManager: DownloadHandler;
  withStats?: boolean;
}

/**
 * This component differs because it averages all downloads together
 */
export function MainProgressBar(props: MainProgressBarProps) {
  const [t] = useEnrichedI18n();
  const { average, files, extracting, totalSize } =
    props.downloadManager.getTotalAverage();

  const [store, setStore] = createStore({
    average,
    files,
    extracting,
    total: totalSize,
    speed: '0 B/s',
  });

  function checker() {
    const downloadProgress = props.downloadManager.getTotalAverage();

    setStore({
      average: downloadProgress?.average ?? 0,
      files: downloadProgress?.files,
      extracting: downloadProgress?.extracting,
      total: downloadProgress?.totalSize ?? 0,
      speed: downloadProgress?.speed ?? '0 B/s',
    });
  }

  makeTimer(checker, 200, setInterval);

  const innerProgressStyle = createMemo(() => ({
    width: `${(() => {
      // Handles no files downloading
      if (store.files === 0 || store.average >= 100) {
        return '100';
      }

      if (store.total <= 0) {
        return '0';
      }

      return store.average;
    })()}%`,
  }));

  return (
    <div class={cc(styles.mainProgressBarWrapper, 'MainProgressBarWrapper')}>
      <div class={styles.progressBar}>
        <div class={styles.innerProgress} style={innerProgressStyle()} />
      </div>

      <Show
        when={props.withStats === undefined || props.withStats}
        keyed={false}>
        <div class={styles.mainProgressText}>
          {t('main.files_downloading')} {store.files} ({store.speed})
          <br />
          {t('main.files_extracting')} {store.extracting}
        </div>
      </Show>
    </div>
  );
}
