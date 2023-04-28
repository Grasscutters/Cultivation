import { invoke } from '@tauri-apps/api'
import { dataDir } from '@tauri-apps/api/path'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { getConfig, setConfigOption } from './configuration'

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

const defaultTheme = {
  name: 'default',
  version: '1.0.0',
  description: 'Default theme',
  includes: {
    css: [],
    js: [],
  },
  path: 'default',
}
export async function getThemeList() {
  // Do some invoke to backend to get the theme list
  const themes = (await invoke('get_theme_list', {
    dataDir: `${await dataDir()}/cultivation`,
  })) as BackendThemeList[]
  const list: ThemeList[] = [
    // ALWAYS include default theme
    {
      name: 'default',
      version: '1.0.0',
      description: 'Default theme',
      includes: {
        css: [],
        js: [],
      },
      path: 'default',
    },
  ]

  themes.forEach((t) => {
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

export async function getTheme(name: string) {
  const themes = await getThemeList()

  return themes.find((t) => t.name === name) || defaultTheme
}

export async function loadTheme(theme: ThemeList, document: Document) {
  // Get config, since we will set the custom background in there
  const config = await getConfig()

  // We are going to dynamically load stylesheets into the document
  const head = document.head

  // Get all CSS includes
  const cssIncludes = theme.includes.css
  const jsIncludes = theme.includes.js

  // Load CSS files
  cssIncludes.forEach((css) => {
    if (!css) return

    const link = document.createElement('link')

    link.rel = 'stylesheet'
    link.href = convertFileSrc(theme.path + '/' + css)
    head.appendChild(link)
  })

  // Load JS files
  jsIncludes.forEach((js) => {
    if (!js) return

    const script = document.createElement('script')

    script.src = convertFileSrc(theme.path + '/' + js)
    head.appendChild(script)
  })

  // Set custom background
  if (theme.customBackgroundURL) {
    // If the custom bg is already set don't overwrite
    if (config.custom_background === '') {
      config.custom_background = theme.customBackgroundURL
    }
  }

  // Set custom background
  if (theme.customBackgroundPath) {
    const bgPath = (await dataDir()).replace(/\\/g, '/') + 'cultivation/bg/'
    const imageName = theme.customBackgroundPath.split('/').pop()

    // Save the background to our data dir
    await invoke('copy_file', {
      path: theme.path + '/' + theme.customBackgroundPath,
      newPath: bgPath,
    })

    // Set the background
    // If the custom bg is already set don't overwrite
    if (config.custom_background === '') {
      config.custom_background = bgPath + imageName
    }
  }

  // Write config
  await setConfigOption('custom_background', config.custom_background)

  return
}
