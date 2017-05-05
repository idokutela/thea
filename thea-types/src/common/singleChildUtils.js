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
  this[NODE] && this[NODE].parentNode && this[NODE].parentNode.removeChild(this[NODE]); // eslint-disable-line
}
