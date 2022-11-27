<<<<<<< HEAD
import { createMemo, For, Show } from 'solid-js';

import DownloadHandler from '../../../utils/download';
import DownloadSection from './DownloadSection';

import './DownloadList.css';
=======
import DownloadHandler from '../../../utils/download'
import DownloadSection from './DownloadSection'

import './DownloadList.css'
import {createMemo, For, Show} from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

interface IProps {
  downloadManager: DownloadHandler;
}

export default function DownloadList(props: IProps) {
  const list = createMemo(() => props.downloadManager.getDownloads());
  return (
    <div class="DownloadList">
<<<<<<< HEAD
      <Show
        when={list().length > 0}
        keyed={false}
        fallback="No downloads present">
=======
      <Show when={list().length > 0} keyed={false} fallback="No downloads present">
>>>>>>> aa45f04 (feat: move to solid-js)
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
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
