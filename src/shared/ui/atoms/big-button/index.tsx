import cc from 'classcat';
import { callHandlerUnion } from 'shared/lib/jsx';
import type { JSXEvent } from 'shared/lib/utility-types';
import { type JSX, type JSXElement, createMemo } from 'solid-js';

import * as styles from './style.css';

interface BigButtonProps {
  children: JSXElement;
  onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  id: string;
  disabled?: boolean;
}

export function BigButton(props: BigButtonProps) {
  function handleClick(e: JSXEvent<HTMLButtonElement, MouseEvent>) {
    if (props.disabled) return;

    callHandlerUnion(props.onClick, e);
  }

  const classes = createMemo(() =>
    cc([styles.bigButton, props.disabled && styles.disabled])
  );

  return (
    <button class={classes()} onClick={handleClick} id={props.id}>
      <div class={styles.bigButtonText}>{props.children}</div>
    </button>
  );
}
