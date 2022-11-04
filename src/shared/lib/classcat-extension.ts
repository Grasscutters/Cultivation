import type { Class } from 'classcat';
import ccOrig from 'classcat';

export function cc(...names: Class[]): string {
  return ccOrig(names);
}
