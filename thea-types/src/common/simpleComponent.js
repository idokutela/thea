import { firstChild, lastChild, children, unmount, isReady, isMounted } from '../common/singleChildUtils';
import { insert } from '../dom/domUtils';
import { MOUNTED, DEBUG } from '../constants';

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
    toString() { return valueToString(this[MOUNTED].value); },
    isReady,
    isMounted,
    unmount,
  };

  function render(attrs, context) {
    const value = attrsToValue(attrs);

    if (!this || !this[MOUNTED]) {
      const result = Object.create(prototype);
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

      result[MOUNTED] = {
        value,
        node,
      };

      if (process.env.node_env !== 'production') {
        result[DEBUG] = {
          attrs,
          context,
        };
      }
      return result;
    }

    if (this[MOUNTED].node && value !== this[MOUNTED].value) {
      this[MOUNTED].node.textContent = value;
    }
    this[MOUNTED].value = value;
    if (process.env.node_env !== 'production') {
      this[DEBUG].attrs = attrs;
      this[DEBUG].context = context;
    }
    return this;
  }

  return render;
}
