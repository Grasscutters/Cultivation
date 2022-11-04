import Close from 'resources/icons/close.svg';
import { cc } from 'shared/lib/classcat-extension';
import type { JSXElement } from 'solid-js';

import * as styles from 'shared/ui/layouts/menu/style.css';

type MenuProps = {
  children: JSXElement;
  heading: string;
  closeFn: () => void | Promise<void>;
  class?: string;
};

export function MenuLayout(props: MenuProps) {
  return (
    <div class={cc(styles.menu, props.class)} id="menuContainer">
      <div class={styles.menuTop} id="menuContainerTop">
        <div class={styles.menuHeading} id="menuHeading">
          {props.heading}
        </div>

        <div
          class={styles.menuExit}
          id="menuButtonCloseContainer"
          onClick={props.closeFn}>
          <img src={Close} id="menuButtonCloseIcon" />
        </div>
      </div>

      <div class={styles.menuInner} id="menuContent">
        {props.children}
      </div>
    </div>
  );
}
