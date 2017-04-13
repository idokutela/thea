import { remove } from './dom/domUtils';

export default function simpleComponent({
  attrsToValue,
  valueToString,
  nodeType,
  componentName,
  createNode,
}) {
  function makeComponent(value, render, node = createNode(value)) {
    const children = node ? [node] : [];

    return {
      children() {
        return children;
      },
      firstChild() {
        return children[0];
      },
      lastChild() {
        return children[children.length - 1];
      },
      value() {
        return value;
      },
      toString() {
        return valueToString(value);
      },
      unmount() {
        remove(children[0]);
      },
      render,
    };
  }

  return function render(attrs) {
    const value = attrsToValue(attrs);
    if (this) {
      if (this.value) {
        if (value !== this.value()) {
          if (this.firstChild()) this.firstChild().textContent = value;
          return makeComponent(value, render, this.firstChild());
        }

        return this;
      }
      if (this.nodeType !== nodeType) {
        throw new Error(`${componentName}: cannot mount on node of type ${this.nodeType}.`);
      }
      if (this.textContent !== value) {
        throw new Error(`${componentName}: The text does not match the content of the existing node.`);
      }
      return makeComponent(value, render, this);
    }
    return makeComponent(value, render);
  };
}
