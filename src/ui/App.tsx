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

const downloadHandler = new DownloadHandler()

async function download(url: string, filename: string, path: string) {
  const completePath = `${path}/${filename}`
  downloadHandler.addDownload(url, completePath)
}

function App() {
  return (
    <div className="App">
      <Topbar />

      <button>download file test</button>

      <ServerLaunchSection />

      <div id="DownloadProgress">
        <MainProgressBar downloadManager={downloadHandler} />
      </div>
    </div>
  )
}

export default App
