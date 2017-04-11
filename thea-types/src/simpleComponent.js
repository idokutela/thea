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
      get children() {
        return children;
      },
      get firstChild() {
        return this.children[0];
      },
      get lastChild() {
        return this.children[children.length - 1];
      },
      get value() {
        return value;
      },
      toString() {
        return valueToString(value);
      },
      unmount() {
        const parent = this.firstChild && this.firstChild.parentNode;
        if (parent) {
          parent.removeChild(this.firstChild);
        }
      },
      render,
    };
  }

  return function render(attrs) {
    const value = attrsToValue(attrs);
    if (this) {
      if (this.value) {
        if (value !== this.value) {
          if (this.firstChild) this.firstChild.textContent = value;
          return makeComponent(value, render, this.firstChild);
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
