import { TRANSPARENT } from './constants';
import { emptyElement } from './emptyElement';
import flatten from './util/flatten';
import { insertAll } from './dom/domUtils';

function render(attrs, context) {
  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(attrs)) {
      throw new Error('TheaUnkeyedChildren: Expected an array of children.');
    }
  }

  function updateState(childComponents, empty) {
    return Object.assign(this || {}, {
      childComponents() { return childComponents; },
      empty() { return empty; },
      firstChild() {
        return empty ? empty.firstChild() :
          childComponents[0].firstChild();
      },
      lastChild() {
        return empty ? empty.lastChild() :
          childComponents[childComponents.length - 1].lastChild();
      },
      children() {
        return empty ? empty.children() :
          flatten(childComponents.map(c => c.children()));
      },
      toString() {
        return empty ? empty.toString() :
          childComponents.reduce((r, c) => r + c.toString(), '');
      },
      unmount() {
        if (empty) {
          return emptyElement.unmount();
        }
        childComponents.forEach(c => c.unmount());
        return undefined;
      },
      render,
    });
  }

  let childComponents;
  if (!this) {
    if (attrs.length) {
      childComponents = attrs.map(([r, a]) => r(a, context));
      return updateState(childComponents);
    }
    return updateState([], emptyElement());
  }

  if (!this.unmount) {
    if (attrs.length) {
      childComponents = attrs.reduce((c, [r, a]) => {
        const next = c.length ? c[c.length - 1].nextSibling : this;
        c.push(r.call(next, a, context));
        return c;
      }, []);
      return updateState(childComponents);
    }
    return updateState([], emptyElement.call(this));
  }

  if (!attrs.length !== !this.empty) {
    const result = render(attrs, context);
    insertAll(result.children(), this.firstChild());
    this.unmount();
    return updateState.call(this, result.childComponents(), result.empty());
  }
  if (this.empty) {
    return this;
  }

  const currentChildren = this.childComponents();
  let toUpdate;

  function updateChild([r, a], i) {
    const child = toUpdate[i];
    if (process.env.NODE_ENV !== 'production') {
      if (child.render !== r) {
        throw new Error('The child types functions differ in update!');
      }
    }
    return r.call(child, a, context);
  }

  if (attrs.length <= currentChildren.length) {
    toUpdate = currentChildren.slice(0, attrs.length);
    const toRemove = currentChildren.slice(attrs.length);
    childComponents = attrs.map(updateChild);
    toRemove.forEach(c => c.unmount());
    return updateState.call(this, childComponents);
  }

  toUpdate = currentChildren;
  const updateingAttrs = attrs.slice(0, currentChildren.length);
  const toAdd = attrs.slice(currentChildren.length);
  const nextSibling = this.lastChild().nextSibling;
  const parent = this.lastChild().parentNode;
  childComponents = updateingAttrs.map(updateChild);
  const newComponents = toAdd.map(([r, a]) => r(a, context));
  insertAll(newComponents.map(x => x.children()), nextSibling, parent);
  return updateState.call(this, childComponents.concat(newComponents));
}

render[TRANSPARENT] = true;

export default render;
