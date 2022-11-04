import type { Download } from 'features/download/lib/types';
import { capitalizeFirstLetter } from 'shared/lib/string';
import {
  batch,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
  Signal,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { byteToString } from 'utils/string';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';

export * from 'features/download/lib/types';

export const STABLE_REPO_DOWNLOAD =
  'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/stable.zip';
export const DEV_REPO_DOWNLOAD =
  'https://github.com/Grasscutters/Grasscutter/archive/refs/heads/development.zip';
export const STABLE_DOWNLOAD =
  'https://nightly.link/Grasscutters/Grasscutter/workflows/build/stable/Grasscutter.zip';
export const DEV_DOWNLOAD =
  'https://nightly.link/Grasscutters/Grasscutter/workflows/build/development/Grasscutter.zip';
export const RESOURCES_DOWNLOAD =
  'https://github.com/tamilpp25/Grasscutter_Resources/archive/refs/heads/3.0.zip';

export type Downloads = {
  [path: string]: Download;
};

type Match = (path: string) => boolean;

type DownloadRegistrar<T extends string> = {
  [K in T as `downloading${Capitalize<K>}`]: () => boolean;
} & {
  register: (path: string) => void;
  unregister: (path: string) => void;
  downloading: () => string[];
};

export function createDownloadRegistrar<T extends Record<string, Match>>(
  matchers: T
): keyof T extends string ? DownloadRegistrar<keyof T> : never {
  const downloadingSet = new Set<string>();
  const entries = Object.entries(matchers);

  const signals = [] as Signal<boolean>[];

  for (const _ of entries) {
    signals.push(createSignal(false, { equals: false }));
  }

  function coldLoop(path: string, setSignal: boolean) {
    for (let i = 0; i < signals.length; i++) {
      const matcher = entries[i][1];
      if (matcher(path)) return signals[i][1](setSignal);
    }
  }

  function register(path: string) {
    coldLoop(path, true);
    downloadingSet.add(path);
  }

  function unregister(path: string) {
    coldLoop(path, false);
    downloadingSet.delete(path);
  }

  const newEntries = Object.fromEntries(
    entries.map(([key], i) => [
      `downloading${capitalizeFirstLetter(key)}`,
      signals[i][0],
    ])
  );

  return {
    register,
    unregister,
    downloading() {
      return [...downloadingSet];
    },
    ...newEntries,
  } as unknown as keyof T extends string ? DownloadRegistrar<keyof T> : never;
}

export function createDownloadsManager() {
  const [downloads, setDownloads] = createStore<Downloads>({});
  const [jarExtracted, setJarExtracted] = createSignal(false);

  const { register, unregister, downloading, ...registrarMethods } =
    createDownloadRegistrar({
      jar: (p) => p.includes('grasscutter.zip'),
      resources: (p) => p.includes('resources'),
      repo: (p) => p.includes('grasscutter_repo.zip'),
    });

  const unlisteners: Promise<UnlistenFn>[] = [];

  const owner = getOwner()!;

  unlisteners.push(
    listen(
      'jar_extracted',
      runWithOwner(owner, () => () => setJarExtracted(true))
    )
  );

  unlisteners.push(
    listen(
      'download_progress',
      runWithOwner(owner, () => ({ payload }) => {
        const path = payload.path;
        batch(() => {
          setDownloads(path, 'progress', parseInt(payload.downloaded, 10));
          setDownloads(path, 'total', parseInt(payload.total, 10));
          setDownloads(
            path,
            'totalDownloaded',
            parseInt(payload.total_downloaded, 10)
          );

          // Set download speed based on startTime
          const now = Date.now();
          const timeDiff = now - downloads[path].startTime;
          let speed = (downloads[path].progress / timeDiff) * 1000;

          if (downloads[path].total === 0) {
            // If our total is 0, then we are downloading a file without a size
            // Calculate the average speed based total_downloaded and startTme
            speed = (downloads[path].totalDownloaded / timeDiff) * 1000;
          }

          setDownloads(path, 'speed', byteToString(speed) + '/s');
        });
      })
    )
  );

  unlisteners.push(
    listen(
      'download_finished',
      runWithOwner(owner, () => ({ payload }) => {
        const path = payload;

        setDownloads(path, 'status', 'finished');

        // Call onFinish callback
        const onFinish = downloads[path].onFinish;
        if (onFinish) {
          onFinish();
        }
      })
    )
  );

  unlisteners.push(
    listen(
      'download_error',
      runWithOwner(owner, () => ({ payload }) => {
        const errorData = payload;

        // Set download to error
        const path = errorData.path;

        batch(() => {
          setDownloads(path, 'status', 'error');
          setDownloads(path, 'error', errorData.error);
        });

        unregister(path);
      })
    )
  );

  // Extraction events
  unlisteners.push(
    listen(
      'extract_start',
      runWithOwner(owner, () => ({ payload }) => {
        setDownloads(payload, 'status', 'extracting');
      })
    )
  );

  unlisteners.push(
    listen(
      'extract_end',
      runWithOwner(owner, () => ({ payload }) => {
        // Find the download that is not extracting and set its status as such
        const path = payload.file || payload.new_folder;
        setDownloads(path, 'status', 'finished');

        unregister(path);
      })
    )
  );

  onCleanup(async () => {
    const uls = await Promise.all(unlisteners);
    for (const ul of uls) {
      ul();
    }
  });

  return {
    downloads,

    ...registrarMethods,

    addDownload(
      url: string,
      path: string,
      onFinish?: () => void | Promise<void>
    ) {
      register(path);
      // Begin download from rust backend, don't add if the download addition fails
      invoke('download_file', { url, path });

      setDownloads(path, {
        path,
        progress: 0,
        total: 0,
        totalDownloaded: 0,
        status: 'downloading',
        startTime: Date.now(),
        onFinish,
      });
    },

    stopDownload(path: string) {
      console.log('stopping', path);
      // Stop download and remove from list.
      invoke('stop_download', { path });

      unregister(path);

      // Remove download
      setDownloads((s) => {
        const newStore = { ...s };
        delete newStore[path];

        return newStore;
      });
    },

    getDownloadProgress(path: string) {
      return downloads[path] || null;
    },

    getDownloadSize(path: string) {
      return byteToString(downloads[path].total) || null;
    },

    getTotalAverage() {
      const downloadingPaths = downloading();
      const files = downloadingPaths.map((p) => downloads[p]);
      const total = files.reduce((acc, d) => acc + d?.total ?? 0, 0);
      const progress = files.reduce(
        (acc, d) =>
          d?.progress !== 0
            ? acc + d?.progress ?? 0
            : acc + d?.totalDownloaded ?? 0,
        0
      );
      let speedStr = '0 B/s';

      // Get download speed based on startTimes
      if (files.length > 0) {
        const now = Date.now();
        const timeDiff = now - files[0]?.startTime ?? 0;
        const speed = (progress / timeDiff) * 1000;
        speedStr = byteToString(speed) + '/s';
      }

      return {
        average: (progress / total) * 100 || 0,
        files: files.length,
        extracting: Object.values(downloads).filter(
          (d) => d.status === 'extracting'
        ).length,
        totalSize: total,
        speed: speedStr,
      };
    },

    jarExtracted,
  };
}
