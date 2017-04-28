import { remove } from '../dom/domUtils';

export const NODE = Symbol('thea/node');

export function firstChild() {
  return this[NODE];
}

export function lastChild() {
  return this[NODE];
}

export function children() {
  return this[NODE] ? [this[NODE]] : [];
}

export function unmount() {
  remove(this[NODE]);
}
