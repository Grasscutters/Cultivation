import { onCleanup, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import DownloadHandler from '../../../utils/download';
import Tr from '../../../utils/language';

import './ProgressBar.css';

interface IProps {
  downloadManager: DownloadHandler;
  withStats?: boolean;
}

interface IState {
  average: number;
  files: number;
  extracting: number;
  total: number;
  speed: string;
}

/**
 * This component differes because it averages all downloads together
 */
export default function ProgressBar(props: IProps) {
  const { average, files, extracting, totalSize } =
    props.downloadManager.getTotalAverage();

  const [state, setState] = createStore<IState>({
    average,
    files,
    extracting,
    total: totalSize,
    speed: '0 B/s',
  });

  const interval = window.setInterval(() => {
    const prog = props.downloadManager.getTotalAverage();
    setState({
      average: prog?.average || 0,
      files: prog?.files,
      extracting: prog?.extracting,
      total: prog?.totalSize || 0,
      speed: prog?.speed || '0 B/s',
    });
  }, 200);

  onCleanup(() => window.clearInterval(interval));

  return (
    <div class="MainProgressBarWrapper">
      <div class="ProgressBar">
        <div
          class="InnerProgress"
          style={{
            width: `${(() => {
              // Handles no files downloading
              if (state.files === 0 || state.average >= 100) {
                return '100';
              }

              if (state.total <= 0) {
                return '0';
              }

              return state.average;
            })()}%`,
          }}
        />
      </div>

      <Show
        when={props.withStats === undefined || props.withStats}
        keyed={false}>
        <div class="MainProgressText">
          <Tr text="main.files_downloading" /> {state.files} ({state.speed})
          <br />
          <Tr text="main.files_extracting" /> {state.extracting}
        </div>
      </Show>
    </div>
  );
}
