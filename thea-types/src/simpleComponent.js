import { remove } from './dom/domUtils';

const VALUE = Symbol('value');

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
      [VALUE]: value,
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
        return this[VALUE];
      },
      toString() {
        return valueToString(this[VALUE]);
      },
      unmount() {
        remove(children[0]);
      },
      render: renderComponent,
    });
  }

  return function render(attrs) {
    const value = attrsToValue(attrs);
    if (this) {
      if (this.unmount) {
        if (value !== this.value()) {
          if (this.firstChild()) this.firstChild().textContent = value;
          this[VALUE] = value;
          return this;
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
