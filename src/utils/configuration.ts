import { fs } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'

let configFilePath: string
let defaultConfig: Configuration
;(async () => {
  defaultConfig = {
    toggle_grasscutter: true,
    game_install_path: 'C:\\Program Files\\Genshin Impact\\Genshin Impact game\\GenshinImpact.exe',
    grasscutter_with_game: false,
    grasscutter_path: '',
    java_path: '',
    close_action: 0,
    startup_launch: false,
    last_ip: 'localhost',
    last_port: '443',
    language: 'en',
    custom_background: '',
    use_theme_background: false,
    cert_generated: false,
    theme: 'default',
    https_enabled: false,
    debug_enabled: false,
    patch_rsa: true,
    use_internal_proxy: true,
    wipe_login: false,
    horny_mode: false,
    auto_mongodb: false,
    un_elevated: false,
    redirect_more: false,
    launch_args: '',
    offline_mode: false,
    newer_game: false,
    show_version: true,
    profile: 'default',

    // Linux stuff
    grasscutter_elevation: 'None',
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
  custom_background: string
  use_theme_background: boolean
  cert_generated: boolean
  theme: string
  https_enabled: boolean
  debug_enabled: boolean
  patch_rsa: boolean
  use_internal_proxy: boolean
  wipe_login: boolean
  horny_mode: boolean
  swag_mode?: boolean
  auto_mongodb: boolean
  un_elevated: boolean
  redirect_more: boolean
  launch_args: string
  offline_mode: boolean
  newer_game: boolean
  show_version: boolean
  profile: string

  // Linux stuff
  grasscutter_elevation: string

  // Swag stuff
  akebi_path?: string
  migoto_path?: string
  reshade_path?: string
  last_extras?: {
    migoto: boolean
    akebi: boolean
    reshade: boolean
  }
}

export async function setConfigOption<K extends keyof Configuration>(key: K, value: Configuration[K]): Promise<void> {
  const config = await getConfig()
  config[key] = value

  await saveConfig(<Configuration>config)
}

export async function setProfileOption<K extends keyof Configuration>(key: K, value: Configuration[K]): Promise<void> {
  const config = await getConfig()
  config[key] = value
  const defaultConfig = await getDefaultConfig()
  defaultConfig[key] = value

  await saveProfileConfig(<Configuration>defaultConfig)
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

export async function getDefaultConfig() {
  const raw = await readDefaultConfigFile()
  let parsed: Configuration = defaultConfig

  try {
    parsed = <Configuration>JSON.parse(raw)
  } catch (e) {
    // We could not open the file
    console.log(e)
  }

  return parsed
}

export async function saveConfig(obj: Configuration) {
  const raw = JSON.stringify(obj)

  await writeConfigFile(raw)
}

export async function saveProfileConfig(obj: Configuration) {
  const local = await dataDir()
  const raw = JSON.stringify(obj)
  const prevPath = configFilePath
  configFilePath = local + 'cultivation/configuration.json'
  await writeConfigFile(raw)

  configFilePath = prevPath
}

export async function saveNewProfileConfig(obj: Configuration, prof: string) {
  obj['profile'] = prof
  const local = await dataDir()
  const raw = JSON.stringify(obj)
  configFilePath = local + 'cultivation/profiles/' + obj['profile'] + '.json'

  const file: fs.FsTextFileOption = {
    path: configFilePath,
    contents: raw,
  }

  await fs.writeFile(file)
}

async function readConfigFile() {
  const local = await dataDir()

  if (!configFilePath) {
    configFilePath = local + 'cultivation/configuration.json'
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

  // Read existing config to get profile name
  const raw = await fs.readTextFile(configFilePath)
  const cfg = <Configuration>JSON.parse(raw)
  // Switch file to config-specified profile
  let pf = cfg['profile']
  if (pf && pf != 'default') {
    const pff = pf
    pf = 'profiles/' + pff + '.json'
  } else {
    pf = 'configuration.json'
  }
  configFilePath = local + 'cultivation/' + pf

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

  // Finally, read the file
  return await fs.readTextFile(configFilePath)
}

async function readDefaultConfigFile() {
  const local = await dataDir()
  configFilePath = local + 'cultivation/configuration.json'
  return await fs.readTextFile(configFilePath)
}

async function writeConfigFile(raw: string) {
  // All external config functions call readConfigFile, which ensure files exists
  await fs.writeFile({
    path: configFilePath,
    contents: raw,
  })
}
