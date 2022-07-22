import React from 'react'
import './App.css'

import DownloadHandler from '../utils/download'
import { getConfigOption } from '../utils/configuration'
import { getTheme, loadTheme } from '../utils/themes'
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri'
import { dataDir } from '@tauri-apps/api/path'
import { Main } from './Main'
import { Mods } from './Mods'

interface IState {
  page: string
  bgFile: string
}

const downloadHandler = new DownloadHandler()
const DEFAULT_BG = 'https://api.grasscutter.io/cultivation/bgfile'

class App extends React.Component<Readonly<unknown>, IState> {
  constructor(props: Readonly<unknown>) {
    super(props)

    this.state = {
      page: 'main',
      bgFile: DEFAULT_BG,
    }
  }

  async componentDidMount() {
    const game_exe = await getConfigOption('game_install_path')
    const game_path = game_exe?.substring(0, game_exe.replace(/\\/g, '/').lastIndexOf('/')) || ''
    const root_path = game_path?.substring(0, game_path.replace(/\\/g, '/').lastIndexOf('/')) || ''

    // Load a theme if it exists
    const theme = await getConfigOption('theme')
    if (theme && theme !== 'default') {
      const themeObj = await getTheme(theme)
      await loadTheme(themeObj, document)
    }

    // Get custom bg AFTER theme is loaded !! important !!
    const custom_bg = await getConfigOption('customBackground')

    if (!custom_bg || !/png|jpg|jpeg$/.test(custom_bg)) {
      if (game_path) {
        // Get the bg by invoking, then set the background to that bg.
        const bgLoc: string = await invoke('get_bg_file', {
          bgPath: root_path,
          appdata: await dataDir(),
        })

        bgLoc &&
          this.setState(
            {
              bgFile: bgLoc,
            },
            this.forceUpdate
          )
      }
    } else {
      const isUrl = /^http(s)?:\/\//gm.test(custom_bg)

      if (!isUrl) {
        const isValid = await invoke('dir_exists', {
          path: custom_bg,
        })

        this.setState(
          {
            bgFile: isValid ? convertFileSrc(custom_bg) : DEFAULT_BG,
          },
          this.forceUpdate
        )
      } else {
        // Check if URL returns a valid image.
        const isValid = await invoke('valid_url', {
          url: custom_bg,
        })

        this.setState(
          {
            bgFile: isValid ? custom_bg : DEFAULT_BG,
          },
          this.forceUpdate
        )
      }
    }

    window.addEventListener('changePage', (e) => {
      this.setState({
        // @ts-expect-error - TS doesn't like our custom event
        page: e.detail,
      })
    })
  }

  render() {
    return (
      <div
        className="App"
        style={
          this.state.bgFile
            ? {
                background: `url("${this.state.bgFile}") fixed`,
              }
            : {}
        }
      >
        {(() => {
          switch (this.state.page) {
            case 'modding':
              return <Mods downloadHandler={downloadHandler} />
            default:
              return <Main downloadHandler={downloadHandler} />
          }
        })()}
      </div>
    )
  }
}

export default App
