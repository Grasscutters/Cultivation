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
import { ExtrasMenu } from './components/menu/ExtrasMenu'
import Notification from './components/common/Notification'

import { getConfigOption, setConfigOption } from '../utils/configuration'
import { invoke } from '@tauri-apps/api'
import { getVersion } from '@tauri-apps/api/app'
import { listen } from '@tauri-apps/api/event'
import { dataDir } from '@tauri-apps/api/path'
import { appWindow } from '@tauri-apps/api/window'
import { unpatchGame } from '../utils/rsa'
import DownloadHandler from '../utils/download'

// Graphics
import cogBtn from '../resources/icons/cog.svg'
import downBtn from '../resources/icons/download.svg'
import wrenchBtn from '../resources/icons/wrench.svg'

interface IProps {
  downloadHandler: DownloadHandler
}

interface IState {
  isDownloading: boolean
  optionsOpen: boolean
  miniDownloadsOpen: boolean
  downloadsOpen: boolean
  gameDownloadsOpen: boolean
  extrasOpen: boolean
  migotoSet: boolean
  playGame: (exe?: string, proc_name?: string) => void
  notification: React.ReactElement | null
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
      extrasOpen: false,
      migotoSet: false,
      playGame: () => {
        alert('Error launching game')
      },
      notification: null,
    }

    listen('lang_error', (payload) => {
      console.log(payload)
    })

    listen('jar_extracted', ({ payload }: { payload: string }) => {
      setConfigOption('grasscutter_path', payload)
    })

    listen('migoto_extracted', ({ payload }: { payload: string }) => {
      setConfigOption('migoto_path', payload)

      invoke('set_migoto_target', {
        migotoPath: payload,
      })
    })

    // Emitted for rsa replacing-purposes
    listen('game_closed', async () => {
      const wasPatched = await getConfigOption('patch_rsa')

      if (wasPatched) {
        const unpatched = await unpatchGame()

        if (unpatched) {
          alert(`Could not unpatch game! (Delete version.dll in your game folder)`)
        }
      }
    })

    listen('migoto_set', async () => {
      this.setState({
        migotoSet: !!(await getConfigOption('migoto_path')),
      })

      window.location.reload()
    })

    // Emitted for automatic processes
    listen('grasscutter_closed', async () => {
      const autoService = await getConfigOption('auto_mongodb')

      if (autoService) {
        await invoke('stop_service', { service: 'MongoDB' })
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

    this.openExtrasMenu = this.openExtrasMenu.bind(this)
  }

  async componentDidMount() {
    const cert_generated = await getConfigOption('cert_generated')

    this.setState({
      migotoSet: !!(await getConfigOption('migoto_path')),
    })

    if (!cert_generated) {
      // Generate the certificate
      await invoke('generate_ca_files', {
        path: (await dataDir()) + 'cultivation',
      })

      await setConfigOption('cert_generated', true)
    }

    // Ensure old configs are updated to use RSA
    const updatedConfig = await getConfigOption('patch_rsa')
    await setConfigOption('patch_rsa', updatedConfig)

    // Get latest version and compare to this version
    const latestVersion: {
      tag_name: string
      link: string
    } = await invoke('get_latest_release')
    const tagName = latestVersion?.tag_name.replace(/[^\d.]/g, '')

    // Check if tagName is different than current version
    if (tagName && tagName !== (await getVersion())) {
      // Display notification of new release
      this.setState({
        notification: (
          <>
            Cultivation{' '}
            <a href="#" onClick={() => invoke('open_in_browser', { url: latestVersion.link })}>
              {latestVersion?.tag_name}
            </a>{' '}
            is now available!
          </>
        ),
      })

      setTimeout(() => {
        this.setState({
          notification: null,
        })
      }, 6000)
    }

    // Period check to only show progress bar when downloading files
    setInterval(() => {
      this.setState({
        isDownloading: this.props.downloadHandler.getDownloads().filter((d) => d.status !== 'finished')?.length > 0,
      })
    }, 1000)
  }

  async openExtrasMenu(playGame: () => void) {
    this.setState({
      extrasOpen: true,
      playGame,
    })
  }

  render() {
    return (
      <>
        <TopBar>
          <div
            id="settingsBtn"
            onClick={() => this.setState({ optionsOpen: !this.state.optionsOpen })}
            className="TopButton"
          >
            <img src={cogBtn} alt="settings" />
          </div>
          <div
            id="downloadsBtn"
            className="TopButton"
            onClick={() => this.setState({ downloadsOpen: !this.state.downloadsOpen })}
          >
            <img src={downBtn} alt="downloads" />
          </div>
          {this.state.migotoSet && (
            <div
              id="modsBtn"
              onClick={() => {
                // Create and dispatch a custom "openMods" event
                const event = new CustomEvent('changePage', { detail: 'modding' })
                window.dispatchEvent(event)
              }}
              className="TopButton"
            >
              <img src={wrenchBtn} alt="mods" />
            </div>
          )}
          {/* <div id="gameBtn" className="TopButton" onClick={() => this.setState({ gameDownloadsOpen: !this.state.gameDownloadsOpen })}>
            <img src={gameBtn} alt="game" />
          </div> */}
        </TopBar>

        <Notification show={!!this.state.notification}>{this.state.notification}</Notification>

        <RightBar />

        <NewsSection />

        {
          // Extras section
          this.state.extrasOpen && (
            <ExtrasMenu closeFn={() => this.setState({ extrasOpen: false })} playGame={this.state.playGame}>
              Yo
            </ExtrasMenu>
          )
        }

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
          <ServerLaunchSection openExtras={this.openExtrasMenu} />

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
