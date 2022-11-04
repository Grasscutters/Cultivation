import Close from 'resources/icons/close.svg';
import type { JSXEvent } from 'shared/lib/utility-types';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, Show } from 'solid-js';

import * as styles from './style.css';

interface TextInputProps {
  value?: string;
  initialValue?: string;
  placeholder?: string;
  onInput?: (value: string) => void;
  readOnly?: boolean;
  id?: string;
  clearable?: boolean;
  customClearBehaviour?: () => void;
  style?: JSX.CSSProperties;
  class?: string;
}

export function TextInput(props: TextInputProps) {
  const [value, setValue] = createSignal(props.value || '');

  if (props.initialValue) setValue(props.initialValue);

  createEffect(() => props.value && setValue(props.value));

  function handleInput(e: JSXEvent<HTMLInputElement, Event>) {
    setValue(e.currentTarget.value);

    props.onInput?.(value());
  }

  function customBehaviourHandler() {
    // Run custom behaviour first
    props.customClearBehaviour?.();

    setValue('');

    props.onInput?.('');
  }

  return (
    <div class={props.class} style={props.style}>
      <input
        id={props.id}
        readOnly={props.readOnly ?? false}
        placeholder={props.placeholder ?? ''}
        class={styles.input}
        value={value()}
        onInput={handleInput}
      />

      <Show when={props.clearable} keyed={false}>
        <div class={styles.clear} onClick={customBehaviourHandler}>
          <img src={Close} class={styles.inputClear} />
        </div>
      </Show>
    </div>
  );
}
