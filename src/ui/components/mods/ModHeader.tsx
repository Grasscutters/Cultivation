import { createSignal, For } from 'solid-js';

import './ModHeader.css';

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
            class={`ModHeaderTitle ${
              selected() === header.name ? 'selected' : ''
            }`}
            onClick={() => setSelection(header.name)}>
            {header.title}
          </div>
        )}
      </For>
    </div>
  );
}
