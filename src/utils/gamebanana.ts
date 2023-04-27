import { invoke } from '@tauri-apps/api'
import { getConfigOption } from './configuration'

// Generated with https://transform.tools/json-to-typescript I'm lazy cry about it
interface GamebananaResponse {
  _idRow: number
  _sModelName: string
  _sSingularTitle: string
  _sIconClasses: string
  _sName: string
  _sProfileUrl: string
  _aPreviewMedia: PreviewMedia
  _tsDateAdded: number
  _bHasFiles: boolean
  _aSubmitter: Submitter
  _aRootCategory: RootCategory
  _bIsNsfw: boolean
  _sInitialVisibility: string
  _nLikeCount?: number
  _bIsOwnedByAccessor: boolean
  _nViewCount?: number
  _nPostCount?: number
  _tsDateUpdated?: number
}

interface PreviewMedia {
  _aImages?: Image[]
  _aMetadata?: Metadata
}

interface Image {
  _sType: string
  _sBaseUrl: string
  _sFile: string
  _sFile530?: string
  _sFile100: string
  _sFile220?: string
  _sCaption?: string
}

interface Metadata {
  _sState?: string
  _sSnippet: string
  _nPostCount?: number
  _nBounty?: number
}

interface Submitter {
  _idRow: number
  _sName: string
  _bIsOnline: boolean
  _bHasRipe: boolean
  _sProfileUrl: string
  _sAvatarUrl: string
  _sUpicUrl?: string
  _aClearanceLevels?: string[]
  _sHdAvatarUrl?: string
}

interface RootCategory {
  _sName: string
  _sProfileUrl: string
  _sIconUrl: string
}

export interface ModData {
  id: number
  name: string
  images: string[]
  dateadded: number
  submitter: {
    name: string
    url: string
  }
  nsfw: boolean
  likes: number
  views: number
  type: string
}

export interface PartialModData {
  name: string
  images: string[]
  submitter: {
    name: string
  }
  likes: number
  views: number
}

interface GamebananaDownloads {
  _bIsTrashed: boolean
  _bIsWithheld: boolean
  _aFiles: File[]
  _sLicense: string
}

interface File {
  _idRow: number
  _sFile: string
  _nFilesize: number
  _sDescription: string
  _tsDateAdded: number
  _nDownloadCount: number
  _sAnalysisState: string
  _sDownloadUrl: string
  _sMd5Checksum: string
  _sClamAvResult: string
  _sAnalysisResult: string
  _bContainsExe: boolean
}

interface ModDownload {
  filename: string
  downloadUrl: string
  filesize: number
  containsExe: boolean
}

export async function getMods(mode: string, page: number, search: string) {
  let modList: GamebananaResponse[] = []

  if (search.length > 0) {
    let hadMods = true
    let page = 1

    while (hadMods) {
      const resp = JSON.parse(
        await invoke('list_submissions', {
          mode,
          page: '' + page,
          search: search,
        })
      )

      const total = resp._aMetadata._nRecordCount

      if (page > total / 15) hadMods = false

      modList = [...modList, ...resp._aRecords]
      page++
    }

    return formatGamebananaData(modList)
  }

  const resp = JSON.parse(
    await invoke('list_submissions', {
      mode,
      page: '' + page,
      search: '',
    })
  )

  modList = [...modList, ...resp]

  return formatGamebananaData(modList)
}

export async function formatGamebananaData(obj: GamebananaResponse[]) {
  if (!obj) return []

  return obj
    .map((itm) => {
      const img = itm?._aPreviewMedia?._aImages

      return {
        id: itm._idRow,
        name: itm._sName,
        images: img
          ? img.map((i) => {
              return i._sBaseUrl + '/' + i._sFile220
            })
          : [],
        dateadded: itm._tsDateAdded,
        submitter: {
          name: itm._aSubmitter._sName,
          url: itm._aSubmitter._sProfileUrl,
        },
        nsfw: itm._bIsNsfw,
        likes: itm?._nLikeCount || 0,
        views: itm?._nViewCount || 0,
        type: itm._sSingularTitle,
      } as ModData
    })
    .filter((itm) => itm.type === 'Mod')
}

export async function getInstalledMods() {
  const migotoPath = await getConfigOption('migoto_path')

  if (!migotoPath) return []

  const mods = (await invoke('list_mods', {
    path: migotoPath,
  })) as Record<string, string>

  // These are returned as JSON strings, so we have to parse them
  return Object.keys(mods).map((path) => {
    const info = JSON.parse(mods[path]) as ModData | PartialModData

    const modPathArr = path.replace(/\\/g, '/').split('/')

    // If there is a file in this path, remove it from the path
    if (modPathArr[modPathArr.length - 1].includes('.')) modPathArr.pop()

    return {
      path: modPathArr.join('/'),
      info,
    }
  })
}

export async function getModDownload(modId: string) {
  const resp = JSON.parse(
    await invoke('get_download_links', {
      modId,
    })
  ) as GamebananaDownloads

  return formatDownloadsData(resp)
}

export async function formatDownloadsData(obj: GamebananaDownloads) {
  if (!obj) return []

  return obj._aFiles.map((itm) => {
    return {
      filename: itm._sFile,
      downloadUrl: `https://files.gamebanana.com/mods/${itm._sFile}`,
      filesize: itm._nFilesize,
      containsExe: itm._bContainsExe,
    } as ModDownload
  })
}
