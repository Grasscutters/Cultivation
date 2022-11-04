import { DownloadSection } from 'shared/ui/atoms/download-section';
import { createMemo, For, Show } from 'solid-js';
import type DownloadHandler from 'utils/download';

import * as styles from './style.css';

interface DownloadListProps {
  downloadManager: DownloadHandler;
}

export function DownloadList(props: DownloadListProps) {
  const downloads = createMemo(() => props.downloadManager.getDownloads());

  const downloadsArePresent = () => downloads().length > 0;

  return (
    <div class={styles.list}>
      <Show
        when={downloadsArePresent()}
        keyed={false}
        fallback="No downloads present">
        <For each={props.downloadManager.getDownloads()}>
          {(download) => (
            <DownloadSection
              downloadManager={props.downloadManager}
              downloadName={download.path}
            />
          )}
        </For>
      </Show>
    </div>
  );
}
