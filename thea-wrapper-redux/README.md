# thea-wrapper-redux

A wrapper for state management with redux.

The simplest gist:

```js
import view from 'thea';
import wrap from 'thea-wrapper-redux/wrapper';
import { createStore } from 'redux';

const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const reducer = (state = { value: 1 }, { type }) => {
  switch (type) {
    case INCREMENT: return Object.assign({}, state, { value: state.value + 1 });
    case DECREMENT: return Object.assign({}, state, { value: state.value - 1 });
    default: return state;
  }
};
const store = createStore();

// ... store is a redux store
const render = ({ value, dispatch }) => (
  <view>
    <p>
      Counter: { value }
    </p>
    <button onClick={() => dispatch({ type: INCREMENT })} />
    <button onClick={() => dispatch({ type: DECREMENT })} />
  </view>
);

const Component = wrap(undefined, store)(view(render));

export default Component;
```

A fancier version:

```js
import view from 'thea';
import wrap from 'thea-wrapper-redux/wrapper';
import { createStore } from 'redux';

const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const reducer = (state = { value: 1 }, { type }) => {
  switch (type) {
    case INCREMENT: return Object.assign({}, state, { value: state.value + 1 });
    case DECREMENT: return Object.assign({}, state, { value: state.value - 1 });
    default: return state;
  }
};
const store = createStore();

const stateToAttrs = (attrs, { value, dispatch }) => Object.assign(
  {},
  attrs,
  {
    value,
    fireIncrement: () => dispatch({ type: INCREMENT }),
    fireDecrement: () => dispatch({ type: INCREMENT }),    
  }
)

// ... store is a redux store
const render = ({ value, dispatch }) => (
  <view>
    <p>
      Counter: { value }
    </p>
    <button onClick={fireIncrement} />
    <button onClick={fireDecrement} />
  </view>
);

const Component = wrap(stateToAttrs, store)(view(render));

export default Component;
```

If you need to provide a store across many components,
you can use the Store component:

```js
import view from 'thea';
import wrap from 'thea-wrapper-redux/wrapper';
import Store from 'thea-wrapper-redux/Store';
import { createStore } from 'redux';

const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

const reducer = (state = { value: 1 }, { type }) => {
  switch (type) {
    case INCREMENT: return Object.assign({}, state, { value: state.value + 1 });
    case DECREMENT: return Object.assign({}, state, { value: state.value - 1 });
    default: return state;
  }
};
const store = createStore();

// ... store is a redux store
const render = ({ value, dispatch }) => (
  <view>
    <p>
      Counter: { value }
    </p>
    <button onClick={() => dispatch({ type: INCREMENT })} />
    <button onClick={() => dispatch({ type: DECREMENT })} />
  </view>
);

const Counter = wrap()(view(render));

const App = view(() => (
  <Store store={store}>
    <Counter />
  </Store>
))

export default App;
```
