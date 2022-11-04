import File from 'resources/icons/folder.svg';
import { TextInput } from 'shared/ui/atoms/text-input';
import { createSignal, onMount } from 'solid-js';
import { translate } from 'utils/language';
import { open } from '@tauri-apps/api/dialog';

import * as styles from './style.css';

interface DirInputProps {
  value?: string;
  clearable?: boolean;
  onInput?: (value: string) => void;
  extensions?: string[];
  readonly?: boolean;
  placeholder?: string;
  folder?: boolean;
  customClearBehaviour?: () => void;
  openFolder?: string;
}

export function DirInput(props: DirInputProps) {
  const [value, setValue] = createSignal(props.value || '');
  const [placeholder, setPlaceholder] = createSignal(
    props.placeholder || 'Select file or folder...'
  );
  const folder = () => props.folder ?? false;

  onMount(async () => {
    const translation = await translate('components.select_file');
    setPlaceholder(translation);
  });

  async function handleIconClick() {
    let path;

    if (folder()) {
      path = await open({
        directory: true,
      });
    } else {
      path = await open({
        filters: [{ name: 'Files', extensions: props.extensions || ['*'] }],
        defaultPath: props.openFolder,
      });
    }

    if (Array.isArray(path)) path = path[0];
    if (!path) return;

    setValue(path);

    props.onInput?.(path);
  }

  return (
    <div class={styles.inputWrapper}>
      <TextInput
        class={styles.input}
        value={value()}
        placeholder={placeholder()}
        clearable={props.clearable ?? true}
        readOnly={props.readonly ?? true}
        onInput={(text: string) => {
          setValue(text);

          props.onInput?.(text);
        }}
        customClearBehaviour={props.customClearBehaviour}
      />
      <div class={styles.icon} onClick={handleIconClick}>
        <img class={styles.iconImg} src={File} />
      </div>
    </div>
  );
}
