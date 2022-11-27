<<<<<<< HEAD
import { createSignal, onMount, Show } from 'solid-js';

import DownloadHandler from '../../../utils/download';
import { translate } from '../../../utils/language';
import { unzip } from '../../../utils/zipUtils';
import BigButton from '../common/BigButton';
import DirInput from '../common/DirInput';
import HelpButton from '../common/HelpButton';
import Menu from './Menu';
=======
import Menu from './Menu'
import { translate } from '../../../utils/language'
import DownloadHandler from '../../../utils/download'

import './Game.css'
import DirInput from '../common/DirInput'
import BigButton from '../common/BigButton'
import HelpButton from '../common/HelpButton'
import { unzip } from '../../../utils/zipUtils'
import {createSignal, onMount, Show} from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

import './Game.css';

const GAME_DOWNLOAD = '';

interface IProps {
  closeFn: () => void;
  downloadManager: DownloadHandler;
}

export default function Downloads(props: IProps) {
  const [gameDownloading, setGameDownloading] = createSignal(false);
  const [gameDownloadFolder, setGameDownloadFolder] = createSignal('');
  const [dirPlaceholder, setDirPlaceholder] = createSignal('');

<<<<<<< HEAD
  onMount(async () =>
    setDirPlaceholder(await translate('components.select_folder'))
  );

  async function downloadGame() {
    const folder = gameDownloadFolder();
    props.downloadManager.addDownload(
      GAME_DOWNLOAD,
      folder + '\\game.zip',
      async () => {
        await unzip(folder + '\\game.zip', folder + '\\', true);
        setGameDownloading(false);
      }
    );
=======
  onMount(async () => setDirPlaceholder(await translate('components.select_folder')));

  async function downloadGame() {
    const folder = gameDownloadFolder();
    props.downloadManager.addDownload(GAME_DOWNLOAD, folder + '\\game.zip', async () => {
      await unzip(folder + '\\game.zip', folder + '\\', true)
      setGameDownloading(false);
    })
>>>>>>> aa45f04 (feat: move to solid-js)

    setGameDownloading(true);
  }

  return (
<<<<<<< HEAD
    <Menu
      heading="Download Game"
      closeFn={props.closeFn}
      class="GameDownloadMenu">
      <div class="GameDownload">
        <Show
          when={gameDownloadFolder() !== '' && !gameDownloading()}
          keyed={false}
          fallback={
            <BigButton id="disabledGameBtn" onClick={() => null} disabled>
              Download Game
            </BigButton>
          }>
=======
    <Menu heading="Download Game" closeFn={props.closeFn} class="GameDownloadMenu">
      <div class="GameDownload">
        <Show when={gameDownloadFolder() !== '' && !gameDownloading()} keyed={false} fallback={(
          <BigButton id="disabledGameBtn" onClick={() => null} disabled>
            Download Game
          </BigButton>
        )}>
>>>>>>> aa45f04 (feat: move to solid-js)
          <BigButton id="downloadGameBtn" onClick={downloadGame}>
            Download Game
          </BigButton>
        </Show>
        <HelpButton contents="main.game_help_text" />
      </div>

      <div class="GameDownloadDir">
        <DirInput
          folder
          placeholder={dirPlaceholder()}
          clearable={false}
          readonly={true}
          onChange={setGameDownloadFolder}
        />
      </div>
    </Menu>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
