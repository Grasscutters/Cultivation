import type { EventCallback, UnlistenFn } from '@tauri-apps/api/event';

// used for module augmentation
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventMap {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InvokeMap {}

declare module '@tauri-apps/api/event' {
  export function listen<T extends keyof EventMap>(
    event: T,
    handler: EventCallback<EventMap[T]>
  ): Promise<UnlistenFn>;
}

declare module '@tauri-apps/api/tauri' {
  export function invoke<T extends keyof InvokeMap>(
    cmd: T,
    args?: InvokeMap[T]['args']
  ): Promise<InvokeMap[T]['return']>;
}
