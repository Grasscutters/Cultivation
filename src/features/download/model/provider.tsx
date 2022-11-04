import { createContext, useContext } from 'solid-js';

import type { createDownloadsManager } from 'features/download/lib';

type DownloadManager = ReturnType<typeof createDownloadsManager>;

const DownloadContext = createContext<DownloadManager | null>(null);

function useDownloadManager() {
  const manager = useContext(DownloadContext);

  if (!manager) throw new Error('Wrap in provider!');

  return manager;
}

const DownloadProvider = DownloadContext.Provider;

export { DownloadProvider, useDownloadManager };
