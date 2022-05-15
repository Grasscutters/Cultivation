import { invoke } from '@tauri-apps/api'

export function unzip(file: string, zippath: string, dest: string) {
  invoke('unzip', {
    zipfile: file,
    zippath: zippath,
    destpath: dest,
  })
}