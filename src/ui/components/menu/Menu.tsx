import { JSX } from 'solid-js';

import Close from '../../../resources/icons/close.svg';

import './Menu.css';

interface IProps {
  children: JSX.Element;
  class?: string;
  heading: string;
  closeFn: () => void;
}

export default function Menu(props: IProps) {
  return (
    <div class={'Menu ' + props.class} id="menuContainer">
      <div class="MenuTop" id="menuContainerTop">
        <div class="MenuHeading" id="menuHeading">
          {props.heading}
        </div>
        <div
          class="MenuExit"
          id="menuButtonCloseContainer"
          onClick={props.closeFn}>
          <img src={Close} class="MenuClose" id="menuButtonCloseIcon" />
        </div>
      </div>
      <div class="MenuInner" id="menuContent">
        {props.children}
      </div>
    </div>
  );
}
