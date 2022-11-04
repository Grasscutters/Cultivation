import checkmark from 'resources/icons/check.svg';
import { cc } from 'shared/lib/classcat-extension';
import { callHandlerUnion } from 'shared/lib/jsx';
import type { JSXEvent } from 'shared/lib/utility-types';
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';

import * as styles from './style.css';

interface CheckBoxProps {
  checked: boolean;
  onChange: JSX.EventHandlerUnion<HTMLInputElement, Event>;
  id?: string;
  label?: string;
  noFilter?: true;
}

export function Checkbox(props: CheckBoxProps) {
  const [checked, setChecked] = createSignal(props.checked);

  function handleChange(e: JSXEvent<HTMLInputElement, Event>) {
    setChecked((c) => !c);

    callHandlerUnion(props.onChange, e);
  }

  return (
    <div>
      <input
        class={styles.input}
        type="checkbox"
        id={props.id}
        checked={checked()}
        onChange={handleChange}
      />
      <label class={styles.label} for={props.id}>
        <div class={styles.display}>
          <Show when={checked()} keyed={false}>
            <img
              class={cc(styles.image, props.noFilter && styles.disableFilter)}
              src={checkmark}
              alt="Checkmark"
            />
          </Show>
        </div>
        <Show when={props.label} keyed>
          {(label) => <span>{label}</span>}
        </Show>
      </label>
    </div>
  );
}
