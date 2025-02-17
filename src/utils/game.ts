import { invoke } from '@tauri-apps/api'
import { basename, dirname, join } from '@tauri-apps/api/path'
import { getConfigOption } from './configuration'

// For god's sake i don't know why the game's EXECUTABLE is called game install PATH.
// either game_install_dir or game_exectuable_path. not a mix of them :sob:

// The following method is just an adapter to limit the scope of changes in this commit.
// Ideally, all instances of these single, autonomous, disjointed methods should be replaced with methods in configuration.ts which are much nicer. (if named correctly)
export const getGameExecutable = () => getConfigOption('game_install_path')
export const getGrasscutterJar = () => getConfigOption('grasscutter_path')

export async function getGameVersion() {
  const execPath = await getConfigOption('game_install_path')
  const rootPath = await dirname(execPath)
  const baseName = (await basename(execPath)).split('.exe')[0]
  const datapath = await join(rootPath, `${baseName}_Data`)
  const asbPath = await join(datapath, 'StreamingAssets', 'asb_settings.json')
  const hasAsb = await invoke<boolean>('dir_exists', { path: asbPath })

  if (!hasAsb) {
    const versionFile = await join(datapath, 'StreamingAssets', 'BinaryVersion.bytes')
    const rawVersion = await invoke<string>('read_file', { path: versionFile })
    if (!rawVersion) return null

    const [major, minor] = rawVersion.split('.').map(Number)
    return { major, minor, release: 0 }
  }

  const settings = JSON.parse(await invoke<string>('read_file', { path: asbPath }))
  const [major, minorRelease] = settings.variance.split('.')
  const [minor, release] = minorRelease.split('_').map(Number)

  return { major: parseInt(major), minor, release }
}
