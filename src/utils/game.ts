import { getConfig } from './configuration'

export async function getGameExecutable() {
  const config = await getConfig()

  if (!config.game_install_path) {
    return null
  }

  const pathArr = config.game_install_path.replace(/\\/g, '/').split('/')
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
