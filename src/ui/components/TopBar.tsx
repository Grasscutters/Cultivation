<<<<<<< HEAD
import { batch, createSignal, JSX, onCleanup, onMount } from 'solid-js';
import { app } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';

import closeIcon from '../../resources/icons/close.svg';
import minIcon from '../../resources/icons/min.svg';
import { getConfig, setConfigOption } from '../../utils/configuration';
import Tr from '../../utils/language';

import './TopBar.css';

interface IProps {
  children?: JSX.Element;
=======
import { app } from '@tauri-apps/api'
import { appWindow } from '@tauri-apps/api/window'
import { getConfig, setConfigOption } from '../../utils/configuration'
import Tr from '../../utils/language'

import './TopBar.css'
import closeIcon from '../../resources/icons/close.svg'
import minIcon from '../../resources/icons/min.svg'
import { batch, createSignal, JSX, onCleanup, onMount } from "solid-js";

interface IProps {
  children?: JSX.Element
>>>>>>> aa45f04 (feat: move to solid-js)
}

export default function TopBar(props: IProps) {
  const [version, setVersion] = createSignal('0.0.0');
  const [clicks, setClicks] = createSignal(0);
  const [intv, setIntv] = createSignal<number | null>(null);

  onMount(async () => {
    const version = await app.getVersion();
    setVersion(version);
  });

  onCleanup(() => {
    const handle = intv();

    handle && clearTimeout(handle);
  });

  function handleClose() {
    appWindow.close();
  }

  function handleMinimize() {
    appWindow.minimize();
  }

  async function activateClick() {
<<<<<<< HEAD
    const config = await getConfig();
=======
    const config = await getConfig()
>>>>>>> aa45f04 (feat: move to solid-js)

    // They already got it, no need to reactivate
    if (config.swag_mode) return;

    if (clicks() === 2) {
      setTimeout(() => {
        // Have got to clear it, so it goes back to regular colors
<<<<<<< HEAD
        setClicks(0);
      }, 600);
=======
        setClicks(0)
      }, 600)
>>>>>>> aa45f04 (feat: move to solid-js)

      // Activate... SWAG MODE
      await setConfigOption('swag_mode', true);

      // Reload the window
      window.location.reload();

      return;
    }

    if (clicks() < 3) {
      batch(() => {
        setClicks((clicks) => clicks + 1);
<<<<<<< HEAD
        setIntv(window.setTimeout(() => setClicks(0), 1500));
      });
=======
        setIntv(window.setTimeout(() => setClicks(0), 1500))
      });

      return
>>>>>>> aa45f04 (feat: move to solid-js)
    }
  }

  return (
    <div class="TopBar" id="topBarContainer" data-tauri-drag-region>
      <div id="title">
<<<<<<< HEAD
        <span data-tauri-drag-region>
          <Tr text="main.title" />
        </span>
        <span data-tauri-drag-region id="version">
          {version()}
        </span>
=======
          <span data-tauri-drag-region>
            <Tr text="main.title" />
          </span>
        <span data-tauri-drag-region id="version">
            {version()}
          </span>
>>>>>>> aa45f04 (feat: move to solid-js)
      </div>
      {/**
       * HEY YOU
       *
       * If you're looking at the source code to find the swag mode thing, that's okay! If you're not, move along...
       * Just do me a favor and don't go telling everyone about how you found it. If you are just helping someone who
       * for some reason needs it, that's fine, but not EVERYONE needs it, which is why it exists in the first place.
       */}
<<<<<<< HEAD
      <div
        id="unassumingButton"
        class={clicks() === 2 ? 'spin' : ''}
        onClick={activateClick}>
=======
      <div id="unassumingButton" class={clicks() === 2 ? 'spin' : ''} onClick={activateClick}>
>>>>>>> aa45f04 (feat: move to solid-js)
        ?
      </div>
      <div class="TopBtns" id="topBarButtonContainer">
        <div id="closeBtn" onClick={handleClose} class="TopButton">
          <img src={closeIcon} alt="close" />
        </div>
        <div id="minBtn" onClick={handleMinimize} class="TopButton">
          <img src={minIcon} alt="minimize" />
        </div>
        {props.children}
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
