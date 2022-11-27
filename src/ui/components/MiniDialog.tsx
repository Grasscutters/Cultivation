import Close from '../../resources/icons/close.svg'
import './MiniDialog.css'
import {JSX, onCleanup, onMount, Show} from "solid-js";

interface IProps {
  children: JSX.Element
  title?: string
  closeable?: boolean
  closeFn: () => void
}

export default function MiniDialog(props: IProps) {
  function mouseDownHandler(evt: MouseEvent) {
    const tgt = evt.target as HTMLElement
    const isInside = tgt.closest('.MiniDialog') !== null

    if (!isInside) {
      props.closeFn()
    }
  }

  onMount(() => document.addEventListener('mousedown', mouseDownHandler));

  onCleanup(() => document.removeEventListener('mousedown', mouseDownHandler));

  return (
    <div class="MiniDialog" id="miniDialogContainer">
      <Show when={props.closeable !== undefined && props.closeable} keyed={false}>
        <div class="MiniDialogTop" id="miniDialogContainerTop" onClick={props.closeFn}>
          <span>{props?.title}</span>
          <img src={Close} class="MiniDialogClose" id="miniDialogButtonClose" />
        </div>
      </Show>

      <div class="MiniDialogInner" id="miniDialogContent">
        {props.children}
      </div>
    </div>
  )
}
