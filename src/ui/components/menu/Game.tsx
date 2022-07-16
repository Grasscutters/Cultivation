import React from 'react'
import Menu from './Menu'
import Tr, { translate } from '../../../utils/language'
import DownloadHandler from '../../../utils/download'

import './Game.css'
import DirInput from '../common/DirInput'
import BigButton from '../common/BigButton'
import HelpButton from '../common/HelpButton'
import { unzip } from '../../../utils/zipUtils'
import { getVersionCache } from '../../../utils/resources'

interface IProps {
  closeFn: () => void;
  downloadManager: DownloadHandler;
}

interface IState {
  gameDownloading: boolean;
  gameDownloadFolder: string;
  dirPlaceholder: string;
  clientDownloadLink: string | null | undefined;
}

export default class Downloads extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      gameDownloading: false,
      gameDownloadFolder: '',
      dirPlaceholder: '',
      clientDownloadLink: ''
    }

    this.downloadGame = this.downloadGame.bind(this)
  }

  async componentDidMount() {
    const versionCache = await getVersionCache()

    this.setState({
      dirPlaceholder: await translate('components.select_folder'),
      clientDownloadLink: versionCache?.client_download_link
    })
  }

  async downloadGame() {
    const folder = this.state.gameDownloadFolder
    this.props.downloadManager.addDownload(this.state.clientDownloadLink, folder + '\\game.zip', () =>{
      unzip(folder + '\\game.zip', folder + '\\', () => {
        this.setState({
          gameDownloading: false
        })
      })
    })

    this.setState({
      gameDownloading: true
    })
  }

  render() {
    return (
      <Menu heading='Download Game' closeFn={this.props.closeFn} className="GameDownloadMenu">
        <div className="GameDownload">
          {
            this.state.gameDownloadFolder !== '' && !this.state.gameDownloading && this.state.clientDownloadLink ?
              <BigButton id="downloadGameBtn" onClick={this.downloadGame}>Download Game</BigButton>
              : <BigButton id="disabledGameBtn" onClick={() => null} disabled>Download Game</BigButton>
          }
          <HelpButton>
            <Tr text="main.game_help_text" />
          </HelpButton>
        </div>
        
        <div className="GameDownloadDir">
          <DirInput folder placeholder={this.state.dirPlaceholder} clearable={false} readonly={true} onChange={(value: string) => this.setState({
            gameDownloadFolder: value
          })}/>
        </div>
      </Menu>
    )
  }
}