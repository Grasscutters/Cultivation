import {DOMElement} from "solid-js/jsx-runtime";

export type JSXEvent<T, E extends Event> = E & {
  currentTarget: T;
  target: DOMElement;
}