import { invoke } from '@tauri-apps/api'
import { getConfig } from './configuration'

export async function getGameExecutable() {
  const config = await getConfig()

  if (!config.game_install_path) {
    return null
  }

  const pathArr = config.game_install_path.replace(/\\/g, '/').split('/')
  return pathArr[pathArr.length - 1]
}

export async function getGrasscutterJar() {
  const config = await getConfig()

  if (!config.grasscutter_path) {
    return null
  }

  const pathArr = config.grasscutter_path.replace(/\\/g, '/').split('/')
  return pathArr[pathArr.length - 1]
}

export async function getGameFolder() {
  const config = await getConfig()

  if (!config.game_install_path) {
    return null
  }

  const pathArr = config.game_install_path.replace(/\\/g, '/').split('/')
  pathArr.pop()

  const path = pathArr.join('/')

  return path
}

export async function getGameDataFolder() {
  const gameExec = await getGameExecutable()

  if (!gameExec) {
    return null
  }

  return (await getGameFolder()) + '\\' + gameExec.replace('.exe', '_Data')
}

export async function getGameVersion() {
  const GameData = await getGameDataFolder()

  if (!GameData) {
    return null
  }

  const settings = JSON.parse(
    await invoke('read_file', {
      path: GameData + '\\StreamingAssets\\asb_settings.json',
    })
  )

  const versionRaw = settings.variance.split('.')
  const version = {
    major: parseInt(versionRaw[0]),
    minor: parseInt(versionRaw[1].split('_')[0]),
    release: parseInt(versionRaw[1].split('_')[1]),
  }

  return version
}
