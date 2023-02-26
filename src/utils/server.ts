import { invoke } from '@tauri-apps/api'

export async function toggleEncryption(path: string) {
  let serverConf

  try {
    serverConf = JSON.parse(
      await invoke('read_file', {
        path,
      })
    )
  } catch (e) {
    console.log(`Server config at ${path} not found or invalid. Be sure to run the server at least once to generate it`)
    return
  }

  const enabled = serverConf.server.http.encryption.useEncryption

  serverConf.server.http.encryption.useEncryption = !enabled
  serverConf.server.http.encryption.useInRouting = !enabled

  // Write file
  await invoke('write_file', {
    path,
    contents: JSON.stringify(serverConf, null, 2),
  })
}

export async function encryptionEnabled(path: string) {
  let serverConf

  try {
    serverConf = JSON.parse(
      await invoke('read_file', {
        path,
      })
    )
  } catch (e) {
    console.log(`Server config at ${path} not found or invalid. Be sure to run the server at least once to generate it`)
    return false
  }

  return serverConf.server.http.encryption.useEncryption
}
