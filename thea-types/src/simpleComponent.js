import { remove } from './dom/domUtils';

export default function simpleComponent({
  attrsToValue,
  valueToString,
  nodeType,
  componentName,
  createNode,
}) {
  function renderComponent(value, node = createNode(value)) {
    const children = node ? [node] : [];
    return Object.assign(this || {}, {
      children() {
        return children;
      },
      firstChild() {
        return node;
      },
      lastChild() {
        return node;
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
    });
  }

  return function render(attrs) {
    const value = attrsToValue(attrs);
    if (this) {
      if (this.firstChild) {
        if (value !== this.value()) {
          if (this.firstChild()) this.firstChild().textContent = value;
          return renderComponent.call(this, value, this.firstChild());
        }

        return this;
      }
      if (this.nodeType !== nodeType) {
        throw new Error(`${componentName}: cannot mount on node of type ${this.nodeType}.`);
      }
      if (this.textContent !== value) {
        throw new Error(`${componentName}: The text does not match the content of the existing node.`);
      }
      return renderComponent(value, this);
    }
    return renderComponent(value);
  };
}
