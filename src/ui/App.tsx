import React from 'react'
import { listen } from '@tauri-apps/api/event'
import './App.css'
import './custom.css'

/* FOR TESTING */
import DownloadHandler from '../utils/download'

// Major Components
import TopBar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import MainProgressBar from './components/common/MainProgressBar'
import Options from './components/menu/Options'
import MiniDialog from './components/MiniDialog'
import DownloadList from './components/common/DownloadList'

interface IProps {
  [key: string]: never;
}

interface IState {
  isDownloading: boolean;
  optionsOpen: boolean;
  miniDownloadsOpen: boolean;
}

const downloadHandler = new DownloadHandler()

async function download(url: string, filename: string, path: string) {
  const completePath = `${path}/${filename}`
  downloadHandler.addDownload(url, completePath)
}

async function TESTDOWNLOAD() {
  download(
    'https://github.com/Koko-boya/Grasscutter_Resources/archive/refs/heads/main.zip',
    'resources.zip',
    'S:\\Cultivation'
  )
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isDownloading: false,
      optionsOpen: false,
      miniDownloadsOpen: false,
    }

    listen('lang_error', (payload) => {
      console.log(payload)
    })
  }

  render() {
    return (
      <div className="App">
        <TopBar
          optFunc={() => {
            this.setState({ optionsOpen: !this.state.optionsOpen })
          }}
          downFunc={() => {
            this.setState({ miniDownloadsOpen: !this.state.miniDownloadsOpen })
          }}
        />

        {
          // Mini downloads section
          this.state.miniDownloadsOpen ? 
            <MiniDialog title="Downloads" closeFn={() => {
              this.setState({ miniDownloadsOpen: false })
            }}>
              <DownloadList downloadManager={downloadHandler} />
            </MiniDialog> : null
        }

        {
          this.state.optionsOpen ? <Options closeFn={() => this.setState({ optionsOpen: !this.state.optionsOpen })}/> : null
        }

        <button onClick={TESTDOWNLOAD}>download file test</button>

        <ServerLaunchSection />

        <div id="DownloadProgress">
          <MainProgressBar downloadManager={downloadHandler} />
        </div>
      </div>
    )
  }
}

export default App
