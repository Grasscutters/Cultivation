import React from 'react'
import './App.css'

import TopBar from './components/TopBar'

import { invoke } from '@tauri-apps/api/tauri'
import { dataDir } from '@tauri-apps/api/path'
import TextInput from './components/common/TextInput'

let proxyAddress = ''

async function setProxyAddress(address: string) {
  proxyAddress = address
  await invoke('set_proxy_addr', { addr: address })
}

async function startProxy() {
  await invoke('connect', { port: 2222, certificatePath: (await dataDir()) + '\\cultivation\\ca' })
  await invoke('open_in_browser', { url: 'https://hoyoverse.com' })
}

async function stopProxy() {
  await invoke('disconnect')
}

async function generateCertificates() {
  await invoke('generate_ca_files', { path: (await dataDir()) + '\\cultivation' })
}

async function generateInfo() {
  console.log({
    certificatePath: (await dataDir()) + '\\cultivation\\ca',
    isAdmin: await invoke('is_elevated'),
    connectingTo: proxyAddress,
  })
  alert('check your dev console and send that in #cultivation')
}

function none() {
  alert('none')
}

class Debug extends React.Component {
  render() {
    return (
      <div className="App">
        <TopBar />
        <TextInput readOnly={false} initalValue={'change to set proxy address'} onChange={setProxyAddress} />
        <button onClick={startProxy}>start proxy</button>
        <button onClick={stopProxy}>stop proxy</button>
        <button onClick={generateCertificates}>generate certificates</button>
        <button onClick={generateInfo}>dump info</button>
      </div>
    )
  }
}

export default Debug
