import { invoke } from '@tauri-apps/api'
import { getConfig } from './configuration'

const globals = {
  '2.8.0': {
    game: '2.8.0',
    metadata: '2.8.0',
    resources: 'https://gitlab.com/yukiz/GrasscutterResources/-/archive/2.8/GrasscutterResources-2.8.zip',
    stableJar: '',
    devJar: 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/2.8/Grasscutter.zip',
    stable: '',
    dev: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/2.8.zip'
  },
  '2.7.0': {
    game: '2.7.0',
    metadata: null,
    resources: 'https://github.com/Koko-boya/Grasscutter_Resources/archive/refs/heads/main.zip',
    stableJar: 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/stable/Grasscutter.zip',
    devJar: 'https://nightly.link/Grasscutters/Grasscutter/workflows/build/development/Grasscutter.zip',
    stable: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip',
    dev: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/development.zip'
  },
  '2.6.0': {
    game: '2.6.0',
    metadata: null,
    resources: 'https://github.com/Koko-boya/Grasscutter_Resources/archive/0e99a59218a346c2d56c54953f99077882de4a6d.zip',
    stableJar: 'https://github.com/Grasscutters/Grasscutter/releases/download/v1.1.0/grasscutter-1.1.0.jar',
    stable: 'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/2.6.zip',
    dev: ''
  }
}

export async function cacheLauncherResources() {
  const versionAPIUrl = 'https://sdk-os-static.mihoyo.com/hk4e_global/mdk/launcher/api/resource?channel_id=1&key=gcStgarh&launcher_id=10&sub_channel_id=0'

  // Get versions from API
  const versions = JSON.parse(await invoke('web_get', {
    url: versionAPIUrl
  }))
  
  if (!versions || versions.retcode !== 0) {
    console.log('Failed to get versions from API')
    return false
  }
}