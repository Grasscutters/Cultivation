import { invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import DownloadHandler from './download'
import { getGameFolder } from './game'

interface IProps {
  downloadHandler: DownloadHandler
}

export async function patchRSA() {
  const rsaExists = await invoke('dir_exists', {
    path: (await getBackupRSAPath()) + '\\version.dll',
  })

  if (rsaExists) {
    // Already patched
    return true
  }

  console.log('Downloading rsa patch to backup location')

  // Download RSA patch to backup location
  const downloadedRSA = await downloadRSA(this.props.downloadHandler)

  if (!downloadedRSA) {
    console.log(await getBackupRSAPath())
    return false
  }

  console.log('RSA download successful!')

  return true
}

export async function patchGame() {
  // Do we have a patch already?
  const patchedExists = await invoke('dir_exists', {
    path: (await getBackupRSAPath()) + '\\version.dll',
  })

  if (!patchedExists) {
    // No patch found? Patching creates one
    const patched = await patchRSA()

    if (!patched) {
      return false
    }
  }

  // Are we already patched with mhypbase? If so, that's fine, just continue as normal
  const gameIsPatched = await invoke('are_files_identical', {
    path1: (await getBackupRSAPath()) + '\\version.dll',
    path2: (await getGameRSAPath()) + '\\mhypbase.dll',
  })

  // Tell user they won't be unpatched with manual mhypbase patch
  if (gameIsPatched) {
    console.log('You are already patched using mhypbase, so you will not be auto patched and unpatched!')
    return true
  }

  // Copy the patch to game files
  const replaced = await invoke('copy_file', {
    path: (await getBackupRSAPath()) + '\\version.dll',
    newPath: await getGameRSAPath(),
  })

  if (!replaced) {
    return false
  }

  return true
}

export async function unpatchGame() {
  // Just delete patch since it's not replacing any existing file
  const deleted = await invoke('delete_file', {
    path: (await getGameRSAPath()) + '\\version.dll',
  })

  return deleted
}

export async function getGameRSAPath() {
  const gameData = await getGameFolder()

  if (!gameData) {
    return null
  }

  return gameData
}

export async function getBackupRSAPath() {
  return (await dataDir()) + 'cultivation\\rsa'
}

export async function downloadRSA(manager: DownloadHandler) {
  const rsaLink = 'https://github.com/34736384/RSAPatch/releases/download/v1.1.0/RSAPatch.dll'

  // Should make sure rsa path exists
  await invoke('dir_create', {
    path: await getBackupRSAPath(),
  })

  // Download the file
  manager.addDownload(rsaLink, (await getBackupRSAPath()) + '\\version.dll', () => {
    null
  })

  return true
}