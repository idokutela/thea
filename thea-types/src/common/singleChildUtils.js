import { MOUNTED } from '../constants';


export function firstChild() {
  return this[MOUNTED] && this[MOUNTED].node;
}

export function lastChild() {
  return this[MOUNTED] && this[MOUNTED].node;
}

export function children() {
  return this[MOUNTED].node ? [this[MOUNTED].node] : [];
}

export function unmount() {
  this[MOUNTED] &&  // eslint-disable-line
  this[MOUNTED].node &&
  this[MOUNTED].node.parentNode &&
  this[MOUNTED].node.parentNode.removeChild(this[MOUNTED].node);
  this[MOUNTED].node = undefined;
  this[MOUNTED] = undefined;
}

export function isReady() { return Promise.resolve(true); }

export function isMounted() { return !!this[MOUNTED]; }
