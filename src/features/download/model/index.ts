import { useConfigurationManager } from 'entities/configuration';
import {
  DEV_DOWNLOAD,
  DEV_REPO_DOWNLOAD,
  RESOURCES_DOWNLOAD,
  STABLE_DOWNLOAD,
  STABLE_REPO_DOWNLOAD,
} from 'features/download/lib';
import { useDownloadManager } from 'features/download/model/provider';
import { getOwner, runWithOwner } from 'solid-js';
import { match } from 'ts-pattern';
import { unzip } from 'utils/zipUtils';
import { exists, removeDir } from '@tauri-apps/api/fs';
import { dataDir, resolve as resolvePath } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';

let __onFinish: (() => void | Promise<void>) | null = null;

export * from 'features/download/model/provider';

export type RepoType = 'stable' | 'dev';
export type JarType = 'stable' | 'latest';
export type DownloadResources = 'resources';
export type DownloadRepo = 'repo';
export type DownloadJar = 'jar';

export type DownloadType = DownloadJar | DownloadRepo | DownloadResources;

export type DownloadRepoProps = {
  download: DownloadRepo;
  type: RepoType;
};

export type DownloadJarProps = {
  download: DownloadJar;
  type: JarType;
};

export type DownloadResourcesProps = {
  download: DownloadResources;
};

export type DownloadProps =
  | DownloadRepoProps
  | DownloadJarProps
  | DownloadResourcesProps;

export function generateDownloadUiData(props: DownloadProps) {
  function generateIdSuffix() {
    let idSuffix = 'GC';

    if (props.download === 'repo' || props.download === 'jar') {
      if (props.type === 'dev' || props.type === 'latest') {
        idSuffix += 'Dev';
      } else {
        idSuffix += 'Stable';
      }

      if (props.download === 'repo') idSuffix += 'Data';

      return idSuffix;
    }

    idSuffix += 'Resources';

    return idSuffix;
  }

  function generateGc() {
    const gcObj = {
      gcSet: 'downloads.{{}}',
      gcUnset: 'downloads.{{}}_update',
    };

    function insertTemplate(text: string) {
      gcObj.gcSet = gcObj.gcSet.replaceAll('{{}}', text);
      gcObj.gcUnset = gcObj.gcUnset.replaceAll('{{}}', text);
    }

    let toInsert = '';

    if (props.download === 'repo' || props.download === 'jar') {
      toInsert += 'grasscutter_';

      if (props.type === 'dev' || props.type === 'latest') {
        toInsert += 'latest_';
      } else {
        toInsert += 'stable_';
      }

      if (props.download === 'jar') toInsert = toInsert.slice(0, -1);

      if (props.download === 'repo') toInsert += 'data';
    }

    insertTemplate(toInsert);

    if (props.download === 'resources') {
      gcObj.gcSet = 'downloads.resources';
      gcObj.gcUnset = 'downloads.resources';
    }

    return gcObj;
  }

  function generateHelp() {
    let help = 'help.';

    if (props.download === 'resources') {
      help += 'resources';

      return help;
    }

    help += 'gc_';

    if (props.type === 'dev' || props.type === 'latest') help += 'dev_';

    if (props.download === 'jar') {
      help += 'jar';
    } else {
      help += 'data';
    }

    return help;
  }

  function generateBtn() {
    return match(props)
      .with({ download: 'jar' }, (p) =>
        match(p.type)
          .with('stable', () => 'grasscutterStableBtn')
          .with('latest', () => 'grasscutterLatestBtn')
          .exhaustive()
      )
      .with({ download: 'repo' }, (p) =>
        match(p.type)
          .with('stable', () => 'grasscutterStableRepo')
          .with('dev', () => 'grasscutterDevRepo')
          .exhaustive()
      )
      .with({ download: 'resources' }, () => 'resourcesBtn')
      .exhaustive();
  }

  return {
    idSuffix: generateIdSuffix(),

    ...generateGc(),

    help: generateHelp(),

    btn: generateBtn(),
  };
}

async function getGrasscutterFolder() {
  const configurationManager = useConfigurationManager();
  const path = configurationManager.getConfigOption('grasscutter_path');
  let folderPath;

  // Set to default if not set
  if (!path || path === '') {
    const appdata = await dataDir();
    folderPath = await resolvePath(appdata, 'cultivation', 'grasscutter');

    // Early return since its formatted properly
    return folderPath;
  }

  if (path.includes('/')) {
    folderPath = path.substring(0, path.lastIndexOf('/'));
  } else {
    folderPath = path.substring(0, path.lastIndexOf('\\'));
  }

  return folderPath;
}

export function generatePath(download: DownloadType) {
  return match(download)
    .with('jar', () => 'grasscutter.zip')
    .with('repo', () => 'grasscutter_repo.zip')
    .with('resources', () => 'resources.zip')
    .exhaustive();
}

export function downloadGrasscutterFiles(
  props: DownloadProps,
  signal: AbortSignal
): Promise<void> {
  const pathsToCancel: string[] = [];
  const owner = getOwner();
  const downloadsManager = useDownloadManager();
  const url = match(props)
    .with({ download: 'repo' }, (p) =>
      match(p.type)
        .with('stable', () => STABLE_REPO_DOWNLOAD)
        .with('dev', () => DEV_REPO_DOWNLOAD)
        .exhaustive()
    )
    .with({ download: 'jar' }, (p) =>
      match(p.type)
        .with('stable', () => STABLE_DOWNLOAD)
        .with('latest', () => DEV_DOWNLOAD)
        .exhaustive()
    )
    .with({ download: 'resources' }, () => RESOURCES_DOWNLOAD)
    .exhaustive();

  const filename = generatePath(props.download);

  if (props.download === 'jar' && owner) {
    runWithOwner(owner, () => {
      downloadGrasscutterFiles(
        {
          download: 'repo',
          type: props.type === 'latest' ? 'dev' : props.type,
        },
        signal
      );
    });
  }

  async function download() {
    const folder = await getGrasscutterFolder();

    const path = await resolvePath(folder, filename);

    pathsToCancel.push(path);

    return new Promise<void>((resolve) => {
      downloadsManager.addDownload(url, path, async () => {
        if (props.download === 'resources') {
          const path = await resolvePath(folder, 'resources');
          if (await exists(path)) {
            await removeDir(path, {
              recursive: true,
            });
          }
        }

        await unzip(path, folder, true, undefined, signal);

        if (props.download === 'resources') {
          await invoke('rename', {
            path: await resolvePath(folder, 'Resources'),
            newName: 'resources',
          });
        }

        await __onFinish?.();

        resolve();
      });
    });
  }

  return Promise.race([
    download(),
    new Promise<void>((resolve) => {
      function listener() {
        console.log('aborting...', pathsToCancel);
        pathsToCancel.forEach(downloadsManager.stopDownload);
        resolve();
        signal.removeEventListener('abort', listener);
      }

      signal.addEventListener('abort', listener);
    }),
  ]);
}

export function withOnFinish(
  onFinish: () => void | Promise<void>,
  fn: () => void | Promise<void>
) {
  __onFinish = onFinish;
  fn();
  __onFinish = null;
}
