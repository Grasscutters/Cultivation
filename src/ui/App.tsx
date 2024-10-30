import React from 'react'
import './App.css'

import DownloadHandler from '../utils/download'
import { getConfigOption } from '../utils/configuration'
import { getTheme, loadTheme } from '../utils/themes'
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri'
import { Main } from './Main'
import { Mods } from './Mods'

// From https://www.pixiv.net/en/artworks/93995273
import FALLBACK_BG from '../resources/icons/FALLBACK_BG.jpg'

interface IState {
  page: string
  bgFile: string
}

const downloadHandler = new DownloadHandler()
const WEB_BG = 'https://api.grasscutter.io/cultivation/bgfile'

class App extends React.Component<Readonly<unknown>, IState> {
  constructor(props: Readonly<unknown>) {
    super(props)

    this.state = {
      page: 'main',
      bgFile: FALLBACK_BG,
    }
  }

  async componentDidMount() {
    // Load a theme if it exists
    const theme = await getConfigOption('theme')
    if (theme && theme !== 'default') {
      const themeObj = await getTheme(theme)
      await loadTheme(themeObj, document)
    }

    // Get custom bg AFTER theme is loaded !! important !!
    const custom_bg = await getConfigOption('custom_background')
    const offline_mode = await getConfigOption('offline_mode')

    if (custom_bg || offline_mode) {
      const isUrl = /^http(s)?:\/\//gm.test(custom_bg)

      if (!isUrl) {
        const isValid = await invoke('dir_exists', {
          path: custom_bg,
        })

        this.setState(
          {
            bgFile: isValid ? convertFileSrc(custom_bg) : FALLBACK_BG,
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
            bgFile: isValid ? custom_bg : FALLBACK_BG,
          },
          this.forceUpdate
        )
      }
    } else {
      // Check if api bg is accessible
      const isDefaultValid = await invoke('valid_url', {
        url: WEB_BG,
      })

      this.setState(
        {
          bgFile: isDefaultValid ? WEB_BG : FALLBACK_BG,
        },
        this.forceUpdate
      )
    }

    window.addEventListener('changePage', (e) => {
      this.setState({
        // @ts-expect-error - TS doesn't like our custom event
        page: e.detail,
      })
      this.forceUpdate
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
