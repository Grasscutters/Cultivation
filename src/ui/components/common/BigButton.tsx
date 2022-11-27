<<<<<<< HEAD
import { JSX } from 'solid-js';
import cc from 'classcat';

import './BigButton.css';

interface IProps {
  children: JSX.Element;
  onClick: () => unknown;
  id: string;
  disabled?: boolean;
=======
import cc from 'classcat'
import './BigButton.css'
import {JSX} from "solid-js";

interface IProps {
  children: JSX.Element
  onClick: () => unknown
  id: string
  disabled?: boolean
>>>>>>> aa45f04 (feat: move to solid-js)
}

export default function BigButton(props: IProps) {
  function handleClick() {
<<<<<<< HEAD
    if (props.disabled) return;

    props.onClick();
=======
    if (props.disabled) return

    props.onClick()
>>>>>>> aa45f04 (feat: move to solid-js)
  }

  return (
    <div
<<<<<<< HEAD
      class={cc([
        'BigButton',
        {
          disabled: props.disabled,
        },
      ])}
      onClick={handleClick}
      id={props.id}>
      <div class="BigButtonText">{props.children}</div>
    </div>
  );
=======
      class={cc(['BigButton', {
        'disabled': props.disabled
      }])}
      onClick={handleClick}
      id={props.id}
    >
      <div class="BigButtonText">{props.children}</div>
    </div>
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
