import { TRANSPARENT } from './constants';
import emptyElement from './emptyElement';
import flatten from './util/flatten';
import { insertAll } from './dom/domUtils';

const CHILD_COMPONENTS = Symbol('child components');
const EMPTY = Symbol('empty');

function render(attrs, context) {
  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(attrs)) {
      throw new Error('TheaUnkeyedChildren: Expected an array of children.');
    }
  }

  function updateState(childComponents, empty) {
    const result = this || {
      childComponents() { return this[CHILD_COMPONENTS]; },
      empty() { return this[EMPTY]; },
      firstChild() {
        return this[EMPTY] ? this[EMPTY].firstChild() :
          this[CHILD_COMPONENTS][0].firstChild();
      },
      lastChild() {
        return this[EMPTY] ? this[EMPTY].lastChild() :
          this[CHILD_COMPONENTS][this[CHILD_COMPONENTS].length - 1].lastChild();
      },
      children() {
        return this[EMPTY] ? this[EMPTY].children() :
          flatten(this[CHILD_COMPONENTS].map(c => c.children()));
      },
      toString() {
        return this[EMPTY] ? this[EMPTY].toString() :
          this[CHILD_COMPONENTS].reduce((r, c) => r + c.toString(), '');
      },
      unmount() {
        if (this[EMPTY]) {
          return this[EMPTY].unmount();
        }
        this[CHILD_COMPONENTS].forEach(c => c.unmount());
        return undefined;
      },
      render,
    };

    result[CHILD_COMPONENTS] = childComponents;
    result[EMPTY] = empty;
    return result;
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

  if (!attrs.length === !this.empty()) {
    const result = render(attrs, context);
    insertAll(result.children(), this.firstChild());
    this.unmount();
    return updateState.call(this, result.childComponents(), result.empty());
  }
  if (this.empty()) {
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
  const nextSibling = this.lastChild() && this.lastChild().nextSibling;
  const parent = this.lastChild() && this.lastChild().parentNode;
  childComponents = updateingAttrs.map(updateChild);
  const newComponents = toAdd.map(([r, a]) => r(a, context));
  const newNodes = newComponents.reduce((r, x) => r.concat([...x.children()]), []);
  parent && insertAll(newNodes, nextSibling, parent); // eslint-disable-line
  return updateState.call(this, childComponents.concat(newComponents));
}

render[TRANSPARENT] = true;

export default render;
