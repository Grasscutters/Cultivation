import { invoke } from '@tauri-apps/api'

export function unzip(file: string, dest: string) {
  invoke('unzip', {
    zipfile: file,
    destpath: dest,
  })
}