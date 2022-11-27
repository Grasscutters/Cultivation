<<<<<<< HEAD
import { dataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';
=======
import './App.css'
>>>>>>> aa45f04 (feat: move to solid-js)

import TextInput from './components/common/TextInput';
import TopBar from './components/TopBar';

import './App.css';

let proxyAddress = '';

async function setProxyAddress(address: string) {
  proxyAddress = address;
  await invoke('set_proxy_addr', { addr: address });
}

async function startProxy() {
  await invoke('connect', {
    port: 2222,
    certificatePath: (await dataDir()) + '\\cultivation\\ca',
  });
  await invoke('open_in_browser', { url: 'https://hoyoverse.com' });
}

async function stopProxy() {
  await invoke('disconnect');
}

async function generateCertificates() {
  await invoke('generate_ca_files', {
    path: (await dataDir()) + '\\cultivation',
  });
}

async function generateInfo() {
  console.log({
    certificatePath: (await dataDir()) + '\\cultivation\\ca',
    isAdmin: await invoke('is_elevated'),
    connectingTo: proxyAddress,
  });
  alert('check your dev console and send that in #cultivation');
}

export default function Debug() {
  return (
    <div class="App">
      <TopBar />
<<<<<<< HEAD
      <TextInput
        readOnly={false}
        initalValue={'change to set proxy address'}
        onChange={setProxyAddress}
      />
=======
      <TextInput readOnly={false} initalValue={'change to set proxy address'} onChange={setProxyAddress} />
>>>>>>> aa45f04 (feat: move to solid-js)
      <button onClick={startProxy}>start proxy</button>
      <button onClick={stopProxy}>stop proxy</button>
      <button onClick={generateCertificates}>generate certificates</button>
      <button onClick={generateInfo}>dump info</button>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
