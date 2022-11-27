import { invoke } from '@tauri-apps/api';

import { getConfigOption } from './configuration';

export async function getModsFolder() {
  const migotoPath = await getConfigOption('migoto_path');

  if (!migotoPath) return null;

  // Remove exe from path
  const pathArr = migotoPath.replace(/\\/g, '/').split('/');
  pathArr.pop();

  return pathArr.join('/') + '/Mods/';
}

export async function disableMod(modId: string) {
  const path = (await getModsFolder()) + modId;
  const pathExists = await invoke('dir_exists', {
    path,
  });

  if (!pathExists) return console.log("Path doesn't exist");

  const modName = path.replace(/\\/g, '/').split('/').pop();

  await invoke('rename', {
    path,
    newName: `DISABLED_${modName}`,
  });
}

export async function enableMod(modId: string) {
  const path = (await getModsFolder()) + `DISABLED_${modId}`;
  const modName = path.replace(/\\/g, '/').split('/').pop();
  const pathExists = await invoke('dir_exists', {
    path,
  });

  if (!pathExists) return console.log("Path doesn't exist");

  if (!modName?.includes('DISABLED_')) return;

  const newName = modName.replace('DISABLED_', '');

  await invoke('rename', {
    path,
    newName,
  });
}

export async function getModFolderName(modId: string) {
  const modsFolder = await getModsFolder();

  if (!modsFolder) return null;

  const modEnabled = await invoke('dir_exists', {
    path: modsFolder + modId,
  });
  const modDisabled = await invoke('dir_exists', {
    path: modsFolder + 'DISABLED_' + modId,
  });

  if (!modEnabled && !modDisabled) return null;

  if (modEnabled) return modId;
  if (modDisabled) return 'DISABLED_' + modId;
}

export async function modIsEnabled(modId: string) {
  return !(await getModFolderName(modId))?.includes('DISABLED_');
}
