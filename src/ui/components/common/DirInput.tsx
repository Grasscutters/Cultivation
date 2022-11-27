<<<<<<< HEAD
import { createEffect, createSignal, onMount } from 'solid-js';
import { open } from '@tauri-apps/api/dialog';

import File from '../../../resources/icons/folder.svg';
import { translate } from '../../../utils/language';
import TextInput from './TextInput';

import './DirInput.css';
=======
import { open } from '@tauri-apps/api/dialog'
import { translate } from '../../../utils/language'
import TextInput from './TextInput'
import File from '../../../resources/icons/folder.svg'

import './DirInput.css'
import {createEffect, createSignal, onMount} from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

interface IProps {
  value?: string;
  clearable?: boolean;
  onChange?: (value: string) => void;
  extensions?: string[];
  readonly?: boolean;
  placeholder?: string;
  folder?: boolean;
  customClearBehaviour?: () => void;
  openFolder?: string;
}

export default function DirInput(props: IProps) {
  const [value, setValue] = createSignal(props.value);
  const [placeholder, setPlaceholder] = createSignal(
    props.placeholder || 'Select file or folder...'
  );
  const [folder, _setFolder] = createSignal(props.folder || false);

<<<<<<< HEAD
  createEffect(() => {
    if (props.value && value() === '') setValue(props.value || '');
  });

  createEffect(() => {
    if (props.placeholder) setPlaceholder(props.placeholder);
  });

  onMount(async () => {
    if (!props.placeholder) {
      const translation = await translate('components.select_file');
      setPlaceholder(translation);
    }
  });

  async function handleIconClick() {
    let path;

=======
export default function DirInput(props: IProps) {
  const [value, setValue] = createSignal(props.value);
  const [placeholder, setPlaceholder] = createSignal(props.placeholder || 'Select file or folder...');
  const [folder, setFolder] = createSignal(props.folder || false);

  createEffect(() => {
    if (props.value && value() === '') setValue(props.value || '');
  });

  createEffect(() => {
    if (props.placeholder) setPlaceholder(props.placeholder)
  });

  onMount(async () => {
    if (!props.placeholder) {
      const translation = await translate('components.select_file')
      setPlaceholder(translation)
    }
  });

  async function handleIconClick() {
    let path

>>>>>>> aa45f04 (feat: move to solid-js)
    if (folder()) {
      path = await open({
        directory: true,
      });
    } else {
      path = await open({
        filters: [{ name: 'Files', extensions: props.extensions || ['*'] }],
        defaultPath: props.openFolder,
<<<<<<< HEAD
      });
=======
      })
>>>>>>> aa45f04 (feat: move to solid-js)
    }

    if (Array.isArray(path)) path = path[0];
    if (!path) return;

<<<<<<< HEAD
    setValue(path);

    if (props.onChange) props.onChange(path);
=======
    setValue(path)

    if (props.onChange) props.onChange(path)
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  return (
    <div class="DirInput">
      <TextInput
        value={value()}
        placeholder={placeholder()}
        clearable={props.clearable !== undefined ? props.clearable : true}
        readOnly={props.readonly !== undefined ? props.readonly : true}
        onChange={(text: string) => {
<<<<<<< HEAD
          setValue(text);

          props.onChange?.(text);
=======
          setValue(text)

          props.onChange?.(text)
>>>>>>> aa45f04 (feat: move to solid-js)
        }}
        customClearBehaviour={props.customClearBehaviour}
      />
      <div class="FileSelectIcon" onClick={handleIconClick}>
        <img src={File} />
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
