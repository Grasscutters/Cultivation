<<<<<<< HEAD
import { JSX } from 'solid-js';

import Close from '../../../resources/icons/close.svg';

import './Menu.css';

interface IProps {
  children: JSX.Element;
  class?: string;
  heading: string;
  closeFn: () => void;
=======
import './Menu.css'

import Close from '../../../resources/icons/close.svg'
import {JSX} from "solid-js";

interface IProps {
  children: JSX.Element
  class?: string
  heading: string
  closeFn: () => void
>>>>>>> aa45f04 (feat: move to solid-js)
}

export default function Menu(props: IProps) {
  return (
    <div class={'Menu ' + props.class} id="menuContainer">
      <div class="MenuTop" id="menuContainerTop">
        <div class="MenuHeading" id="menuHeading">
          {props.heading}
        </div>
<<<<<<< HEAD
        <div
          class="MenuExit"
          id="menuButtonCloseContainer"
          onClick={props.closeFn}>
=======
        <div class="MenuExit" id="menuButtonCloseContainer" onClick={props.closeFn}>
>>>>>>> aa45f04 (feat: move to solid-js)
          <img src={Close} class="MenuClose" id="menuButtonCloseIcon" />
        </div>
      </div>
      <div class="MenuInner" id="menuContent">
        {props.children}
      </div>
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> aa45f04 (feat: move to solid-js)
}
