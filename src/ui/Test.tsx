import React from 'react'

import {invoke} from '@tauri-apps/api/tauri'

async function startProxy() {
  await invoke('connect')
}

async function stopProxy() {
  await invoke('disconnect')
}

class Test extends React.Component<any, any>{
  render() {
    return (
      <div className="App">
        <button onClick={startProxy}>start proxy</button>
        <button onClick={stopProxy}>stop proxy</button>
      </div>
    )
  }
}

export default Test