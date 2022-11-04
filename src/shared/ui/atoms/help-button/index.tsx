import Help from 'resources/icons/help.svg';
import { useEnrichedI18n } from 'shared/lib/i18n';
import type { JSXElement } from 'solid-js';
import { getOwner, runWithOwner } from 'solid-js';

import * as styles from './style.css';

interface HelpButtonProps {
  children?: JSXElement;
  contents?: string;
  id?: string;
}

export function HelpButton(props: HelpButtonProps) {
  const [t] = useEnrichedI18n();
  const owner = getOwner();

  function showAlert() {
    if (props.contents)
      runWithOwner(owner!, () => {
        alert(t(props.contents ?? ''));
      });
  }

  return (
    <section class={styles.section}>
      <button class={styles.button} onClick={showAlert}>
        <img class={styles.image} src={Help} />
      </button>
    </section>
  );
}
