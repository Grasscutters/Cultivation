import { invoke } from '@tauri-apps/api'
// Patch file from: https://github.com/34736384/RSAPatch/

export async function patchGame(newerGame: boolean, version: string) {
  return invoke('patch_game', { newerGame, version })
}

export async function unpatchGame() {
  return invoke('unpatch_game')
}
