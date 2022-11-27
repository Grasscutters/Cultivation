<<<<<<< HEAD
import { JSX, onCleanup, onMount, Show } from 'solid-js';

import Close from '../../resources/icons/close.svg';

import './MiniDialog.css';

interface IProps {
  children: JSX.Element;
  title?: string;
  closeable?: boolean;
  closeFn: () => void;
=======
import Close from '../../resources/icons/close.svg'
import './MiniDialog.css'
import {JSX, onCleanup, onMount, Show} from "solid-js";

interface IProps {
  children: JSX.Element
  title?: string
  closeable?: boolean
  closeFn: () => void
>>>>>>> aa45f04 (feat: move to solid-js)
}

export default function MiniDialog(props: IProps) {
  function mouseDownHandler(evt: MouseEvent) {
<<<<<<< HEAD
    const tgt = evt.target as HTMLElement;
    const isInside = tgt.closest('.MiniDialog') !== null;

    if (!isInside) {
      props.closeFn();
=======
    const tgt = evt.target as HTMLElement
    const isInside = tgt.closest('.MiniDialog') !== null

    if (!isInside) {
      props.closeFn()
>>>>>>> aa45f04 (feat: move to solid-js)
    }
  }

  onMount(() => document.addEventListener('mousedown', mouseDownHandler));

  onCleanup(() => document.removeEventListener('mousedown', mouseDownHandler));

  return (
    <div class="MiniDialog" id="miniDialogContainer">
<<<<<<< HEAD
      <Show
        when={props.closeable !== undefined && props.closeable}
        keyed={false}>
        <div
          class="MiniDialogTop"
          id="miniDialogContainerTop"
          onClick={props.closeFn}>
=======
      <Show when={props.closeable !== undefined && props.closeable} keyed={false}>
        <div class="MiniDialogTop" id="miniDialogContainerTop" onClick={props.closeFn}>
>>>>>>> aa45f04 (feat: move to solid-js)
          <span>{props?.title}</span>
          <img src={Close} class="MiniDialogClose" id="miniDialogButtonClose" />
        </div>
      </Show>

      <div class="MiniDialogInner" id="miniDialogContent">
        {props.children}
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
