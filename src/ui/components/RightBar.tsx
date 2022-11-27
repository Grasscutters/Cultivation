import { invoke } from '@tauri-apps/api';

import Discord from '../../resources/icons/discord.svg';
import Github from '../../resources/icons/github.svg';

import './RightBar.css';

const DISCORD = 'https://discord.gg/T5vZU6UyeG';
const GITHUB = 'https://github.com/Grasscutters/Grasscutter';

export default function RightBar() {
  function openInBrowser(url: string) {
    invoke('open_in_browser', { url });
  }

  return (
    <div class="RightBar" id="rightBarContainer">
      <div class="RightBarInner" id="rightBarContent">
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
          <img src={Github} />
        </div>
      </div>
    </div>
  );
}
