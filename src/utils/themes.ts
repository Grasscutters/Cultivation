import { invoke } from "@tauri-apps/api"

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

export async function getThemeList() {
  // Do some invoke to backend to get the theme list
}

export async function loadTheme() {
  // Do some invoke to backend to load the theme
}