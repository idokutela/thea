import { TRANSPARENT } from './constants';
import flatten from './util/flatten';

function render(attrs = [], context) {
  function renderComponent(childComponents) {
    return Object.assign(this || {}, {
      firstChild() {
        return childComponents[0].firstChild();
      },
      lastChild() {
        return childComponents[childComponents.length - 1].lastChild();
      },
      children() {
        return flatten(childComponents.map(c => c.children()));
      },
      toString() {
        return childComponents.reduce((r, c) => r + c.toString(), '');
      },
      unmount() {
        childComponents.forEach(c => c.unmount());
      },
      childComponents() { return childComponents; },
      render,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(attrs)) {
      throw new TypeError('TheaView: Expected an array of children.');
    }
    if (!attrs.length) {
      throw new Error('TheaView: a view must have children.');
    }
    if (!Array.isArray(attrs[0])) {
      throw new TypeError('TheaView: Expected an array of children.');
    }
  }

  let childComponents;

  if (!this) {
    childComponents = attrs.map(([r, a]) => r(a, context));
    return renderComponent(childComponents);
  }

  if (!this.unmount) {
    childComponents = attrs.reduce((c, [r, a]) => {
      const next = c.length ? c[c.length - 1].lastChild().nextSibling : this;
      c.push(r.call(next, a, context));
      return c;
    }, []);
    return renderComponent(childComponents);
  }

  const currentComponents = this.childComponents();

  if (process.env.NODE_ENV !== 'production') {
    if (attrs.length !== currentComponents.length) {
      throw new Error('The child types do not match up. Views must have a consistent structure.');
    }
  }

  function updateChild([r, a], i) {
    return r.call(currentComponents[i], a, context);
  }

  childComponents = attrs.map(updateChild);
  return renderComponent.call(this, childComponents);
}

render[TRANSPARENT] = true;

export default render;
