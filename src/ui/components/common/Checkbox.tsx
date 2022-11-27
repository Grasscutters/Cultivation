<<<<<<< HEAD
import { createEffect, createSignal, Show } from 'solid-js';

import checkmark from '../../../resources/icons/check.svg';

import './Checkbox.css';
=======
import checkmark from '../../../resources/icons/check.svg'

import './Checkbox.css'
import {createEffect, createSignal, Show} from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

interface IProps {
  label?: string;
  checked: boolean;
  onChange: () => void;
  id?: string;
}

<<<<<<< HEAD
=======

>>>>>>> aa45f04 (feat: move to solid-js)
export default function Checkbox(props: IProps) {
  const [checked, setChecked] = createSignal(props.checked);

  createEffect(() => {
<<<<<<< HEAD
    if (props.checked !== checked()) setChecked(props.checked);
=======
    if (props.checked !== checked()) setChecked(props.checked)
>>>>>>> aa45f04 (feat: move to solid-js)
  });

  function handleChange() {
    setChecked((c) => !c);
<<<<<<< HEAD
    props.onChange();
=======
    props.onChange()
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  return (
    <div class="Checkbox">
<<<<<<< HEAD
      <input
        type="checkbox"
        id={props.id}
        checked={checked()}
        onChange={handleChange}
      />
=======
      <input type="checkbox" id={props.id} checked={checked()} onChange={handleChange} />
>>>>>>> aa45f04 (feat: move to solid-js)
      <label for={props.id}>
        <div class="CheckboxDisplay">
          <Show when={checked()} keyed={false}>
            <img src={checkmark} alt="Checkmark" />
          </Show>
        </div>
        <span>{props.label || ''}</span>
      </label>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
