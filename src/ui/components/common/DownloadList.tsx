import { createMemo, For, Show } from 'solid-js';

import DownloadHandler from '../../../utils/download';
import DownloadSection from './DownloadSection';

import './DownloadList.css';

interface IProps {
  downloadManager: DownloadHandler;
}

export default function DownloadList(props: IProps) {
  const list = createMemo(() => props.downloadManager.getDownloads());
  return (
    <div class="DownloadList">
      <Show
        when={list().length > 0}
        keyed={false}
        fallback="No downloads present">
        <For each={list()}>
          {(download) => (
            <DownloadSection
              downloadName={download.path}
              downloadManager={props.downloadManager}
            />
          )}
        </For>
      </Show>
    </div>
  );
}
