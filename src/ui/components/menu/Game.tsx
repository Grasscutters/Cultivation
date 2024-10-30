import React from 'react'
import Menu from './Menu'
import { translate } from '../../../utils/language'
import DownloadHandler from '../../../utils/download'

import './Game.css'
import DirInput from '../common/DirInput'
import BigButton from '../common/BigButton'
import HelpButton from '../common/HelpButton'
import { unzip } from '../../../utils/zipUtils'

const GAME_DOWNLOAD = ''

interface IProps {
  closeFn: () => void
  downloadManager: DownloadHandler
}

interface IState {
  gameDownloading: boolean
  gameDownloadFolder: string
  dirPlaceholder: string
}

export default class Downloads extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      gameDownloading: false,
      gameDownloadFolder: '',
      dirPlaceholder: '',
    }

    this.downloadGame = this.downloadGame.bind(this)
  }

  async componentDidMount() {
    this.setState({
      dirPlaceholder: await translate('components.select_folder'),
    })

    console.log(this.state)
  }

  async downloadGame() {
    const folder = this.state.gameDownloadFolder
    this.props.downloadManager.addDownload(GAME_DOWNLOAD, folder + '\\game.zip', async () => {
      await unzip(folder + '\\game.zip', folder + '\\', true)
      this.setState({
        gameDownloading: false,
      })
    })

    this.setState({
      gameDownloading: true,
    })
  }

  render() {
    return (
      <Menu heading="Download Game" closeFn={this.props.closeFn} className="GameDownloadMenu">
        <div className="GameDownload">
          {this.state.gameDownloadFolder !== '' && !this.state.gameDownloading ? (
            <BigButton id="downloadGameBtn" onClick={this.downloadGame}>
              Download Game
            </BigButton>
          ) : (
            <BigButton id="disabledGameBtn" onClick={() => null} disabled>
              Download Game
            </BigButton>
          )}
          <HelpButton contents="main.game_help_text" />
        </div>

        <div className="GameDownloadDir">
          <DirInput
            folder
            placeholder={this.state.dirPlaceholder}
            clearable={false}
            readonly={true}
            onChange={(value: string) =>
              this.setState({
                gameDownloadFolder: value,
              })
            }
          />
        </div>
      </Menu>
    )
  }
}
