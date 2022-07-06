import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import App from './ui/App'
import Debug from './ui/Debug'

import { getConfigOption } from './utils/configuration'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

let isDebug = false;

(async() => {
  isDebug = await getConfigOption('debug_enabled')
})

// Render the app.
root.render(
  <React.StrictMode>
    {
      isDebug ? <Debug /> : <App />
    }
  </React.StrictMode>
)

// Enable web vitals if needed.
import reportWebVitals from './utils/reportWebVitals'
isDebug && reportWebVitals(console.log)

// Setup DOM message passing.
import { parseMessageFromDOM } from './utils/dom'
document.addEventListener<string>('domMessage', parseMessageFromDOM)