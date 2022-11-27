import { createSignal, JSX, onMount, Show } from 'solid-js';

import Close from '../../../resources/icons/close.svg';

import './TextInput.css';

interface IProps {
  value?: string;
  initalValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  id?: string;
  clearable?: boolean;
  customClearBehaviour?: () => void;
  style?: JSX.CSSProperties;
}

export default function TextInput(props: IProps) {
  const [value, setValue] = createSignal(props.value || '');

  onMount(() => {
    if (props.initalValue) setValue(props.initalValue);
  });

  return (
    <div class="TextInputWrapper" style={props.style || {}}>
      <input
        id={props?.id}
        readOnly={props.readOnly || false}
        placeholder={props.placeholder || ''}
        class="TextInput"
        value={value()}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          if (props.onChange) props.onChange(e.currentTarget.value);
        }}
      />
      <Show when={props.clearable} keyed={false}>
        <div
          class="TextClear"
          onClick={() => {
            // Run custom behaviour first
            if (props.customClearBehaviour) return props.customClearBehaviour();

            setValue('');

            if (props.onChange) props.onChange('');
          }}>
          <img src={Close} class="TextInputClear" />
        </div>
      </Show>
    </div>
  );
}
