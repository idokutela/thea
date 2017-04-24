import { createStore } from 'redux';

const ATTRS = Symbol('attrs');
const CONTEXT = Symbol('context');
const STORE = Symbol('state');
const IS_RENDERING = Symbol('rendering');
const FLUSH_UPDATE = Symbol('flush-update');

const makeComponent = (inner, render, store, attrs, context) =>
  Object.assign(Object.create(inner), {
    [STORE]: Object.assign({}, store),
    [ATTRS]: attrs,
    [CONTEXT]: context,
    render,
  });

/**
 * Associates a redux store with a component.
 */
export default (
  reducer,
  stateToAttrs = (attrs = {}, state) => Object.assign({}, attrs, state),
) => (render) => {
  if (typeof render !== 'function') {
    throw new TypeError('Expected a render function');
  }
  if (typeof reducer !== 'function') {
    throw new TypeError('Expected a reducer function');
  }

  function makeAttrs(attrs, store) {
    const state = Object.assign({}, store.getState(), { dispatch: store.dispatch });
    return stateToAttrs(attrs, state);
  }

  function doInitialRender(attrs, context) {
    if (typeof reducer !== 'function') {
      throw new Error('Please supply a reducer');
    }
    const store = createStore(reducer);
    let updated = false;
    const unsubscribeInitialUpdate = store.subscribe(() => {
      updated = true;
    });

    const component = render.call(this, makeAttrs(attrs, store), context);
    unsubscribeInitialUpdate();
    const result = makeComponent(component, renderWithState, store, attrs, context); // eslint-disable-line
    store.subscribe(() => {
      if (result[IS_RENDERING]) {
        result[FLUSH_UPDATE] = true;
        return;
      }
      result.render.call(result, result[ATTRS], result[CONTEXT]);
    });
    if (updated) {
      return renderWithState.call(result, attrs, context); // eslint-disable-line
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
