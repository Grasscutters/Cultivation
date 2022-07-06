/**
 * Passes a message through to the React backend.
 * @param type The message type.
 * @param data The message data.
 */
function passthrough(type, data) {
  document.dispatchEvent(new CustomEvent('domMessage', {
    type, msg: data
  }))
}

function setConfigValue(key, value) {
  passthrough('updateConfig', {setting: key, value})
}