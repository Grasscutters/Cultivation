import { invoke } from '@tauri-apps/api'

export async function patchMetadata() {
  console.log('patching')
  await invoke('patch_metadata', {metadataFolder: 'C:\\Users\\benja\\Desktop'})
}