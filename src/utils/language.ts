import { invoke } from '@tauri-apps/api'
import React from 'react'
import { getConfigOption } from './configuration'

interface IProps {
  text: string;
}

interface IState {
  language: string;
  translated_text: string;
}

export default class Tr extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      language: 'en',
      translated_text: '',
    }
  }

  componentDidMount() {
    const { text } = this.props
    getConfigOption('language').then((language: string) => {
      // Get translation file
      if (!language) language = 'en'

      invoke('get_lang', { lang: language }).then((response) => {
        const translation_obj = JSON.parse(response as string || '{}')

        console.log(translation_obj)

        // Traversal
        if (text.includes('.')) {
          const keys = text.split('.')
          let translation: string | Record<string, string> = translation_obj

          for (let i = 0; i < keys.length; i++) {
            if (!translation) {
              translation = ''
            } else {
              translation = typeof translation !== 'string' ? translation[keys[i]] : translation as string
            }
          }

          console.log(translation)

          this.setState({
            translated_text: translation as string,
          })
        } else {
          this.setState({
            translated_text: translation_obj[text] || ''
          })
        }
      })
    })
  }

  render() {
    return this.state.translated_text
  }
}

export async function translate(text: string) {
  const language = await getConfigOption('language') || 'en'
  const translation_json = JSON.parse(await invoke('get_lang', { lang: language }) || '{}')
  
  // Traversal
  if (text.includes('.')) {
    const keys = text.split('.')
    let translation = ''

    for (let i = 0; i < keys.length; i++) {
      if (!translation) {
        translation = ''
      } else {
        translation = translation_json[keys[i]] || ''
      }
    }

    return translation
  } else {
    return translation_json[text] || ''
  }
}