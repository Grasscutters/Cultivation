import { capitalize } from '../../../utils/string'

import Stop from '../../../resources/icons/close.svg'
import './ProgressBar.css'
import DownloadHandler from '../../../utils/download'
import { translate } from '../../../utils/language'
import {createStore} from "solid-js/store";
import {makeTimer} from "@solid-primitives/timer";

interface IProps {
  path: string
  downloadManager: DownloadHandler
}

interface IState {
  progress: number
  status: string
  total: number
}

export default function ProgressBar(props: IProps) {
  const [state, setState] = createStore<IState>({
    progress: 0,
    status: '',
    total: props.downloadManager.getDownloadProgress(props.path)?.total || 0,
  });

  const disposeTimer = makeTimer(async () => {
    const prog = props.downloadManager.getDownloadProgress(props.path)
    setState({
      progress: prog?.progress || 0,
      status: (await translate(`download_status.${prog?.status || 'stopped'}`)) || 'stopped',
      total: prog?.total || 0,
    })

    if (state.status === 'finished' || state.status === 'error') {
      // Ensure progress is 100%
      disposeTimer();
    }
  }, 500, setInterval);

  function stopDownload() {
    props.downloadManager.stopDownload(props.path)
  }

  return (
    <div class="ProgressBarWrapper">
      <div
        style={{
          width: '80%',
        }}
      >
        <div class="ProgressBar">
          <div
            class="InnerProgress"
            style={{
              width: `${(() => {
                // Handles files with content-lengths of 0
                if (state.status === 'finished') {
                  return '100'
                }

                if (state.total <= 0) {
                  return '0'
                }

                return (state.progress / state.total) * 100
              })()}%`,
            }}
           />
        </div>
        <div class="DownloadControls">
          <div onClick={stopDownload} class="downloadStop">
            <img src={Stop} />
          </div>
        </div>
      </div>

      <div class="ProgressText">{capitalize(state.status) || 'Waiting'}</div>
    </div>
  )
}
