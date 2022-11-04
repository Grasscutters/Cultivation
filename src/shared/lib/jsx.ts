import type { JSXEvent } from 'shared/lib/utility-types';
import type { JSX } from 'solid-js';

export function callHandlerUnion<
  Ev extends Event,
  El extends HTMLElement,
  E extends JSXEvent<El, Ev>
>(handler: JSX.EventHandlerUnion<El, E>, ev: E) {
  if (typeof handler === 'function') return handler(ev);

  return handler[0](handler[1], ev);
}
