<<<<<<< HEAD
import { createSignal, For } from 'solid-js';

import './ModHeader.css';
=======
import './ModHeader.css'
import {createSignal, For} from "solid-js";
>>>>>>> aa45f04 (feat: move to solid-js)

interface IProps {
  headers: {
    title: string;
    name: string;
  }[];
  onChange: (value: string) => void;
  defaultHeader: string;
}

export function ModHeader(props: IProps) {
  const [selected, setSelected] = createSignal(props.defaultHeader);

  function setSelection(selection: string) {
    setSelected(selection);

    props.onChange(selection);
  }

  return (
    <div class="ModHeader">
      <For each={props.headers}>
        {(header) => (
          <div
<<<<<<< HEAD
            class={`ModHeaderTitle ${
              selected() === header.name ? 'selected' : ''
            }`}
            onClick={() => setSelection(header.name)}>
=======
            class={`ModHeaderTitle ${selected() === header.name ? 'selected' : ''}`}
            onClick={() => setSelection(header.name)}
          >
>>>>>>> aa45f04 (feat: move to solid-js)
            {header.title}
          </div>
        )}
      </For>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
