import { fs, invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import { getConfig } from './configuration'

export interface VersionData {
  game: string
  metadata: string | null
  metadata_backup_link: string | null
  client_download_link: string | null
  resources: string
  stableJar: string | null
  devJar: string | null
  stable: string | null
  dev: string | null
}

const globals: {
  [key: string]: VersionData
} = {
  '2.8.0': {
    game: '2.8.0',
    metadata: '2.8.0',
    metadata_backup_link: null,
    client_download_link: null,
    resources: 'https://gitlab.com/yukiz/GrasscutterResources/-/archive/2.8/GrasscutterResources-2.8.zip',
    stableJar: null,
    devJar: 'https://nightly.link/Grasscutters/Grasscutter/actions/runs/2661955213/Grasscutter.zip',
    stable: null,
    dev: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/2.8.zip'
  },
  '2.7.0': {
    game: '2.7.0',
    metadata: null,
    metadata_backup_link: null,
    client_download_link: null,
    resources: 'https://github.com/Koko-boya/Grasscutter_Resources/archive/refs/heads/main.zip',
    stableJar: 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/stable/Grasscutter.zip',
    devJar: 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/development/Grasscutter.zip',
    stable: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip',
    dev: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/development.zip'
  },
  '2.6.0': {
    game: '2.6.0',
    metadata: null,
    metadata_backup_link: null,
    client_download_link: null,
    resources: 'https://github.com/Koko-boya/Grasscutter_Resources/archive/0e99a59218a346c2d56c54953f99077882de4a6d.zip',
    stableJar: 'https://github.com/Grasscutters/Grasscutter/releases/download/v1.1.0/grasscutter-1.1.0.jar',
    devJar: null,
    stable: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/2.6.zip',
    dev: null
  }
}

export async function cacheLauncherResources() {
  const config = await getConfig()
  const versionAPIUrl = 'https://sdk-os-static.mihoyo.com/hk4e_global/mdk/launcher/api/resource?channel_id=1&key=gcStgarh&launcher_id=10&sub_channel_id=0'

  // Get versions from API
  const versions = JSON.parse(await invoke('web_get', {
    url: versionAPIUrl
  }))
  
  if (!versions || versions.retcode !== 0) {
    console.log('Failed to get versions from API')
    return null
  }

  const selectedVersion = config.client_version || versions.data.game.latest.version
  const selectedVersionData = globals[selectedVersion]

  if (!selectedVersionData) {
    console.log('Failed to get version for selected version')
    return null
  }

  const latest = versions.data.game.latest
  const latestData = globals[latest.version]

  if (latestData) {
    latestData.metadata_backup_link = latest.decompressed_path + '/GenshinImpact_Data/Managed/Metadata/global-metadata.dat'
    latestData.client_download_link = latest.path
  }

  // Write
  fs.writeFile({
    path: await dataDir() + 'cultivation/resources.json',
    contents: JSON.stringify(selectedVersionData)
  })

  // In case we want to get it right away too
  return selectedVersionData
}

export async function getVersionCache() {
  const raw = await fs.readTextFile(await dataDir() + 'cultivation/resources.json').catch(e => {
    console.log(e)
    return null
  })

  return raw ? JSON.parse(raw) as VersionData : null
}

export function getVersions() {
  return Object.keys(globals)
}