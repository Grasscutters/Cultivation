import Menu from './Menu'
import { translate } from '../../../utils/language'
import DownloadHandler from '../../../utils/download'

import './Game.css'
import DirInput from '../common/DirInput'
import BigButton from '../common/BigButton'
import HelpButton from '../common/HelpButton'
import { unzip } from '../../../utils/zipUtils'
import {createSignal, onMount, Show} from "solid-js";

const GAME_DOWNLOAD = ''

interface IProps {
  closeFn: () => void
  downloadManager: DownloadHandler
}

export default function Downloads(props: IProps) {
  const [gameDownloading, setGameDownloading] = createSignal(false);
  const [gameDownloadFolder, setGameDownloadFolder] = createSignal('');
  const [dirPlaceholder, setDirPlaceholder] = createSignal('');

  onMount(async () => setDirPlaceholder(await translate('components.select_folder')));

  async function downloadGame() {
    const folder = gameDownloadFolder();
    props.downloadManager.addDownload(GAME_DOWNLOAD, folder + '\\game.zip', async () => {
      await unzip(folder + '\\game.zip', folder + '\\', true)
      setGameDownloading(false);
    })

    setGameDownloading(true);
  }

  return (
    <Menu heading="Download Game" closeFn={props.closeFn} class="GameDownloadMenu">
      <div class="GameDownload">
        <Show when={gameDownloadFolder() !== '' && !gameDownloading()} keyed={false} fallback={(
          <BigButton id="disabledGameBtn" onClick={() => null} disabled>
            Download Game
          </BigButton>
        )}>
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
  )
}
