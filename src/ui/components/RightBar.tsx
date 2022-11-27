<<<<<<< HEAD
import { invoke } from '@tauri-apps/api';
=======
import { invoke } from '@tauri-apps/api'
>>>>>>> aa45f04 (feat: move to solid-js)

import Discord from '../../resources/icons/discord.svg';
import Github from '../../resources/icons/github.svg';

import './RightBar.css';

const DISCORD = 'https://discord.gg/T5vZU6UyeG';
const GITHUB = 'https://github.com/Grasscutters/Grasscutter';

export default function RightBar() {
  function openInBrowser(url: string) {
<<<<<<< HEAD
    invoke('open_in_browser', { url });
=======
    invoke('open_in_browser', { url })
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  return (
    <div class="RightBar" id="rightBarContainer">
      <div class="RightBarInner" id="rightBarContent">
<<<<<<< HEAD
        <div
          class="BarDiscord BarImg"
          id="rightBarButtonDiscord"
          onClick={() => openInBrowser(DISCORD)}>
          <img src={Discord} />
        </div>
        <div
          class="BarGithub BarImg"
          id="rightBarButtonGithub"
          onClick={() => openInBrowser(GITHUB)}>
=======
        <div class="BarDiscord BarImg" id="rightBarButtonDiscord" onClick={() => openInBrowser(DISCORD)}>
          <img src={Discord} />
        </div>
        <div class="BarGithub BarImg" id="rightBarButtonGithub" onClick={() => openInBrowser(GITHUB)}>
>>>>>>> aa45f04 (feat: move to solid-js)
          <img src={Github} />
        </div>
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
