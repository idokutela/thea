import sinon from 'sinon';
import { createStore } from 'redux';

import wrap, { STORE } from '../reduxWrapper';

describe('Wrapper tests', function () {
  it('should be a function', function () {
    wrap.should.be.a.Function();
    wrap()(() => {}).should.be.a.Function();
  });

  it('should cry if the transformer is not passed a function', function () {
    (() => wrap()({})).should.throw();
  });

  it('should render with the initial state', function () {
    function render(attrs) {
      const rval = this || { render };
      const theAttrs = Object.assign({}, attrs);
      delete theAttrs.dispatch;
      rval.attrs = theAttrs;
      return rval;
    }
    const state = { val: 'Hello' };
    const store = createStore(() => state);

    const r = wrap(undefined, store)(render);
    const comp = r({ a: 'zoop' }, { b: 'bloop' });
    comp.attrs.should.eql({ a: 'zoop', val: 'Hello' });
  });

  it('should render with the initial state', function () {
    const render = sinon.spy(function render(attrs) {
      const rval = this || { render };
      const theAttrs = Object.assign({}, attrs);
      delete theAttrs.dispatch;
      rval.attrs = theAttrs;
      return rval;
    });

    const state = { val: 'Hello' };
    const store = createStore(() => state);
    const stateToAttrs = sinon.spy(() => 'hello');
    const attrs = { foo: 'bar' };
    const context = { fizz: 'bang', [STORE]: store };
    const r = wrap(
      stateToAttrs,
    )(render);
    r(attrs, context);
    stateToAttrs.calledOnce.should.be.true();
    stateToAttrs.args[0][0].should.eql(attrs);
    const expectedToBeState = Object.assign({}, stateToAttrs.args[0][1]);
    delete expectedToBeState.dispatch;
    state.should.eql(expectedToBeState);
    render.calledOnce.should.be.true();
    render.args[0].should.eql(['hello', context]);
  });

  it('should update a component if this was a component', function () {
    const render = sinon.spy(function render() {
      const rval = this || { render, unmount: () => {} };
      return rval;
    });

    const state = { val: 'Hello' };
    const store = createStore(() => state);
    const stateToAttrs = sinon.spy(() => 'hello');
    const attrs = { foo: 'bar' };
    const context = { fizz: 'bang', [STORE]: store };
    const r = wrap(
      stateToAttrs,
    )(render);
    const that = r(attrs, context);
    that.foo = 'bar';
    const res = r.call(that, attrs, context);
    res.should.equal(that);
  });

  it('should revive a component', function () {
    const render = sinon.spy(function render() {
      if (this && !this.unmount) {
        return { foo: 'bar' };
      }
      const rval = this || { render, unmount: () => {} };
      return rval;
    });

    const state = { val: 'Hello' };
    const store = createStore(() => state);
    const stateToAttrs = sinon.spy(() => 'hello');
    const attrs = { foo: 'bar' };
    const context = { fizz: 'bang', [STORE]: store };
    const r = wrap(
      stateToAttrs,
    )(render);
    const that = { fizz: 'bang' };
    const res = r.call(that, attrs, context);
    res.foo.should.equal('bar');
    that.foo = 'bar';
  });


  it('should update a component state is reduced', function () {
    const render = sinon.spy(function render() {
      const rval = this || { render, unmount: () => {} };
      return rval;
    });

    const reducer = (state = { a: [] }, action) => Object.assign(
      {}, state,
      { a: state.a.concat(action) },
    );
    const store = createStore(reducer);

    const r = wrap(
      undefined, store,
    )(render);
    r();
    const action = { type: 'Action' };
    store.dispatch(action);
    render.callCount.should.equal(2);
    const args = Object.assign({}, render.secondCall.args[0]);
    delete args.dispatch;
    args.should.eql({ a: [{
      type: '@@redux/INIT',
    }, action] });
  });

  it('should rerender if an update occurs during the initial render', function () {
    const action = { type: 'Action' };
    const render = sinon.spy(function render({ a, dispatch }) {
      if (a.length < 2) {
        dispatch(action);
      }
      const rval = this || { render, unmount: () => {} };
      return rval;
    });

    const reducer = (state = { a: [] }, a) => Object.assign(
      {}, state,
      { a: state.a.concat(a) },
    );
    const store = createStore(reducer);

    const r = wrap(
      undefined,
      store,
    )(render);
    r();
    render.callCount.should.equal(2);
    const args = Object.assign({}, render.secondCall.args[0]);
    delete args.dispatch;
    args.should.eql({ a: [{
      type: '@@redux/INIT',
    }, action] });
  });

  it('should rerender if an update occurs during a later render', function () {
    const action = { type: 'Action' };
    let fire = false;
    const render = sinon.spy(function render({ a, dispatch }) {
      if (fire && a.length < 2) {
        dispatch(action);
      }
      const rval = this || { render, unmount: () => {} };
      return rval;
    });

    const reducer = (state = { a: [] }, a) => Object.assign(
      {}, state,
      { a: state.a.concat(a) },
    );
    const store = createStore(reducer);

    const r = wrap(
      undefined,
      store,
    )(render);
    const result = r();
    fire = true;
    r.call(result);

    render.callCount.should.equal(3);
    const args = Object.assign({}, render.thirdCall.args[0]);
    delete args.dispatch;
    args.should.eql({ a: [{
      type: '@@redux/INIT',
    }, action] });
  });
});
