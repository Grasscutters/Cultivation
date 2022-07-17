import { invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import DownloadHandler from './download'
import { getGameExecutable, getGameFolder } from './game'

export async function patchMetadata() {
  const metadataExists = await invoke('dir_exists', {
    path: await getGameMetadataPath() + '\\global-metadata.dat'
  })

  if (!metadataExists) {
    return false
  }

  console.log('Copying unpatched metadata to backup location')

  // Copy unpatched metadata to backup location
  const copiedMeta = await invoke('copy_file_with_new_name', {
    path: await getGameMetadataPath() + '\\global-metadata.dat',
    newPath: await getBackupMetadataPath(),
    newName: 'global-metadata-unpatched.dat'
  })

  if (!copiedMeta) {
    console.log(await getBackupMetadataPath())
    return false
  }

  // backup was successful! Time to patch

  console.log('Patching backedup metadata')

  const patchedMeta = await invoke('patch_metadata', {
    metadataFolder: await getBackupMetadataPath(),
  })

  if (!patchedMeta) {
    return false
  }

  // Patch also worked! Time to replace
  console.log('Replacing unpatched game metadata with patched metadata')

  const replacedMeta = await invoke('copy_file_with_new_name', {
    path: await getBackupMetadataPath() + '\\global-metadata-patched.dat',
    newPath: await getGameMetadataPath(),
    newName: 'global-metadata.dat'
  })

  if (!replacedMeta) {
    return false
  }

  console.log('Replacement successful!')

  return true
}

export async function patchGame() {
  const backupExists = await invoke('dir_exists', {
    path: await getBackupMetadataPath() + '\\global-metadata-unpatched.dat'
  })

  if (!backupExists) {
    // No backup found? Patching creates one
    const patched = await patchMetadata()

    if (!patched) {
      return false
    }
  }

  // Do we have a patch already?
  const patchedExists = await invoke('dir_exists', {
    path: await getGameMetadataPath() + '\\global-metadata-patched.dat'
  })

  if (!patchedExists) {
    // No patch found? Patching creates one
    const patched = await patchMetadata()

    if (!patched) {
      return false
    }
  } 

  // Are we already patched? If so, that's fine, just continue as normal
  const gameIsPatched = await invoke('are_files_identical', {
    path1: await getBackupMetadataPath() + '\\global-metadata-patched.dat',
    path2: await getGameMetadataPath() + '\\global-metadata.dat'
  })

  if (gameIsPatched) {
    return true
  }

  // Is the current backup the same as the games current metadata?
  const backupIsCurrent = await invoke('are_files_identical', {
    path1: await getBackupMetadataPath() + '\\global-metadata-unpatched.dat',
    path2: await getGameMetadataPath() + '\\global-metadata.dat'
  })  

  // Game has probably been updated. We need to repatch the game...
  if (!backupIsCurrent) {
    const deletedOldBackup = await invoke('delete_file', {
      path: await getBackupMetadataPath() + '\\global-metadata-unpatched.dat'
    })
    const deletedOldPatched = await invoke('delete_file', {
      path: await getBackupMetadataPath() + '\\global-metadata-patched.dat'
    })

    // It's fine if these deletes fail. The game will be replaced anyway.
    if (!deletedOldBackup) {
      console.log('Warning: Failed to delete old backup!')
    }

    if (!deletedOldPatched) {
      console.log('Warning: Failed to delete old patched metadata!')
    }

    console.log('Patching Metadata')

    const patched = await patchMetadata()

    if (!patched) {
      return false
    }

    return true
  }

  console.log('Metadata is not patched')
  console.log('Replacing unpatched metadata')

  // Finally, replace the unpatched metadata with the patched one
  const replaced = await invoke('copy_file_with_new_name', {
    path: await getBackupMetadataPath() + '\\global-metadata-patched.dat',
    newPath: await getGameMetadataPath(),
    newName: 'global-metadata.dat'
  })

  if (!replaced) {
    return false
  }

  return true
}

export async function unpatchGame() {
  const backupExists = await invoke('dir_exists', {
    path: await getBackupMetadataPath() + '\\global-metadata-unpatched.dat'
  })

  if (!backupExists) {
    // Let's just hope the game isn't on a patched metadata since we don't have a backup...
    return true
  }

  const replaced = await invoke('copy_file_with_new_name', {
    path: await getBackupMetadataPath() + '\\global-metadata-unpatched.dat', 
    newPath: await getGameMetadataPath(),
    newName: 'global-metadata.dat'
  })

  return replaced
}

export async function getGameMetadataPath() {
  const gameExec = await getGameExecutable()

  if (!gameExec) {
    return null
  }

  return (await getGameFolder() + '\\' + gameExec.replace('.exe', '_Data') + '\\Managed\\Metadata').replace(/\\/g, '/')
}

export async function getBackupMetadataPath() {
  return await dataDir() + 'cultivation\\metadata'
}

export async function globalMetadataLink() {
  const versionAPIUrl = 'https://sdk-os-static.mihoyo.com/hk4e_global/mdk/launcher/api/resource?channel_id=1&key=gcStgarh&launcher_id=10&sub_channel_id=0'

  // Get versions from API
  const versions = JSON.parse(await invoke('web_get', {
    url: versionAPIUrl
  }))
  
  if (!versions || versions.retcode !== 0) {
    console.log('Failed to get versions from API')
    return null
  }

  // Get latest version
  const latest = versions.data.game.latest

  return latest.decompressed_path as string + '/GenshinImpact_Data/Managed/Metadata/global-metadata.dat'
}

export async function restoreMetadata(manager: DownloadHandler) {
  const metaLink = await globalMetadataLink()

  if (!metaLink) {
    console.log('Could not get global metadata link!')
    return false
  }

  // Should make sure metadata path exists since the user may have deleted it
  await invoke('dir_create', {
    path: await getBackupMetadataPath()
  })

  // It is possible the unpatched backup is mistakenly patched
  await invoke('delete_file', {
    path: await getBackupMetadataPath() + '\\global-metadata-unpatched.dat'
  })

  // Download the file
  manager.addDownload(metaLink, await getBackupMetadataPath() + '\\global-metadata-unpatched.dat', () => {
    unpatchGame()
  })
  console.log('Restoring backedup metadata')

  await unpatchGame()

  return true
}