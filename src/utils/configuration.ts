import { fs } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'

let configFilePath: string
let defaultConfig: Configuration

(async() => {
  defaultConfig = {
    toggle_grasscutter: false,
    game_install_path: 'C:\\Program Files\\Genshin Impact\\Genshin Impact game\\Genshin Impact.exe',
    grasscutter_with_game: false,
    grasscutter_path: '',
    java_path: '',
    close_action: 0,
    startup_launch: false,
    last_ip: '',
    last_port: '',
    language: 'en',
  }
})()

/**
 * 'close_action': 0 = close, 1 = tray
 */
export interface Configuration {
  toggle_grasscutter: boolean
  game_install_path: string
  grasscutter_with_game: boolean
  grasscutter_path: string
  java_path: string
  close_action: number
  startup_launch: boolean
  last_ip: string
  last_port: string
  language: string
}

export async function setConfigOption(key: string, value: any): Promise<void> {
  const config = await getConfig()

  Object.assign(config, { [key]: value })
  
  await saveConfig(config)
}

export async function getConfigOption(key: string): Promise<any> {
  const config: any = await getConfig()

  return config[key] || null
}

export async function getConfig() {
  const raw = await readConfigFile()
  let parsed: Configuration = defaultConfig
  
  try {
    parsed = <Configuration> JSON.parse(raw)
  } catch(e) {
    // We could not open the file
    console.log(e)
    
    // TODO: Create a popup saying the config file is corrupted.
  }

  return parsed
}

export async function saveConfig(obj: Configuration) {
  const raw = JSON.stringify(obj)

  await writeConfigFile(raw)
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

  const innerDirs = await fs.readDir(local + '\\cultivation')

  // Create grasscutter dir for potential installation
  if (!innerDirs.find((fileOrDir) => fileOrDir?.name === 'grasscutter')) {
    // Create dir
    await fs.createDir(local + 'cultivation\\grasscutter')
  }


  const dataFiles = await fs.readDir(local + 'cultivation')

  // Ensure config exists
  if (!dataFiles.find((fileOrDir) => fileOrDir?.name === 'configuration.json')) {
    // Create config file
    const file: fs.FsTextFileOption = {
      path: configFilePath,
      contents: JSON.stringify(defaultConfig)
    }

    await fs.writeFile(file)
  }

  // Finally, read the file 
  return await fs.readTextFile(configFilePath)
}

async function writeConfigFile(raw: string) {
  // All external config functions call readConfigFile, which ensure files exists
  await fs.writeFile({
    path: configFilePath,
    contents: raw
  })
}
