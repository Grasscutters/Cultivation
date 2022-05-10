import React from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'
import './custom.css'

/* FOR TESTING */
import DownloadHandler from '../utils/download'

// Config
import { getConfig, saveConfig } from '../utils/configuration'

// Major Components
import Topbar from './components/TopBar'
import BigButton from './components/common/BigButton'
import Checkbox from './components/common/Checkbox'
import ProgressBar from './components/common/ProgressBar'

const downloadHandler = new DownloadHandler()

async function playGame() {
  const config = await getConfig()

  if (!config.game_path) return

  // Launch the program
  await invoke('run_program', { path: config.game_path })
}

async function download() {
  const path = 'S:/Cultivation/grassclipper.zip'
  const url = 'https://github.com/Grasscutters/GrassClipper/releases/download/v0.9.7/GrassClipper.zip'
  downloadHandler.addDownload(url, path)
}

async function toggleGrasscutter() {
  const config = await getConfig()

  config.toggle_grasscutter = !config.toggle_grasscutter

  await saveConfig(config)
}

function App() {
  return (
    <div className="App">
      <Topbar />

      <button onClick={download}>download file test</button>

      <div id="playButton">
        <div id="serverControls">
          <Checkbox label="Connect via Grasscutter" onChange={toggleGrasscutter} />
        </div>
        <BigButton text="PLAY DA GAME :D" onClick={playGame} id="officialPlay" />
      </div>

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
