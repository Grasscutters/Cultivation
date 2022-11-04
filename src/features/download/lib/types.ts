export type DownloadStatus =
  | 'finished'
  | 'error'
  | 'extracting'
  | 'downloading';

export interface Download {
  path: string;
  progress: number;
  total: number;
  totalDownloaded: number;
  status: DownloadStatus;
  startTime: number;
  error?: string;
  speed?: string;
  onFinish?: () => void;
}

declare module 'shared/lib/tauri' {
  export interface EventMap {
    download_progress: {
      downloaded: string;
      total: string;
      path: string;
      total_downloaded: string;
    };
    download_finished: string;
    download_error: {
      path: string;
      error: string;
    };
    extract_start: string;
    extract_end: {
      file: string;
      new_folder: string;
    };
  }
}
