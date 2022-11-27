// Major Components
<<<<<<< HEAD
import { batch, onCleanup, onMount, Show } from 'solid-js';
import { createMutable } from 'solid-js/store';
import { invoke } from '@tauri-apps/api';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { dataDir } from '@tauri-apps/api/path';
import { appWindow } from '@tauri-apps/api/window';

// Graphics
import cogBtn from '../resources/icons/cog.svg';
import downBtn from '../resources/icons/download.svg';
import wrenchBtn from '../resources/icons/wrench.svg';
import { getConfigOption, setConfigOption } from '../utils/configuration';
import DownloadHandler from '../utils/download';
import { unpatchGame } from '../utils/metadata';
import DownloadList from './components/common/DownloadList';
import MainProgressBar from './components/common/MainProgressBar';
import Downloads from './components/menu/Downloads';
import { ExtrasMenu } from './components/menu/ExtrasMenu';
import Game from './components/menu/Game';
import Options from './components/menu/Options';
import MiniDialog from './components/MiniDialog';
import NewsSection from './components/news/NewsSection';
import RightBar from './components/RightBar';
import ServerLaunchSection from './components/ServerLaunchSection';
import TopBar from './components/TopBar';
=======
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

>>>>>>> aa45f04 (feat: move to solid-js)

interface IProps {
  downloadHandler: DownloadHandler;
}

interface IState {
  isDownloading: boolean;
  optionsOpen: boolean;
  miniDownloadsOpen: boolean;
  downloadsOpen: boolean;
  gameDownloadsOpen: boolean;
  extrasOpen: boolean;
  migotoSet: boolean;
  playGame: (exe?: string, proc_name?: string) => void;
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
<<<<<<< HEAD
      alert('Error launching game');
    },
  });

  unlisteners.push(
    listen('lang_error', (payload) => {
      console.log(payload);
    })
  );

  unlisteners.push(
    listen('jar_extracted', ({ payload }: { payload: string }) => {
      setConfigOption('grasscutter_path', payload);
    })
  );
=======
      alert('Error launching game')
    },
  });

  unlisteners.push(listen('lang_error', (payload) => {
    console.log(payload)
  }));

  unlisteners.push(listen('jar_extracted', ({ payload }: { payload: string }) => {
    setConfigOption('grasscutter_path', payload)
  }));
>>>>>>> aa45f04 (feat: move to solid-js)

  unlisteners.push(
    // Emitted for metadata replacing-purposes
    listen('game_closed', async () => {
      const wasPatched = await getConfigOption('patch_metadata');

      if (wasPatched) {
        const unpatched = await unpatchGame();

        if (!unpatched) {
          alert(
            `Could not unpatch game! (You should be able to find your metadata backup in ${await dataDir()}\\cultivation\\)`
          );
        }
      }
<<<<<<< HEAD
    })
  );

  let min = false;

  // periodically check if we need to min/max based on whether the game is open
  const id = window.setInterval(async () => {
    const gameOpen = await invoke('is_game_running');

    if (gameOpen && !min) {
      appWindow.minimize();
      min = true;
    } else if (!gameOpen && min) {
      appWindow.unminimize();
      min = false;
=======
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
>>>>>>> aa45f04 (feat: move to solid-js)
    }
  }, 1000);

  onCleanup(() => clearInterval(id));

  onCleanup(async () => {
    const uls = await Promise.all(unlisteners);
    for (const ul of uls) {
      ul();
    }
  });
<<<<<<< HEAD

  onMount(async () => {
    const cert_generated = await getConfigOption('cert_generated');

=======

  onMount(async () => {
    const cert_generated = await getConfigOption('cert_generated')

>>>>>>> aa45f04 (feat: move to solid-js)
    state.migotoSet = !!(await getConfigOption('migoto_path'));

    if (!cert_generated) {
      // Generate the certificate
      await invoke('generate_ca_files', {
        path: (await dataDir()) + 'cultivation',
      });

      await setConfigOption('cert_generated', true);
    }

    // Period check to only show progress bar when downloading files
    setInterval(() => {
<<<<<<< HEAD
      state.isDownloading =
        props.downloadHandler
          .getDownloads()
          .filter((d) => d.status !== 'finished')?.length > 0;
    }, 1000);
  });

  async function openExtrasMenu(playGame: () => void) {
    batch(() => {
      state.extrasOpen = true;
      state.playGame = playGame;
    });
  }

=======
      state.isDownloading = props.downloadHandler.getDownloads().filter((d) => d.status !== 'finished')?.length > 0
    }, 1000)
  });

  async function openExtrasMenu(playGame: () => void) {
    batch(() => {
      state.extrasOpen = true;
      state.playGame = playGame;
    })
  }

>>>>>>> aa45f04 (feat: move to solid-js)
  return (
    <>
      <TopBar>
        <div
          id="settingsBtn"
<<<<<<< HEAD
          onClick={() => (state.optionsOpen = !state.optionsOpen)}
          class="TopButton">
=======
          onClick={() => state.optionsOpen = !state.optionsOpen}
          class="TopButton"
        >
>>>>>>> aa45f04 (feat: move to solid-js)
          <img src={cogBtn} alt="settings" />
        </div>
        <div
          id="downloadsBtn"
          class="TopButton"
<<<<<<< HEAD
          onClick={() => (state.downloadsOpen = !state.downloadsOpen)}>
=======
          onClick={() => state.downloadsOpen = !state.downloadsOpen}
        >
>>>>>>> aa45f04 (feat: move to solid-js)
          <img src={downBtn} alt="downloads" />
        </div>
        <Show when={state.migotoSet} keyed={false}>
          <div
            id="modsBtn"
            onClick={() => {
              // Create and dispatch a custom "openMods" event
<<<<<<< HEAD
              const event = new CustomEvent('changePage', {
                detail: 'modding',
              });
              window.dispatchEvent(event);
            }}
            class="TopButton">
=======
              const event = new CustomEvent('changePage', { detail: 'modding' })
              window.dispatchEvent(event)
            }}
            class="TopButton"
          >
>>>>>>> aa45f04 (feat: move to solid-js)
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
<<<<<<< HEAD
        <ExtrasMenu
          closeFn={() => (state.extrasOpen = false)}
          playGame={state.playGame}>
=======
        <ExtrasMenu closeFn={() => state.extrasOpen = false} playGame={state.playGame}>
>>>>>>> aa45f04 (feat: move to solid-js)
          Yo
        </ExtrasMenu>
      </Show>

      <Show when={state.miniDownloadsOpen} keyed={false}>
        <div class="MiniDownloads" id="miniDownloadContainer">
          <MiniDialog
            title="Downloads"
<<<<<<< HEAD
            closeFn={() => (state.miniDownloadsOpen = false)}>
=======
            closeFn={() => state.miniDownloadsOpen = false}
          >
>>>>>>> aa45f04 (feat: move to solid-js)
            <DownloadList downloadManager={props.downloadHandler} />
          </MiniDialog>
          <div class="arrow-down" />
        </div>
      </Show>

      <Show when={state.downloadsOpen} keyed={false}>
        <Downloads
          downloadManager={props.downloadHandler}
<<<<<<< HEAD
          closeFn={() => (state.downloadsOpen = false)}
=======
          closeFn={() => state.downloadsOpen = false}
>>>>>>> aa45f04 (feat: move to solid-js)
        />
      </Show>

      <Show when={state.optionsOpen} keyed={false}>
<<<<<<< HEAD
        <Options
          closeFn={() => (state.optionsOpen = !state.optionsOpen)}
          downloadManager={props.downloadHandler}
        />
=======
        <Options closeFn={() => state.optionsOpen = !state.optionsOpen} downloadManager={props.downloadHandler} />
>>>>>>> aa45f04 (feat: move to solid-js)
      </Show>

      <Show when={state.gameDownloadsOpen} keyed={false}>
        <Game
          downloadManager={props.downloadHandler}
<<<<<<< HEAD
          closeFn={() => (state.gameDownloadsOpen = false)}
=======
          closeFn={() => state.gameDownloadsOpen = false}
>>>>>>> aa45f04 (feat: move to solid-js)
        />
      </Show>

      <div class="BottomSection" id="bottomSectionContainer">
        <ServerLaunchSection openExtras={openExtrasMenu} />
        <div
          id="DownloadProgress"
<<<<<<< HEAD
          onClick={() => (state.miniDownloadsOpen = !state.miniDownloadsOpen)}>
=======
          onClick={() => state.miniDownloadsOpen = !state.miniDownloadsOpen}
        >
>>>>>>> aa45f04 (feat: move to solid-js)
          <Show when={state.isDownloading} keyed={false}>
            <MainProgressBar downloadManager={props.downloadHandler} />
          </Show>
        </div>
      </div>
    </>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
