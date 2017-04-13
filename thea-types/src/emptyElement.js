import { remove } from './domUtils';
import { COMMENT } from './constants';

const placeholderContent = '%%';
let placeholder = () => (document ?
  document.createComment(placeholderContent) : undefined);

if (typeof window === 'undefined') {
  placeholder = () => undefined;
}

export default function render() {
  if (this && this.firstChild) { return this; }

  const node = this || placeholder();
  const children = node ? [node] : [];

  if (process.env.NODE_ENV !== 'production') {
    if (node && node.nodeType !== COMMENT) {
      throw new Error('Expected a comment node as placeholder.');
    }
    if (node && node.textContent !== placeholderContent) {
      throw new Error('Unexpected content in placeholder.');
    }
  }

  return {
    firstChild() { return node; },
    lastChild() { return node; },
    children() { return children; },
    toString() { return `<!--${placeholderContent}-->`; },
    unmount() { remove(node); },
    render,
  };
}
