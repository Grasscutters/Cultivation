<<<<<<< HEAD
import { onCleanup, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import DownloadHandler from '../../../utils/download';
import Tr from '../../../utils/language';

import './ProgressBar.css';
=======
import DownloadHandler from '../../../utils/download'
import Tr from '../../../utils/language'
import './ProgressBar.css'
import {createStore} from "solid-js/store";
import {onCleanup, Show} from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

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
<<<<<<< HEAD
  const { average, files, extracting, totalSize } =
    props.downloadManager.getTotalAverage();
=======
  const { average, files, extracting, totalSize } = props.downloadManager.getTotalAverage();
>>>>>>> aa45f04 (feat: move to solid-js)

  const [state, setState] = createStore<IState>({
    average,
    files,
    extracting,
    total: totalSize,
    speed: '0 B/s',
  });

  const interval = window.setInterval(() => {
<<<<<<< HEAD
    const prog = props.downloadManager.getTotalAverage();
=======
    const prog = props.downloadManager.getTotalAverage()
>>>>>>> aa45f04 (feat: move to solid-js)
    setState({
      average: prog?.average || 0,
      files: prog?.files,
      extracting: prog?.extracting,
      total: prog?.totalSize || 0,
      speed: prog?.speed || '0 B/s',
<<<<<<< HEAD
    });
=======
    })
>>>>>>> aa45f04 (feat: move to solid-js)
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
<<<<<<< HEAD
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
=======
                return '100'
              }

              if (state.total <= 0) {
                return '0'
              }

              return state.average
            })()}%`,
          }}
         />
      </div>

      <Show when={props.withStats === undefined || props.withStats} keyed={false}>
>>>>>>> aa45f04 (feat: move to solid-js)
        <div class="MainProgressText">
          <Tr text="main.files_downloading" /> {state.files} ({state.speed})
          <br />
          <Tr text="main.files_extracting" /> {state.extracting}
        </div>
      </Show>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
