const ATTRS = Symbol('attrs');
const CONTEXT = Symbol('context');
export const STORE = Symbol('state');
const IS_RENDERING = Symbol('rendering');
const FLUSH_UPDATE = Symbol('flush-update');

const makeComponent = (inner, render, store, attrs, context) => {
  const result = Object.assign(Object.create(inner), {
    [STORE]: Object.assign({}, store),
    [ATTRS]: attrs,
    [CONTEXT]: context,
    render,
  });

  const unsubscribe = store.subscribe(() => {
    if (result[IS_RENDERING]) {
      result[FLUSH_UPDATE] = true;
      return;
    }
    result.render.call(result, result[ATTRS], result[CONTEXT]);
  });

  result.unmount = function unmount() {
    unsubscribe();
    inner.unmount();
  };

  return result;
};


/**
 * Associates a redux store with a component.
 */
export default (
  stateToAttrs = (attrs = {}, state) => Object.assign({}, attrs, state),
  store,
) => (render) => {
  if (typeof render !== 'function') {
    throw new TypeError('Expected a render function');
  }
  function makeAttrs(attrs, theStore) {
    const state = Object.assign({}, theStore.getState(), { dispatch: theStore.dispatch });
    return stateToAttrs(attrs, state);
  }

  function doInitialRender(attrs, context = {}) {
    const theStore = store || context[STORE];
    if (typeof theStore !== 'object') {
      throw new Error('Please supply a store');
    }
    let updated = false;
    const unsubscribeInitialUpdate = theStore.subscribe(() => {
      updated = true;
    });

    const component = render.call(this, makeAttrs(attrs, theStore), context);
    unsubscribeInitialUpdate();
    const result = makeComponent(component, renderWithState, theStore, attrs, context); // eslint-disable-line
    if (updated) {
      return result.render.call(result, attrs, context); // eslint-disable-line
    }
    return result;
  }

  function renderWithState(attrs = {}, context) {
    if (!this || !this.unmount) {
      return doInitialRender.call(this, attrs, context);
    }
    this[ATTRS] = attrs;
    this[CONTEXT] = context;
    this[IS_RENDERING] = true;
    render.call(this, makeAttrs(attrs, this[STORE]), context);
    this[IS_RENDERING] = false;
    if (this[FLUSH_UPDATE]) {
      this[FLUSH_UPDATE] = false;
      return renderWithState.call(this, attrs, context);
    }
    return this;
  }

  return renderWithState;
};
