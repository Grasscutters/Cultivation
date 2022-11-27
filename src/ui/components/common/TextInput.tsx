<<<<<<< HEAD
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
=======
import './TextInput.css'
import Close from '../../../resources/icons/close.svg'
import { createSignal, JSX, onMount, Show } from "solid-js";

interface IProps {
  value?: string
  initalValue?: string
  placeholder?: string
  onChange?: (value: string) => void
  readOnly?: boolean
  id?: string
  clearable?: boolean
  customClearBehaviour?: () => void
  style?: JSX.CSSProperties
>>>>>>> aa45f04 (feat: move to solid-js)
}

export default function TextInput(props: IProps) {
  const [value, setValue] = createSignal(props.value || '');

  onMount(() => {
<<<<<<< HEAD
    if (props.initalValue) setValue(props.initalValue);
=======
    if (props.initalValue) setValue(props.initalValue)
>>>>>>> aa45f04 (feat: move to solid-js)
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
<<<<<<< HEAD
          if (props.onChange) props.onChange(e.currentTarget.value);
=======
          if (props.onChange) props.onChange(e.currentTarget.value)
>>>>>>> aa45f04 (feat: move to solid-js)
        }}
      />
      <Show when={props.clearable} keyed={false}>
        <div
          class="TextClear"
          onClick={() => {
            // Run custom behaviour first
<<<<<<< HEAD
            if (props.customClearBehaviour) return props.customClearBehaviour();

            setValue('');

            if (props.onChange) props.onChange('');
          }}>
=======
            if (props.customClearBehaviour) return props.customClearBehaviour()

            setValue('');

            if (props.onChange) props.onChange('')
          }}
        >
>>>>>>> aa45f04 (feat: move to solid-js)
          <img src={Close} class="TextInputClear" />
        </div>
      </Show>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
