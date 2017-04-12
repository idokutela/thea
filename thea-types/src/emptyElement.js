import { remove } from './domUtils';
import { COMMENT } from './constants';

const placeholderContent = '--P--';
const placeholder = () => (document ? document.createComment(placeholderContent) : undefined);

export default function render() {
  if (this.firstChild) { return this; }

  const node = this || placeholder();

  if (process.env.NODE_ENV !== 'production') {
    if (node && node.nodeType !== COMMENT) {
      throw new Error('Expected a comment node as placeholder.');
    }
    if (node.textContent !== placeholderContent) {
      throw new Error('Unexpected content in placeholder.');
    }
  }

  return {
    firstChild() { return node; },
    lastChild() { return node; },
    children() { return [node]; },
    toString() { return ''; },
    unmount() { remove(node); },
    render,
  };
}
