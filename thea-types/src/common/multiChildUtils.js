import forEach from '../util/forEach';
import reduce from '../util/reduce';
import flatten from '../util/flatten';

export const CHILD_COMPONENTS = Symbol('thea/child_components');


export function firstChild() {
  return this[CHILD_COMPONENTS].length ?
    this[CHILD_COMPONENTS][0].firstChild() : undefined;
}

export function lastChild() {
  return this[CHILD_COMPONENTS].length ?
    this[CHILD_COMPONENTS][this[CHILD_COMPONENTS].length - 1].lastChild() :
    undefined;
}

export function children() {
  return flatten(
    this[CHILD_COMPONENTS]
      .map(x => x.children()),
  );
}

export function toString() {
  return reduce(this[CHILD_COMPONENTS], (r, x) => r + x.toString(), '');
}

export function unmount() {
  forEach(this[CHILD_COMPONENTS], x => x.unmount());
}

/* eslint-disable no-shadow */
export function mountAll(children, context) {
  const last = x => x[x.length - 1];
  return reduce(children, (r, [child, attrs]) => {
    const lastComponent = last(r);
    const lastChild = lastComponent && lastComponent.lastChild();
    const firstNode = (lastChild && lastChild.nextSibling) || this;
    r.push(child.call(firstNode, attrs, context));
    return r;
  }, []);
}

export function updateEach(children, context) {
  const updateChild = ([child, attrs], i) => child.call(this[CHILD_COMPONENTS][i], attrs, context);
  forEach(children, updateChild);
}
/* eslint-enable no-shadow */
export function fakeThis(childComponents) {
  return {
    [CHILD_COMPONENTS]: childComponents,
  };
}
