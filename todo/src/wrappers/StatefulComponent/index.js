const IS_RENDERING = Symbol('is rendering');
const ATTRS = Symbol('attrs');
const CONTEXT = Symbol('context');
const UPDATE_QUEUE = Symbol('update queue');
const STATE = Symbol('state');

const makeUpdater = o => function update(updater) {
  const queue = o[UPDATE_QUEUE] = o[UPDATE_QUEUE] || []; // eslint-disable-line

  updater && queue.push(updater); // eslint-disable-line
  if (o[IS_RENDERING] || !queue.length) return;

  let state = o[STATE];

  while (queue.length) {
    state = queue.pop()(state);
  }
  o[STATE] = state; // eslint-disable-line
  o.render(o[ATTRS], o[CONTEXT]);
};

const makeComponent = (inner, state, updateQueue) => {
  const result = Object.create(inner);
  Object.assign(result, {
    [STATE]: Object.assign({}, state),
    [UPDATE_QUEUE]: updateQueue,
    updateState: makeUpdater(result),
  });
  return result;
};

export default (
  initialState = {},
  stateToAttrs = (attrs, state) => Object.assign({}, attrs, { state }),
) => (render) => {
  if (typeof render !== 'function') {
    throw new TypeError('Expected a render function');
  }

  function doInitialRender(attrs, context) {
    const updateQueue = [];
    let doUpdate;
    const update = updater => (doUpdate ? doUpdate(updater) : updateQueue.push(updater));
    const state = Object.assign({}, initialState, { update });
    const theAttrs = stateToAttrs(attrs, state);
    const component = render.call(this, theAttrs, context);
    const result = makeComponent(component, state, updateQueue);
    result[ATTRS] = attrs;
    result[CONTEXT] = context;
    result.render = renderWithState; // eslint-disable-line
    doUpdate = result.updateState;
    doUpdate();
    return result;
  }

  function renderWithState(attrs, context) {
    if (!this || !this.unmount) {
      return doInitialRender.call(this, attrs, context);
    }
    this[ATTRS] = attrs;
    this[CONTEXT] = context;
    this[IS_RENDERING] = true;
    const state = Object.assign({}, this[STATE], { update: this.updateState });
    const theAttrs = stateToAttrs(attrs, state);

    render.call(this, theAttrs, context);

    this[IS_RENDERING] = false;
    this.updateState();
    return this;
  }

  return renderWithState;
};
