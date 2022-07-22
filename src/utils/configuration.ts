import { fs } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'

let configFilePath: string
let defaultConfig: Configuration
;(async () => {
  defaultConfig = {
    toggle_grasscutter: false,
    game_install_path: 'C:\\Program Files\\Genshin Impact\\Genshin Impact game\\GenshinImpact.exe',
    grasscutter_with_game: false,
    grasscutter_path: '',
    java_path: '',
    close_action: 0,
    startup_launch: false,
    last_ip: 'localhost',
    last_port: '443',
    language: 'en',
    customBackground: '',
    cert_generated: false,
    theme: 'default',
    https_enabled: false,
    debug_enabled: false,
    patch_metadata: true,
    use_internal_proxy: true,
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
  customBackground: string
  cert_generated: boolean
  theme: string
  https_enabled: boolean
  debug_enabled: boolean
  patch_metadata: boolean
  use_internal_proxy: boolean
  swag_mode?: boolean

  // Swag stuff
  akebi_path?: string
  migoto_path?: string
}

export async function setConfigOption<K extends keyof Configuration>(key: K, value: Configuration[K]): Promise<void> {
  const config = await getConfig()
  config[key] = value

  await saveConfig(<Configuration>config)
}

export async function getConfigOption<K extends keyof Configuration>(key: K): Promise<Configuration[K]> {
  const config = await getConfig()
  const defaults = defaultConfig

  return config[key] === null || config[key] === undefined ? defaults[key] : config[key]
}

export async function getConfig() {
  const raw = await readConfigFile()
  let parsed: Configuration = defaultConfig

  try {
    parsed = <Configuration>JSON.parse(raw)
  } catch (e) {
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

  if (!configFilePath) configFilePath = local + 'cultivation/configuration.json'

  // Ensure Cultivation dir exists
  const dirs = await fs.readDir(local)

  if (!dirs.find((fileOrDir) => fileOrDir?.name === 'cultivation')) {
    // Create dir
    await fs.createDir(local + 'cultivation').catch((e) => console.log(e))
  }

  const innerDirs = await fs.readDir(local + '/cultivation')

  // Create grasscutter dir for potential installation
  if (!innerDirs.find((fileOrDir) => fileOrDir?.name === 'grasscutter')) {
    // Create dir
    await fs.createDir(local + 'cultivation/grasscutter').catch((e) => console.log(e))
  }

  const dataFiles = await fs.readDir(local + 'cultivation')

  // Ensure config exists
  if (!dataFiles.find((fileOrDir) => fileOrDir?.name === 'configuration.json')) {
    // Create config file
    const file: fs.FsTextFileOption = {
      path: configFilePath,
      contents: JSON.stringify(defaultConfig),
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
    contents: raw,
  })
}
