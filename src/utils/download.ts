
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { byteToString } from './string'

export default class DownloadHandler {
  downloads: {
    path: string,
    progress: number,
    total: number,
    status: string,
    error?: string,
  }[]

  // Pass tauri invoke function
  constructor() {
    this.downloads = []

    listen('download_progress', (...payload) => {
      // @ts-expect-error Payload may be unknown but backend always returns this object
      const obj: {
        downloaded: string,
        total: string,
        path: string,
      } = payload[0].payload

      const index = this.downloads.findIndex(download => download.path === obj.path)
      this.downloads[index].progress = parseInt(obj.downloaded, 10)
      this.downloads[index].total = parseInt(obj.total, 10)
    })

    listen('download_finished', (...payload) => {
      // Remove from array
      const filename = payload[0]?.payload

      // set status to finished
      const index = this.downloads.findIndex(download => download.path === filename)
      this.downloads[index].status = 'finished'
    })

    listen('download_error', (...payload) => {
      // @ts-expect-error shut up typescript
      const errorData: {
        path: string,
        error: string,
      } = payload[0]?.payload

      // Set download to error
      const index = this.downloads.findIndex(download => download.path === errorData.path)
      this.downloads[index].status = 'error'
      this.downloads[index].error = errorData.error
    })
  }

  getDownloads() {
    return this.downloads
  }
  
  addDownload(url: string, path: string) {
    // Begin download from rust backend, don't add if the download addition fails
    invoke('download_file', { url, path })
    const obj = {
      path,
      progress: 0,
      total: 0,
      status: 'downloading'
    }

    this.downloads.push(obj)
  }

  stopDownload(path: string) {
    // Stop download and remove from list.
    invoke('stop_download', { path })

    // Remove from list
    const index = this.downloads.findIndex(download => download.path === path)
    this.downloads.splice(index, 1)
  }

  getDownloadProgress(path: string) {
    const index = this.downloads.findIndex(download => download.path === path)
    return this.downloads[index] || null
  }

  getDownloadSize(path: string) {
    const index = this.downloads.findIndex(download => download.path === path)
    return byteToString(this.downloads[index].total) || null
  }

  getTotalAverage() {
    const files = this.downloads.filter(d => d.status !== 'finished')
    const total = files.reduce((acc, d) => acc + d.total, 0)
    const progress = files.reduce((acc, d) => acc + d.progress, 0)

    return {
      average: (progress / total) * 100 || 0,
      files: this.downloads.filter(d => d.status !== 'finished' && d.status !== 'error').length,
      totalSize: total,
    }
  }
}