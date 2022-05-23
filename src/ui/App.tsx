import React from 'react'
import { listen } from '@tauri-apps/api/event'
import './App.css'

import DownloadHandler from '../utils/download'

// Major Components
import TopBar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import MainProgressBar from './components/common/MainProgressBar'
import Options from './components/menu/Options'
import MiniDialog from './components/MiniDialog'
import DownloadList from './components/common/DownloadList'
import Downloads from './components/menu/Downloads'
import NewsSection from './components/news/NewsSection'
import RightBar from './components/RightBar'
import { getConfigOption, setConfigOption } from '../utils/configuration'
import { invoke } from '@tauri-apps/api'

interface IProps {
  [key: string]: never;
}

interface IState {
  isDownloading: boolean;
  optionsOpen: boolean;
  miniDownloadsOpen: boolean;
  downloadsOpen: boolean;
  bgFile: string;
}

const downloadHandler = new DownloadHandler()

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isDownloading: false,
      optionsOpen: false,
      miniDownloadsOpen: false,
      downloadsOpen: false,
      bgFile: 'https://webstatic.hoyoverse.com/upload/event/2020/11/04/7fd661b5184e1734f91f628b6f89a31f_7367318474207189623.png',
    }

    listen('lang_error', (payload) => {
      console.log(payload)
    })

    listen('jar_extracted', ({ payload }) => {
      setConfigOption('grasscutter_path', payload)
    })
  }

  async componentDidMount() {
    const game_exe = await getConfigOption('game_install_path')
    const game_path = game_exe.substring(0, game_exe.lastIndexOf('\\'))
    const root_path = game_path.substring(0, game_path.lastIndexOf('\\'))

    if (game_path) {
      // Get the bg by invoking, then set the background to that bg
      const bgLoc: string = await invoke('get_bg_file', {
        bgPath: root_path,
      })

      if (bgLoc) {
        this.setState({
          bgFile: bgLoc
        })
      }
    }
  }

  render() {
    return (
      <div className="App" style={
        this.state.bgFile ? {
          background: `url(${this.state.bgFile}) no-repeat center center fixed`,
        } : {}
      }>
        <TopBar
          optFunc={() => {
            this.setState({ optionsOpen: !this.state.optionsOpen })
          }}
          downFunc={() => this.setState({ downloadsOpen: !this.state.downloadsOpen })}
        />

        <RightBar />

        <NewsSection />

        {
          // Mini downloads section
          this.state.miniDownloadsOpen ? (
            <div className="MiniDownloads">
              <MiniDialog
                title="Downloads"
                closeFn={() => {
                  this.setState({ miniDownloadsOpen: false })
                }}
              >
                <DownloadList downloadManager={downloadHandler} />
              </MiniDialog>
              <div className="arrow-down"></div>
            </div>
          ) : null
        }

        {
          // Download menu
          this.state.downloadsOpen ? (
            <Downloads
              downloadManager={downloadHandler}
              closeFn={() => this.setState({ downloadsOpen: false })}
            />
          ) : null
        }

        {
          // Options menu
          this.state.optionsOpen ? (
            <Options
              closeFn={() => this.setState({ optionsOpen: !this.state.optionsOpen })}
            />
          ) : null
        }

        <div className="BottomSection">
          <ServerLaunchSection />

          <div id="DownloadProgress"
            onClick={() => this.setState({ miniDownloadsOpen: !this.state.miniDownloadsOpen })}
          >
            <MainProgressBar downloadManager={downloadHandler} />
          </div>
        </div>
      </div>
    )
  }
}

export default App
