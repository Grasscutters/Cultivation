import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

export function unzip(
  file: string,
  dest: string,
  topLevelStrip?: boolean,
  folderIfLoose?: boolean,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) resolve();
    signal &&
      (signal.onabort = () => {
        resolve();
      });

    invoke('unzip', {
      zipfile: file,
      destpath: dest,
      topLevelStrip,
      folderIfLoose,
    });

    const p = listen('extract_end', ({ payload }) => {
      if (payload?.file === file) {
        resolve(
          p.then((unsub) => {
            unsub();
          })
        );
      }
    });
  });
}
