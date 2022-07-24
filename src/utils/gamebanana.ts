import { invoke } from '@tauri-apps/api'
import { getConfigOption } from './configuration'

// Generated with https://transform.tools/json-to-typescript I'm lazy cry about it
export interface GamebananaResponse {
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

export interface PreviewMedia {
  _aImages?: Image[]
  _aMetadata?: Metadata
}

export interface Image {
  _sType: string
  _sBaseUrl: string
  _sFile: string
  _sFile530?: string
  _sFile100: string
  _sFile220?: string
  _sCaption?: string
}

export interface Metadata {
  _sState?: string
  _sSnippet: string
  _nPostCount?: number
  _nBounty?: number
}

export interface Submitter {
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

export interface RootCategory {
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

export async function getMods(mode: string) {
  const resp = JSON.parse(
    await invoke('list_submissions', {
      mode,
    })
  )

  return formatGamebananaData(resp)
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
    return {
      path,
      info: JSON.parse(mods[path]),
    }
  })
}
