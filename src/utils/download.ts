import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { byteToString } from './string'

export default class DownloadHandler {
  downloads: {
    path: string
    progress: number
    total: number
    total_downloaded: number
    status: string
    startTime: number
    error?: string
    speed?: string
    onFinish?: () => void
  }[]

  // Pass tauri invoke function
  constructor() {
    this.downloads = []

    listen('download_progress', ({ payload }) => {
      // @ts-expect-error Payload may be unknown but backend always returns this object
      const obj: {
        downloaded: string
        total: string
        path: string
        total_downloaded: string
      } = payload

      const index = this.downloads.findIndex((download) => download.path === obj.path)
      this.downloads[index].progress = parseInt(obj.downloaded, 10)
      this.downloads[index].total = parseInt(obj.total, 10)
      this.downloads[index].total_downloaded = parseInt(obj.total_downloaded, 10)

      // Set download speed based on startTime
      const now = Date.now()
      const timeDiff = now - this.downloads[index].startTime
      let speed = (this.downloads[index].progress / timeDiff) * 1000

      if (this.downloads[index].total === 0) {
        // If our total is 0, then we are downloading a file without a size
        // Calculate the average speed based total_downloaded and startTme
        speed = (this.downloads[index].total_downloaded / timeDiff) * 1000
      }

      this.downloads[index].speed = byteToString(speed) + '/s'
    })

    listen('download_finished', ({ payload }) => {
      // Remove from array
      const filename = payload

      // set status to finished
      const index = this.downloads.findIndex((download) => download.path === filename)
      this.downloads[index].status = 'finished'

      // Call onFinish callback
      if (this.downloads[index]?.onFinish) {
        // @ts-expect-error onFinish is checked for existence before being called
        this.downloads[index]?.onFinish()
      }
    })

    listen('download_error', ({ payload }) => {
      // @ts-expect-error shut up typescript
      const errorData: {
        path: string
        error: string
      } = payload

      // Set download to error
      const index = this.downloads.findIndex((download) => download.path === errorData.path)
      this.downloads[index].status = 'error'
      this.downloads[index].error = errorData.error

      // Remove GIMI from list as fallback will replace it
      if (errorData.path.includes('GIMI.zip')) {
        this.downloads.splice(index, 1)
      }
    })

    // Extraction events
    listen('extract_start', ({ payload }) => {
      // Find the download that is extracting and set it's status as such
      const index = this.downloads.findIndex((download) => download.path === payload)
      this.downloads[index].status = 'extracting'
    })

    listen('extract_end', ({ payload }) => {
      // @ts-expect-error shut up typescript
      const obj: {
        file: string
        new_folder: string
      } = payload

      // Find the download that is not extracting and set it's status as such
      const index = this.downloads.findIndex((download) => download.path === obj.file)
      this.downloads[index].status = 'finished'

      // Remove completed extraction from list
      this.downloads.splice(index, 1)
    })
  }

  getDownloads() {
    return this.downloads
  }

  downloadingJar() {
    // Kinda hacky but it works
    return this.downloads.some((d) => d.path.includes('grasscutter.zip') && d.status != ('finished' || 'error'))
  }

  downloadingFullBuild() {
    // Kinda hacky but it works
    return this.downloads.some((d) => d.path.includes('GrasscutterCulti') && d.status != ('finished' || 'error'))
  }

  downloadingResources() {
    // Kinda hacky but it works
    return this.downloads.some((d) => d.path.includes('resources') && d.status != ('finished' || 'error'))
  }

  downloadingRepo() {
    return this.downloads.some((d) => d.path.includes('grasscutter_repo.zip') && d.status != ('finished' || 'error'))
  }

  downloadingMigoto() {
    return this.downloads.some((d) => d.path.includes('3dmigoto') && d.status != ('finished' || 'error'))
  }

  addDownload(url: string, path: string, onFinish?: () => void) {
    // Begin download from rust backend, don't add if the download addition fails
    invoke('download_file', { url, path })
    const obj = {
      path,
      progress: 0,
      total: 0,
      total_downloaded: 0,
      status: 'downloading',
      startTime: Date.now(),
      onFinish,
    }

    this.downloads.push(obj)
  }

  stopDownload(path: string) {
    // Stop download and remove from list.
    invoke('stop_download', { path })

    // Remove from list
    const index = this.downloads.findIndex((download) => download.path === path)
    this.downloads.splice(index, 1)
  }

  getDownloadProgress(path: string) {
    const index = this.downloads.findIndex((download) => download.path === path)
    return this.downloads[index] || null
  }

  getDownloadSize(path: string) {
    const index = this.downloads.findIndex((download) => download.path === path)
    return byteToString(this.downloads[index].total) || null
  }

  getTotalAverage() {
    const files = this.downloads.filter((d) => d.status === 'downloading')
    const total = files.reduce((acc, d) => acc + d.total, 0)
    const progress = files.reduce((acc, d) => (d.progress !== 0 ? acc + d.progress : acc + d.total_downloaded), 0)
    let speedStr = '0 B/s'

    // Get download speed based on startTimes
    if (files.length > 0) {
      const now = Date.now()
      const timeDiff = now - files[0].startTime
      const speed = (progress / timeDiff) * 1000
      speedStr = byteToString(speed) + '/s'
    }

    return {
      average: (progress / total) * 100 || 0,
      files: this.downloads.filter((d) => d.status === 'downloading').length,
      extracting: this.downloads.filter((d) => d.status === 'extracting').length,
      totalSize: total,
      speed: speedStr,
    }
  }
}
