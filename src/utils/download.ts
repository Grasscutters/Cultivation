
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

export default class DownloadHandler {
  downloads: {
    path: string,
    progress: number,
    total: number,
    status: string,
  }[]

  // Pass tauri invoke function
  constructor() {
    this.downloads = []

    listen('download_progress', (...payload) => {
      // @ts-expect-error Payload may be unknown but backend always returns this object
      const obj: {
        downloaded: number,
        total: number,
        path: string,
      } = payload[0].payload

      const index = this.downloads.findIndex(download => download.path === obj.path)
      this.downloads[index].progress = obj.downloaded
    })

    listen('download_finished', (...payload) => {
      // Remove from array
      const filename = payload[0]?.payload

      // set status to finished
      const index = this.downloads.findIndex(download => download.path === filename)
      this.downloads[index].status = 'finished'
    })
  }
  
  addDownload(url: string, path: string) {
    // Begin download from rust backend
    invoke('download_file', { url, path })

    const obj = {
      path,
      progress: 0,
      total: 0,
      status: 'downloading'
    }

    this.downloads.push(obj)
  }

  getDownloadProgress(path: string) {
    const index = this.downloads.findIndex(download => download.path === path)
    return this.downloads[index] || null
  }

  getTotalAverage() {
    const files = this.downloads.filter(d => d.status !== 'finished')
    const total = files.reduce((acc, d) => acc + d.total, 0)
    const progress = files.reduce((acc, d) => acc + d.progress, 0)

    return {
      average: (progress / total) * 100 || 0,
      files: this.downloads.filter(d => d.status !== 'finished').length,
      totalSize: total,
    }
  }
}