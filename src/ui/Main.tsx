import React from 'react'

// Major Components
import TopBar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import MainProgressBar from './components/common/MainProgressBar'
import Options from './components/menu/Options'
import MiniDialog from './components/MiniDialog'
import DownloadList from './components/common/DownloadList'
import Downloads from './components/menu/Downloads'
import NewsSection from './components/news/NewsSection'
import Game from './components/menu/Game'
import RightBar from './components/RightBar'

import { getConfigOption, setConfigOption } from '../utils/configuration'
import { invoke } from '@tauri-apps/api'
import { listen } from '@tauri-apps/api/event'
import { dataDir } from '@tauri-apps/api/path'
import { appWindow } from '@tauri-apps/api/window'
import { unpatchGame } from '../utils/metadata'
import DownloadHandler from '../utils/download'

interface IProps {
  downloadHandler: DownloadHandler
}

interface IState {
  isDownloading: boolean
  optionsOpen: boolean
  miniDownloadsOpen: boolean
  downloadsOpen: boolean
  gameDownloadsOpen: boolean
  moddingOpen: boolean
}

export class Main extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isDownloading: false,
      optionsOpen: false,
      miniDownloadsOpen: false,
      downloadsOpen: false,
      gameDownloadsOpen: false,
      moddingOpen: false,
    }

    invoke('list_submissions')

    listen('lang_error', (payload) => {
      console.log(payload)
    })

    listen('jar_extracted', ({ payload }: { payload: string }) => {
      setConfigOption('grasscutter_path', payload)
    })

    // Emitted for metadata replacing-purposes
    listen('game_closed', async () => {
      const wasPatched = await getConfigOption('patch_metadata')

      if (wasPatched) {
        const unpatched = await unpatchGame()

        console.log(`unpatched game? ${unpatched}`)

        if (!unpatched) {
          alert(
            `Could not unpatch game! (You should be able to find your metadata backup in ${await dataDir()}\\cultivation\\)`
          )
        }
      }
    })

    let min = false

    // periodically check if we need to min/max based on whether the game is open
    setInterval(async () => {
      const gameOpen = await invoke('is_game_running')

      if (gameOpen && !min) {
        appWindow.minimize()
        min = true
      } else if (!gameOpen && min) {
        appWindow.unminimize()
        min = false
      }
    }, 1000)
  }

  async componentDidMount() {
    const cert_generated = await getConfigOption('cert_generated')

    if (!cert_generated) {
      // Generate the certificate
      await invoke('generate_ca_files', {
        path: (await dataDir()) + 'cultivation',
      })

      await setConfigOption('cert_generated', true)
    }

    // Period check to only show progress bar when downloading files
    setInterval(() => {
      this.setState({
        isDownloading: this.props.downloadHandler.getDownloads().filter((d) => d.status !== 'finished')?.length > 0,
      })
    }, 1000)
  }

  render() {
    return (
      <>
        <TopBar
          optFunc={() => {
            this.setState({ optionsOpen: !this.state.optionsOpen })
          }}
          downFunc={() => this.setState({ downloadsOpen: !this.state.downloadsOpen })}
          gameFunc={() => this.setState({ gameDownloadsOpen: !this.state.gameDownloadsOpen })}
          modFunc={() => this.setState({ moddingOpen: !this.state.moddingOpen })}
        />

        <RightBar />

        <NewsSection />

        {
          // Mini downloads section
          this.state.miniDownloadsOpen ? (
            <div className="MiniDownloads" id="miniDownloadContainer">
              <MiniDialog
                title="Downloads"
                closeFn={() => {
                  this.setState({ miniDownloadsOpen: false })
                }}
              >
                <DownloadList downloadManager={this.props.downloadHandler} />
              </MiniDialog>
              <div className="arrow-down"></div>
            </div>
          ) : null
        }

        {
          // Download menu
          this.state.downloadsOpen ? (
            <Downloads
              downloadManager={this.props.downloadHandler}
              closeFn={() => this.setState({ downloadsOpen: false })}
            />
          ) : null
        }

        {
          // Options menu
          this.state.optionsOpen ? (
            <Options
              downloadManager={this.props.downloadHandler}
              closeFn={() => this.setState({ optionsOpen: !this.state.optionsOpen })}
            />
          ) : null
        }

        {
          // Game downloads menu
          this.state.gameDownloadsOpen ? (
            <Game
              downloadManager={this.props.downloadHandler}
              closeFn={() => this.setState({ gameDownloadsOpen: false })}
            />
          ) : null
        }

        <div className="BottomSection" id="bottomSectionContainer">
          <ServerLaunchSection />

          <div
            id="DownloadProgress"
            onClick={() => this.setState({ miniDownloadsOpen: !this.state.miniDownloadsOpen })}
          >
            {this.state.isDownloading ? <MainProgressBar downloadManager={this.props.downloadHandler} /> : null}
          </div>
        </div>
      </>
    )
  }
}
