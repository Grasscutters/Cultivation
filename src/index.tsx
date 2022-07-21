import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import App from './ui/App'
import Debug from './ui/Debug'

import { getConfigOption } from './utils/configuration'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

let isDebug = false

;async () => {
  isDebug = await getConfigOption('debug_enabled')
}

root.render(<React.StrictMode>{isDebug ? <Debug /> : <App />}</React.StrictMode>)

import reportWebVitals from './utils/reportWebVitals'
isDebug && reportWebVitals(console.log)
