import { getConfigOption } from './configuration'

export async function getModsFolder() {
  const migotoPath = await getConfigOption('migoto_path')

  if (!migotoPath) return null

  // Remove exe from path
  const pathArr = migotoPath.replace(/\\/g, '/').split('/')
  pathArr.pop()

  return pathArr.join('/') + '/Mods/'
}
