import { firstChild, lastChild, children, unmount, isReady, isMounted } from './common/singleChildUtils';
import { COMMENT, MOUNTED } from './constants';
import isInBrowser from './dom/isInBrowser';
import { insert } from './dom/domUtils';

const placeholderContent = '%%';

const placeholder = isInBrowser ?
  () => document.createComment(placeholderContent) :
  () => {};

const prototype = {
  firstChild,
  lastChild,
  children,
  unmount,
  toString() { return `<!--${placeholderContent}-->`; },
  render: EmptyElement, // eslint-disable-line
  isReady,
  isMounted,
};

export default function EmptyElement() {
  if (this && this[MOUNTED]) { return this; }

  let node = this || placeholder();

  // Be tolerant: if its not a comment, maybe it was meant to be one
  /* eslint-disable no-console */
  if (node && node.nodeType !== COMMENT) {
    node = placeholder();
    if (process.env.node_env !== 'production') {
      console.warn(`Expected to find a placeholder comment but found ${this}.`);
    }
    insert(node, this);
  }

  // And if its text content is wrong and we're in dev, warn and fix. Otherwise ignore.
  if (process.env.node_env !== 'production') {
    if (node && node.textContent !== placeholderContent) {
      console.warn(`The placeholder comment text should be ${placeholderContent} but was ${node.textContent}.`);
      node.textContent = placeholderContent;
    }
  }
  /* eslint-enable no-console */

  const result = Object.create(prototype);
  result[MOUNTED] = { node };
  return result;
}
