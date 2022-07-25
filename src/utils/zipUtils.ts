import { invoke } from '@tauri-apps/api'
import { listen } from '@tauri-apps/api/event'

export function unzip(file: string, dest: string, topLevelStrip?: boolean, onFinish?: () => void) {
  invoke('unzip', {
    zipfile: file,
    destpath: dest,
    topLevelStrip,
  })

  listen('extract_end', ({ payload }) => {
    if (payload === file && onFinish) {
      onFinish()
    }
  })
}
