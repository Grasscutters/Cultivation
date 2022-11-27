import './index.css'
import App from './ui/App'
import Debug from './ui/Debug'
import { Show } from "solid-js";
import { render } from "solid-js/web";
import { attachDevtoolsOverlay } from '@solid-devtools/overlay'

attachDevtoolsOverlay({})

import { getConfigOption } from './utils/configuration'

const root = document.getElementById('root') as HTMLElement;

let isDebug = false

;async () => {
  isDebug = await getConfigOption('debug_enabled')
}

render(() => (
  <Show when={isDebug} keyed={false} fallback={<App />}>
    <Debug />
  </Show>
), root)

import reportWebVitals from './utils/reportWebVitals'
isDebug && reportWebVitals(console.log)
