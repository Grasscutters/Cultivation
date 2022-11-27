<<<<<<< HEAD
import { createSignal, Match, onMount, Switch } from 'solid-js';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';

import { getConfigOption } from '../utils/configuration';
import DownloadHandler from '../utils/download';
import { getTheme, loadTheme } from '../utils/themes';
import { Main } from './Main';
import { Mods } from './Mods';

import './App.css';
=======
import './App.css'

import DownloadHandler from '../utils/download'
import { getConfigOption } from '../utils/configuration'
import { getTheme, loadTheme } from '../utils/themes'
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri'
import { Main } from './Main'
import { Mods } from './Mods'
import { createSignal, Match, onMount, Switch } from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

const downloadHandler = new DownloadHandler();
const DEFAULT_BG = 'https://api.grasscutter.io/cultivation/bgfile';

export default function App() {
  const [page, setPage] = createSignal('main');
  const [bgFile, setBgFile] = createSignal(DEFAULT_BG);

  onMount(async () => {
    // Load a theme if it exists
    const theme = await getConfigOption('theme');
    if (theme && theme !== 'default') {
      const themeObj = await getTheme(theme);
      await loadTheme(themeObj, document);
    }

    // Get custom bg AFTER theme is loaded !! important !!
    const custom_bg = await getConfigOption('customBackground');

    if (custom_bg) {
      const isUrl = /^http(s)?:\/\//gm.test(custom_bg);

      if (!isUrl) {
        const isValid = await invoke('dir_exists', {
          path: custom_bg,
        });

        setBgFile(isValid ? convertFileSrc(custom_bg) : DEFAULT_BG);
      } else {
        // Check if URL returns a valid image.
        const isValid = await invoke('valid_url', {
          url: custom_bg,
        });

        setBgFile(isValid ? custom_bg : DEFAULT_BG);
      }
    }

    window.addEventListener('changePage', (e) => {
      // @ts-expect-error - TS doesn't like our custom event
      setPage(e.detail);
<<<<<<< HEAD
    });
=======
    })
>>>>>>> aa45f04 (feat: move to solid-js)
  });

  return (
    <div
      class="App"
      style={
        bgFile()
          ? {
<<<<<<< HEAD
              background: `url("${bgFile()}") fixed`,
            }
          : {}
      }>
=======
            background: `url("${bgFile()}") fixed`,
          }
          : {}
      }
    >
>>>>>>> aa45f04 (feat: move to solid-js)
      <Switch fallback={<Main downloadHandler={downloadHandler} />}>
        <Match when={page() === 'modding'} keyed={false}>
          <Mods downloadHandler={downloadHandler} />
        </Match>
      </Switch>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
