import React from 'react'
import './App.css'
import './custom.css'

/* FOR TESTING */
import DownloadHandler from '../utils/download'

// Major Components
import Topbar from './components/TopBar'
import ServerLaunchSection from './components/ServerLaunchSection'
import ProgressBar from './components/common/ProgressBar'

const downloadHandler = new DownloadHandler()

async function download() {
  const path = 'S:/Cultivation/grassclipper.zip'
  const url = 'https://github.com/Grasscutters/GrassClipper/releases/download/v0.9.7/GrassClipper.zip'
  downloadHandler.addDownload(url, path)
}

function App() {
  return (
    <div className="App">
      <Topbar />

      <button onClick={download}>download file test</button>

      <ServerLaunchSection />

      <div id="downloadProgress" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '50%'
      }}>

        <ProgressBar path="S:/Cultivation/grassclipper.zip" downloadManager={downloadHandler} />
      </div>
    </div>
  )
}

export default App
