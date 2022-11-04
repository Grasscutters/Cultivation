import { App } from 'app';
import { render } from 'solid-js/web';
import { DevtoolsOverlay } from '@solid-devtools/overlay';

import './global.css';

render(
  () => (
    <>
      <App />
      <DevtoolsOverlay />
    </>
  ),
  document.getElementById('root')!
);
