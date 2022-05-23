export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function byteToString(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10)
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export function base64Decode(str: string) {
  return Buffer.from(str, 'base64').toString('utf8')
}