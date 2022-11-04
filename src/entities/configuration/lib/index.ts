import { fs } from '@tauri-apps/api';
import { dataDir, resolve } from '@tauri-apps/api/path';

import type { Configuration } from './types';

export const defaultConfig: Configuration = {
  toggle_grasscutter: false,
  game_install_path:
    'C:\\Program Files\\Genshin Impact\\Genshin Impact game\\GenshinImpact.exe',
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
  wipe_login: false,
  horny_mode: false,
};

export async function createConfigurationManager() {
  const local = await dataDir();
  const configFilePath = await resolve(
    local,
    'cultivation',
    'configuration.json'
  );

  await fs.createDir(await resolve(local, 'cultivation', 'grasscutter'), {
    recursive: true,
  });

  // https://github.com/tauri-apps/tauri/discussions/5530
  // exists returns void because of ts incorrect annotation
  if (!(await fs.exists(configFilePath))) {
    await fs.writeFile({
      path: configFilePath,
      contents: JSON.stringify(defaultConfig),
    });
  }

  const config = <Configuration>(
    JSON.parse(await fs.readTextFile(configFilePath))
  );

  async function writeConfigFile(raw: string) {
    await fs.writeFile({
      path: configFilePath,
      contents: raw,
    });
  }

  async function saveConfig(obj: Configuration) {
    const raw = JSON.stringify(obj);

    await writeConfigFile(raw);
  }

  return {
    config,

    saveConfig,
  };
}
