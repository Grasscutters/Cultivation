// Major Components
import TopBar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import MainProgressBar from './components/common/MainProgressBar'
import Options from './components/menu/Options'
import MiniDialog from './components/MiniDialog'
import DownloadList from './components/common/DownloadList'
import Downloads from './components/menu/Downloads'
import NewsSection from './components/news/NewsSection'
import Game from './components/menu/Game'
import RightBar from './components/RightBar'

import { getConfigOption, setConfigOption } from '../utils/configuration'
import { invoke } from '@tauri-apps/api'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { dataDir } from '@tauri-apps/api/path'
import { appWindow } from '@tauri-apps/api/window'
import { unpatchGame } from '../utils/metadata'
import DownloadHandler from '../utils/download'

// Graphics
import cogBtn from '../resources/icons/cog.svg'
import downBtn from '../resources/icons/download.svg'
import wrenchBtn from '../resources/icons/wrench.svg'
import { ExtrasMenu } from './components/menu/ExtrasMenu'
import { createMutable } from "solid-js/store";
import { batch, onCleanup, onMount, Show } from "solid-js";


interface IProps {
  downloadHandler: DownloadHandler
}

interface IState {
  isDownloading: boolean
  optionsOpen: boolean
  miniDownloadsOpen: boolean
  downloadsOpen: boolean
  gameDownloadsOpen: boolean
  extrasOpen: boolean
  migotoSet: boolean
  playGame: (exe?: string, proc_name?: string) => void
}

export function Main(props: IProps) {
  const unlisteners: Promise<UnlistenFn>[] = [];
  const state = createMutable<IState>({
    isDownloading: false,
    optionsOpen: false,
    miniDownloadsOpen: false,
    downloadsOpen: false,
    gameDownloadsOpen: false,
    extrasOpen: false,
    migotoSet: false,
    playGame: () => {
      alert('Error launching game')
    },
  });

  unlisteners.push(listen('lang_error', (payload) => {
    console.log(payload)
  }));

  unlisteners.push(listen('jar_extracted', ({ payload }: { payload: string }) => {
    setConfigOption('grasscutter_path', payload)
  }));

  unlisteners.push(
    // Emitted for metadata replacing-purposes
    listen('game_closed', async () => {
      const wasPatched = await getConfigOption('patch_metadata')

      if (wasPatched) {
        const unpatched = await unpatchGame()

        if (!unpatched) {
          alert(
            `Could not unpatch game! (You should be able to find your metadata backup in ${await dataDir()}\\cultivation\\)`
          )
        }
      }
    }));

  let min = false

  // periodically check if we need to min/max based on whether the game is open
  const id = window.setInterval(async () => {
    const gameOpen = await invoke('is_game_running')

    if (gameOpen && !min) {
      appWindow.minimize()
      min = true
    } else if (!gameOpen && min) {
      appWindow.unminimize()
      min = false
    }
  }, 1000);

  onCleanup(() => clearInterval(id));

  onCleanup(async () => {
    const uls = await Promise.all(unlisteners);
    for (const ul of uls) {
      ul();
    }
  });

  onMount(async () => {
    const cert_generated = await getConfigOption('cert_generated')

    state.migotoSet = !!(await getConfigOption('migoto_path'));

    if (!cert_generated) {
      // Generate the certificate
      await invoke('generate_ca_files', {
        path: (await dataDir()) + 'cultivation',
      })

      await setConfigOption('cert_generated', true)
    }

    // Period check to only show progress bar when downloading files
    setInterval(() => {
      state.isDownloading = props.downloadHandler.getDownloads().filter((d) => d.status !== 'finished')?.length > 0
    }, 1000)
  });

  async function openExtrasMenu(playGame: () => void) {
    batch(() => {
      state.extrasOpen = true;
      state.playGame = playGame;
    })
  }

  return (
    <>
      <TopBar>
        <div
          id="settingsBtn"
          onClick={() => state.optionsOpen = !state.optionsOpen}
          class="TopButton"
        >
          <img src={cogBtn} alt="settings" />
        </div>
        <div
          id="downloadsBtn"
          class="TopButton"
          onClick={() => state.downloadsOpen = !state.downloadsOpen}
        >
          <img src={downBtn} alt="downloads" />
        </div>
        <Show when={state.migotoSet} keyed={false}>
          <div
            id="modsBtn"
            onClick={() => {
              // Create and dispatch a custom "openMods" event
              const event = new CustomEvent('changePage', { detail: 'modding' })
              window.dispatchEvent(event)
            }}
            class="TopButton"
          >
            <img src={wrenchBtn} alt="mods" />
          </div>
        </Show>
        {/* <div id="gameBtn" className="TopButton" onClick={() => this.setState({ gameDownloadsOpen: !this.state.gameDownloadsOpen })}>
            <img src={gameBtn} alt="game" />
          </div> */}
      </TopBar>

      <RightBar />

      <NewsSection />

      <Show when={state.extrasOpen} keyed={false}>
        <ExtrasMenu closeFn={() => state.extrasOpen = false} playGame={state.playGame}>
          Yo
        </ExtrasMenu>
      </Show>

      <Show when={state.miniDownloadsOpen} keyed={false}>
        <div class="MiniDownloads" id="miniDownloadContainer">
          <MiniDialog
            title="Downloads"
            closeFn={() => state.miniDownloadsOpen = false}
          >
            <DownloadList downloadManager={props.downloadHandler} />
          </MiniDialog>
          <div class="arrow-down" />
        </div>
      </Show>

      <Show when={state.downloadsOpen} keyed={false}>
        <Downloads
          downloadManager={props.downloadHandler}
          closeFn={() => state.downloadsOpen = false}
        />
      </Show>

      <Show when={state.optionsOpen} keyed={false}>
        <Options closeFn={() => state.optionsOpen = !state.optionsOpen} downloadManager={props.downloadHandler} />
      </Show>

      <Show when={state.gameDownloadsOpen} keyed={false}>
        <Game
          downloadManager={props.downloadHandler}
          closeFn={() => state.gameDownloadsOpen = false}
        />
      </Show>

      <div class="BottomSection" id="bottomSectionContainer">
        <ServerLaunchSection openExtras={openExtrasMenu} />
        <div
          id="DownloadProgress"
          onClick={() => state.miniDownloadsOpen = !state.miniDownloadsOpen}
        >
          <Show when={state.isDownloading} keyed={false}>
            <MainProgressBar downloadManager={props.downloadHandler} />
          </Show>
        </div>
      </div>
    </>
  )
}
