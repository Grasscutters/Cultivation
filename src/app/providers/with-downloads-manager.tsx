import { createDownloadsManager, DownloadProvider } from 'features/download';
import type { Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function withDownloadManager(component: Component) {
  return function DownloadManager() {
    return (
      <DownloadProvider value={createDownloadsManager()}>
        <Dynamic component={component} />
      </DownloadProvider>
    );
  };
}
