import { firstChild, lastChild, children, unmount, NODE } from '../common/singleChildUtils';
import { insert } from '../dom/domUtils';

export const VALUE = Symbol('value');

export default function simpleComponent({
  attrsToValue,
  valueToString,
  componentName,
  createNode,
  validateNode,
}) {
  const prototype = {
    firstChild,
    lastChild,
    children,
    render, // eslint-disable-line
    toString() { return valueToString(this[VALUE]); },
    unmount,
  };

  function render(attrs) {
    const value = attrsToValue(attrs);

    if (!this || !this.unmount) {
      const result = Object.create(prototype);
      result[VALUE] = value;
      let node = this || createNode(value);

      if (node && !validateNode(node)) {
        if (value.trim()) {
          throw new Error(`Error reviving ${componentName}: incorrect node type found.`);
        }
        // be tolerant, assume the node was removed in minifying
        node = createNode(value);
        insert(node, this);
      }
      if (node && node.textContent !== value) {
        if (node.textContent !== value.trim()) {
          throw new Error(`Error reviving ${componentName}: expected the content ${value} but found ${node.textContent}.`);
        }
        node.textContent = value;
      }
      result[NODE] = node;
      return result;
    }

    if (this[NODE] && value !== this[VALUE]) {
      this[NODE].textContent = value;
    }
    this[VALUE] = value;
    return this;
  }

  return render;
}
