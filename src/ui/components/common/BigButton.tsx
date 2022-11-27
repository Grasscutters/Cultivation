import cc from 'classcat'
import './BigButton.css'
import {JSX} from "solid-js";

interface IProps {
  children: JSX.Element
  onClick: () => unknown
  id: string
  disabled?: boolean
}

export default function BigButton(props: IProps) {
  function handleClick() {
    if (props.disabled) return

    props.onClick()
  }

  return (
    <div
      class={cc(['BigButton', {
        'disabled': props.disabled
      }])}
      onClick={handleClick}
      id={props.id}
    >
      <div class="BigButtonText">{props.children}</div>
    </div>
  )
}
