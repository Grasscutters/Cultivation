import React from 'react'
import logo from './logo.svg'
import './App.css'
import './custom.css'

// Config
import { getConfigOption, getConfig, saveConfig, setConfigOption } from '../utils/configuration'

// Major Components
import Topbar from './components/TopBar'
import BigButton from './components/common/BigButton'

function playGame() {

}

function App() {
  return (
    <div className="App">
      <Topbar />
      <div id="playButtons">
        <BigButton text="PLAY DA GAME :D" onClick={playGame} id="officialPlay" />
      </div>
    </div>
  )
}

export default App
