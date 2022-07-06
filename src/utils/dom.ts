import { setConfigOption } from './configuration'

interface DOMMessage {
  type: string
  data: ConfigUpdate
}

interface ConfigUpdate {
  setting: string
  value: any
}

/**
 * Parses a message received from the DOM.
 * @param document The document.
 * @param msg The message received from the DOM.
 */
export function parseMessageFromDOM(document: Document, msg: any): void {
  msg = msg.detail
  
  if(!msg || !msg.type || !msg.data)
    return
  
  switch(msg.type) {
  case 'updateConfig':
    if(!msg.data.setting || !msg.data.value)
      return
    setConfigOption(msg.data.setting, msg.data.value)
    return
  }
}