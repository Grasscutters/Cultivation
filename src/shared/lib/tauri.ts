/**
 * This is an entry point for tauri api module augmentation.
 *
 * It works by providing a correct type based on the string argument
 * that the module layer has provided.
 *
 * e.g.: src/features/download/lib/types.ts:
 *
 * declare module 'shared/lib/tauri' {
 *   export interface EventMap {
 *     download_progress: {
 *       downloaded: string;
 *       total: string;
 *       path: string;
 *       total_downloaded: string;
 *     };
 *     download_finished: string;
 *     download_error: {
 *       path: string;
 *       error: string;
 *     };
 *     extract_start: string;
 *     extract_end: {
 *       file: string;
 *       new_folder: string;
 *     };
 *   }
 * }
 */

import type { EventCallback, UnlistenFn } from '@tauri-apps/api/event';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventMap {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InvokeMap {}

declare module '@tauri-apps/api/event' {
  export function listen<T extends keyof EventMap>(
    event: T,
    handler: EventCallback<EventMap[T]>
  ): Promise<UnlistenFn>;
  export function listen(event: string, handler: EventCallback<unknown>): never;
}

declare module '@tauri-apps/api/tauri' {
  export function invoke<T extends keyof InvokeMap>(
    cmd: T,
    args?: InvokeMap[T]['args']
  ): Promise<InvokeMap[T]['return']>;
  export function invoke(cmd: string, args?: any): Promise<never>;
}
