import { createEffect, createSignal, Show } from 'solid-js';

import checkmark from '../../../resources/icons/check.svg';

import './Checkbox.css';

interface IProps {
  label?: string;
  checked: boolean;
  onChange: () => void;
  id?: string;
}

export default function Checkbox(props: IProps) {
  const [checked, setChecked] = createSignal(props.checked);

  createEffect(() => {
    if (props.checked !== checked()) setChecked(props.checked);
  });

  function handleChange() {
    setChecked((c) => !c);
    props.onChange();
  }

  return (
    <div class="Checkbox">
      <input
        type="checkbox"
        id={props.id}
        checked={checked()}
        onChange={handleChange}
      />
      <label for={props.id}>
        <div class="CheckboxDisplay">
          <Show when={checked()} keyed={false}>
            <img src={checkmark} alt="Checkmark" />
          </Show>
        </div>
        <span>{props.label || ''}</span>
      </label>
    </div>
  );
}
