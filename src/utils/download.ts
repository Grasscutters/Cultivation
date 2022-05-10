
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

export default class DownloadHandler {
  downloads: Array<string>

  // Pass tauri invoke function
  constructor() {
    this.downloads = []

    listen('download_progress', (...payload) => {
      console.log(payload)
    })

    listen('download_finished', (...payload) => {
      console.log(payload)
    })
  }
  
  addDownload(url: string, path: string) {
    // Begin download from rust backend
    invoke('download_file', { url, path })

    // Register event handler
    this.downloads.push(path)
  }
}