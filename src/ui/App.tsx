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

  const intv = setInterval(() => {
    const prog = downloadHandler.getDownloadProgress(path)
    console.log(prog)

    if (prog.status === 'finished') {
      clearInterval(intv)
    }
  }, 500)
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
    </div>
  )
}

export default App
