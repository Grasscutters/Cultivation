import React from 'react'
import Menu from './Menu'
import Tr, { translate } from '../../../utils/language'
import DownloadHandler from '../../../utils/download'

import './Game.css'
import DirInput from '../common/DirInput'
import BigButton from '../common/BigButton'
import HelpButton from '../common/HelpButton'

interface IProps {
  closeFn: () => void;
  downloadManager: DownloadHandler;
}

interface IState {
  gameDownloading: boolean;
  gameDownloadFolder: string;
  dirPlaceholder: string;
}

export default class Downloads extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      gameDownloading: false,
      gameDownloadFolder: '',
      dirPlaceholder: ''
    }
  }

  async componentDidMount() {
    this.setState({
      dirPlaceholder: await translate('components.select_folder')
    })
  }

  downloadGame() {
    console.log('Download!')
  }

  render() {
    return (
      <Menu heading='Download Game' closeFn={this.props.closeFn} className="GameDownloadMenu">
        <div className="GameDownload">
          <BigButton id="downloadGameBtn" onClick={this.downloadGame}>Download Game</BigButton>
          <HelpButton>
            <Tr text="main.game_help_text" />
          </HelpButton>
        </div>
        
        <div className="GameDownloadDir">
          <DirInput placeholder={this.state.dirPlaceholder} clearable={false} readonly={false} onChange={(value: string) => this.setState({
            gameDownloading: true,
            gameDownloadFolder: value
          })}/>
        </div>
      </Menu>
    )
  }
}