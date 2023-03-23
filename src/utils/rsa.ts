import { invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import { getGameFolder } from './game'

export async function patchGame() {
  // Do we have a patch already?
  const patchedExists = await invoke('dir_exists', {
    path: (await getBackupRSAPath()) + '\\version.dll',
  })

  if (!patchedExists) {
    // No patch found? Patching creates one
    const patched = await downloadRSA()

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
  const replaced = await invoke('copy_file_with_new_name', {
    path: (await getBackupRSAPath()) + '\\version.dll',
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

export async function getBackupRSAPath() {
  return (await dataDir()) + 'cultivation\\rsa'
}

export async function downloadRSA() {
  // Patch file from: https://github.com/34736384/RSAPatch/

  // Should make sure rsa path exists
  await invoke('dir_create', {
    path: await getBackupRSAPath(),
  })

  // Copy patch from local for offline compatibility
  await invoke('copy_file_with_new_name', {
    path: (await invoke('install_location')) + '\\patch\\version.dll',
    newPath: await getBackupRSAPath(),
    newName: 'version.dll',
  })

  return true
}
