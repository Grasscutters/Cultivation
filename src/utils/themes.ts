import { invoke } from '@tauri-apps/api'

interface Theme {
  name: string
  version: string
  description: string

  // Included custom CSS and JS files
  includes: {
    css: string[]
    js: string[]
  }

  customBackgroundURL?: string
  customBackgroundPath?: string
}

interface BackendThemeList {
  json: string
  path: string
}

interface ThemeList extends Theme {
  path: string
}

export async function getThemeList() {
  // Do some invoke to backend to get the theme list
  const themes = await invoke('get_theme_list') as BackendThemeList[]
  const list: ThemeList[] = []

  themes.forEach(t => {
    let obj

    try {
      obj = JSON.parse(t.json)
    } catch (e) {
      console.error(e)
    }

    list.push({ ...obj, path: t.path })
  })

  return list
}

export async function loadTheme(theme: string) {
  // Do some invoke to backend to load the theme
}