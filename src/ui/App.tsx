import React from 'react'
import './App.css'
import './custom.css'

/* FOR TESTING */
import DownloadHandler from '../utils/download'

// Major Components
import Topbar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import ProgressBar from './components/common/ProgressBar'
import MainProgressBar from './components/common/MainProgressBar'

interface IProps {
  [key: string]: never
}

interface IState {
  isDownloading: boolean
}

const downloadHandler = new DownloadHandler()

async function download(url: string, filename: string, path: string) {
  const completePath = `${path}/${filename}`
  downloadHandler.addDownload(url, completePath)
}

async function TESTDOWNLOAD() {
  download(
    'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip',
    'grasscutter.zip',
    'S:/Cultivation'
  )
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      isDownloading: false,
    }
  }

  render() {
    return (
      <div className="App">
        <Topbar />

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
