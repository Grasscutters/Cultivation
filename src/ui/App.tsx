import React from 'react'
import logo from './logo.svg'
import './App.css'
import './custom.css'

// Major Components
import Topbar from './components/TopBar'
import BigButton from './components/common/BigButton'

function playGame() {
  alert('cum')
}

function App() {
  return (
    <div className="App">
      <Topbar />
      <div id="playButtons">
        <BigButton text="PLAY DA GAME :D" onClick={playGame} id="officialPlay" />
        <BigButton text="PLAY PRIV GAME :D" onClick={playGame} id="privatePlay" />
      </div>
    </div>
  )
}

export default App
