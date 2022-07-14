import { fs } from '@tauri-apps/api'

export async function toggleEncryption(path: string) {
  let serverConf

  try {
    serverConf = JSON.parse(await fs.readTextFile(path))
  } catch(e) {
    console.log(`Server config at ${path} not found or invalid`)
    return
  }

  const enabled = serverConf.server.http.encryption.useEncryption

  serverConf.server.http.encryption.useEncryption = !enabled
  serverConf.server.http.encryption.useInRouting = !enabled

  // Write file
  await fs.writeFile({
    path,
    contents: JSON.stringify(serverConf, null, 2),
  })
}

export async function encryptionEnabled(path: string) {
  let serverConf

  try {
    serverConf = JSON.parse(await fs.readTextFile(path))
  } catch(e) {
    console.log(`Server config at ${path} not found or invalid`)
    return false
  }

  return serverConf.server.http.encryption.useEncryption
}