import { invoke } from '@tauri-apps/api'
import { getGameFolder } from './game'
// Patch file from: https://github.com/34736384/RSAPatch/

export async function patchGame() {
  const patchPath = (await invoke('install_location')) + '\\patch\\version.dll'
  // Are we already patched with mhypbase? If so, that's fine, just continue as normal
  const gameIsPatched = await invoke('are_files_identical', {
    path1: patchPath,
    path2: (await getGameRSAPath()) + '\\mhypbase.dll',
  })

  // Tell user they won't be unpatched with manual mhypbase patch
  if (gameIsPatched) {
    console.log('You are already patched using mhypbase, so you will not be auto patched and unpatched!')
    return true
  }

  // Copy the patch to game files
  const replaced = await invoke('copy_file_with_new_name', {
    path: patchPath,
    newPath: await getGameRSAPath(),
    newName: 'version.dll',
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

  return (gameData + '\\').replace(/\\/g, '/')
}
