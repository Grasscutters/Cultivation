<<<<<<< HEAD
import { createSignal, onMount } from 'solid-js';
import { invoke } from '@tauri-apps/api';

import { getConfigOption } from './configuration';

interface IProps {
  text: string;
}

export default function Tr(props: IProps) {
=======
import { invoke } from '@tauri-apps/api'
import { getConfigOption } from './configuration'
import { createSignal, onMount } from "solid-js";

interface IProps {
  text: string
}

interface IState {
  language: string
  translated_text: string
}

export default function Tr(props: IProps) {
  const [language, setLanguage] = createSignal('en');
>>>>>>> aa45f04 (feat: move to solid-js)
  const [translatedText, setTranslatedText] = createSignal('');

  onMount(async () => {
    const { text } = props;
<<<<<<< HEAD
    let language = await getConfigOption('language');

    // Get translation file
    if (!language) language = 'en';

    const response = await invoke('get_lang', { lang: language });
    const default_resp = await invoke('get_lang', { lang: 'en' });

    const translation_obj = JSON.parse((response as string) || '{}');
    const default_obj = JSON.parse((default_resp as string) || '{}');

    // Traversal
    if (text.includes('.')) {
      const keys = text.split('.');
      let translation: string | Record<string, string> = translation_obj;

      for (let i = 0; i < keys.length; i++) {
        if (!translation) {
          translation = '';
        } else {
          translation =
            typeof translation !== 'string'
              ? translation[keys[i]]
              : (translation as string);
=======
    let language = await getConfigOption('language')

    // Get translation file
    if (!language) language = 'en'

    const response = await invoke('get_lang', { lang: language })
    const default_resp = await invoke('get_lang', { lang: 'en' })

    const translation_obj = JSON.parse((response as string) || '{}')
    const default_obj = JSON.parse((default_resp as string) || '{}')

    // Traversal
    if (text.includes('.')) {
      const keys = text.split('.')
      let translation: string | Record<string, string> = translation_obj

      for (let i = 0; i < keys.length; i++) {
        if (!translation) {
          translation = ''
        } else {
          translation = typeof translation !== 'string' ? translation[keys[i]] : (translation as string)
>>>>>>> aa45f04 (feat: move to solid-js)
        }
      }

      // If we could not find a translation, use the default one
      if (!translation) {
<<<<<<< HEAD
        translation = default_obj;

        for (let i = 0; i < keys.length; i++) {
          if (!translation) {
            translation = '';
          } else {
            translation =
              typeof translation !== 'string'
                ? translation[keys[i]]
                : (translation as string);
=======
        translation = default_obj

        for (let i = 0; i < keys.length; i++) {
          if (!translation) {
            translation = ''
          } else {
            translation = typeof translation !== 'string' ? translation[keys[i]] : (translation as string)
>>>>>>> aa45f04 (feat: move to solid-js)
          }
        }
      }

      setTranslatedText(translation as string);
    } else {
      setTranslatedText(translation_obj[text] || '');
    }
  });

  return <>{translatedText()}</>;
}

export async function getLanguages() {
  const resp: {
<<<<<<< HEAD
    [key: string]: string;
  } = await invoke('get_languages');
  const lang_list: {
    [key: string]: string;
  }[] = [];

  Object.keys(resp).forEach((k) => {
    const parsed = JSON.parse(resp[k]);

    if (parsed.lang_name) {
      lang_list.push({ [k.split('.json')[0]]: parsed.lang_name });
    }
  });

  return lang_list;
}

export async function translate(text: string) {
  const language = (await getConfigOption('language')) || 'en';
  const translation_json = JSON.parse(
    (await invoke('get_lang', { lang: language })) || '{}'
  );
  const default_json = JSON.parse(await invoke('get_lang', { lang: 'en' }));

  // Traversal
  if (text.includes('.')) {
    const keys = text.split('.');
    let translation: string | Record<string, string> = translation_json;

    for (let i = 0; i < keys.length; i++) {
      if (!translation) {
        translation = '';
      } else {
        translation =
          typeof translation !== 'string'
            ? translation[keys[i]]
            : (translation as string);
=======
    [key: string]: string
  } = await invoke('get_languages')
  const lang_list: {
    [key: string]: string
  }[] = []

  Object.keys(resp).forEach((k) => {
    const parsed = JSON.parse(resp[k])

    if (parsed.lang_name) {
      lang_list.push({ [k.split('.json')[0]]: parsed.lang_name })
    }
  })

  return lang_list
}

export async function translate(text: string) {
  const language = (await getConfigOption('language')) || 'en'
  const translation_json = JSON.parse((await invoke('get_lang', { lang: language })) || '{}')
  const default_json = JSON.parse(await invoke('get_lang', { lang: 'en' }))

  // Traversal
  if (text.includes('.')) {
    const keys = text.split('.')
    let translation: string | Record<string, string> = translation_json

    for (let i = 0; i < keys.length; i++) {
      if (!translation) {
        translation = ''
      } else {
        translation = typeof translation !== 'string' ? translation[keys[i]] : (translation as string)
>>>>>>> aa45f04 (feat: move to solid-js)
      }
    }

    // If we could not find a translation, use the default one
    if (!translation) {
<<<<<<< HEAD
      translation = default_json;

      for (let i = 0; i < keys.length; i++) {
        if (!translation) {
          translation = '';
        } else {
          translation =
            typeof translation !== 'string'
              ? translation[keys[i]]
              : (translation as string);
=======
      translation = default_json

      for (let i = 0; i < keys.length; i++) {
        if (!translation) {
          translation = ''
        } else {
          translation = typeof translation !== 'string' ? translation[keys[i]] : (translation as string)
>>>>>>> aa45f04 (feat: move to solid-js)
        }
      }
    }

<<<<<<< HEAD
    return translation;
  } else {
    return translation_json[text] || '';
=======
    return translation
  } else {
    return translation_json[text] || ''
>>>>>>> aa45f04 (feat: move to solid-js)
  }
}
