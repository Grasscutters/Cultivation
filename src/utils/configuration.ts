import { fs } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'

let configFilePath: string

export async function setConfigOption(key: string, value: any): Promise<void> {
  return
}

export async function getConfigOption(key: string): Promise<any> {
  const config = await getConfig()
}

export async function getConfig() {
  const raw = await readConfigFile()
  let parsed

  try {
    parsed = JSON.parse(raw)
  } catch(e) {
    // We could not open the file
    console.log(e)
  }

  return parsed
}

export async function saveConfig(obj: { [key: string]: any }) {
  return
}

async function readConfigFile() {
  const local = await dataDir()

  if (!configFilePath) configFilePath = local + 'cultivation\\configuration.json'

  // Ensure Cultivation dir exists
  const dirs = await fs.readDir(local)

  if (!dirs.find((fileOrDir) => fileOrDir?.name === 'cultivation')) {
    // Create dir
    await fs.createDir(local + 'cultivation')
  }

  const dataFiles = await fs.readDir(local + 'cultivation')

  // Ensure config exists
  if (!dataFiles.find((fileOrDir) => fileOrDir?.name === 'configuration.json')) {
    // Create config file
    const file: fs.FsTextFileOption = {
      path: local + 'cultivation\\configuration.json',
      contents: '{}'
    }

    await fs.writeFile(file)
  }

  // Finally read the file
  
  return await fs.readTextFile(local + 'cultivation\\configuration.json')
}

async function writeConfigFile() {
  return
}