import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

interface UnzipPayload {
  file: string;
  new_folder: string;
}

export function unzip(
  file: string,
  dest: string,
  topLevelStrip?: boolean,
  folderIfLoose?: boolean
): Promise<UnzipPayload> {
  return new Promise((resolve) => {
    invoke('unzip', {
      zipfile: file,
      destpath: dest,
      topLevelStrip,
      folderIfLoose,
    });

    listen('extract_end', ({ payload }) => {
      console.log(payload);
      console.log(file);

      // @ts-expect-error Payload is an object
      if (payload?.file === file) {
        resolve(payload as UnzipPayload);
      }
    });
  });
}
