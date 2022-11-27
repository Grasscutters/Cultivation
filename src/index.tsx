<<<<<<< HEAD
import { Show } from 'solid-js';
import { render } from 'solid-js/web';
import { attachDevtoolsOverlay } from '@solid-devtools/overlay';

import App from './ui/App';
import Debug from './ui/Debug';
import { getConfigOption } from './utils/configuration';
import reportWebVitals from './utils/reportWebVitals';
=======
import './index.css'
import App from './ui/App'
import Debug from './ui/Debug'
import { Show } from "solid-js";
import { render } from "solid-js/web";
import { attachDevtoolsOverlay } from '@solid-devtools/overlay'

attachDevtoolsOverlay({})
>>>>>>> aa45f04 (feat: move to solid-js)

import './index.css';

<<<<<<< HEAD
attachDevtoolsOverlay({});
=======
const root = document.getElementById('root') as HTMLElement;
>>>>>>> aa45f04 (feat: move to solid-js)

const root = document.getElementById('root') as HTMLElement;

<<<<<<< HEAD
let isDebug = false;

(async () => {
  isDebug = await getConfigOption('debug_enabled');
})();
=======
;async () => {
  isDebug = await getConfigOption('debug_enabled')
}

render(() => (
  <Show when={isDebug} keyed={false} fallback={<App />}>
    <Debug />
  </Show>
), root)
>>>>>>> aa45f04 (feat: move to solid-js)

render(
  () => (
    <Show when={isDebug} keyed={false} fallback={<App />}>
      <Debug />
    </Show>
  ),
  root
);

isDebug && reportWebVitals(console.log);
