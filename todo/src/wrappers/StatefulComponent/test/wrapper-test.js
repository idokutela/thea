import sinon from 'sinon';
import makeStateful from '../index';

describe('Wrapper test', function () {
  it('should make a transforming function', function () {
    makeStateful().should.be.a.Function();
    makeStateful()(() => {}).should.be.a.Function();
  });

  it('should cry if the transformer is not passed a function', function () {
    (() => makeStateful()({})).should.throw();
  });

  it('should render with the initial state', function () {
    function fakeRenderer(attrs) {
      const rval = this || { render: fakeRenderer };
      const state = Object.assign({}, attrs.state);
      delete state.update;
      rval.state = state;
      return rval;
    }

    const r = makeStateful({ hello: 'mate' })(fakeRenderer);
    const comp = r({ a: 'zoop' }, { b: 'bloop' });
    comp.state.should.eql({ hello: 'mate' });
  });

  it('should call the inner renderer with mapped attrs and context', function () {
    const render = sinon.spy(function fakeRenderer() {
      const rval = this || { render: fakeRenderer };
      return rval;
    });

    const attrs = { foo: 'bar' };
    const context = { fizz: 'bang' };
    const state = { bar: 'bat' };

    const stateToAttrs = sinon.spy(() => 'hello');

    const r = makeStateful(state, stateToAttrs)(render);

    r(attrs, context);
    stateToAttrs.calledOnce.should.be.true();
    stateToAttrs.args[0][0].should.eql(attrs);
    const expectedToBeState = Object.assign({}, stateToAttrs.args[0][1]);
    delete expectedToBeState.update;
    state.should.eql(expectedToBeState);
    render.calledOnce.should.be.true();
    render.args[0].should.eql(['hello', context]);
  });

  it('should render to an component if the original was a component', function () {
    const render = function fakeRenderer() {
      const rval = this || { render: fakeRenderer, foo: 'bat' };
      return rval;
    };

    const r = makeStateful()(render);

    const c = r();
    c.foo.should.equal('bat');
    c.render.should.equal(r);
  });

  it('should revive a component', function () {
    const render = sinon.spy(function fakeRenderer() {
      const rval = this || { render: fakeRenderer };
      return rval;
    });

    const attrs = { foo: 'bar' };
    const context = { fizz: 'bang' };
    const state = { bar: 'bat' };

    const stateToAttrs = sinon.spy(() => 'hello');

    const r = makeStateful(state, stateToAttrs)(render);
    const thisArg = { hello: 'mate' };

    r.call(thisArg, attrs, context);
    stateToAttrs.calledOnce.should.be.true();
    stateToAttrs.args[0][0].should.eql(attrs);
    const expectedToBeState = Object.assign({}, stateToAttrs.args[0][1]);
    delete expectedToBeState.update;
    state.should.eql(expectedToBeState);
    render.calledOnce.should.be.true();
    render.args[0].should.eql(['hello', context]);
    render.firstCall.thisValue.should.equal(thisArg);
  });

  it('should rerender with updated state when an updater is called outside of a render', function () {
    let s;
    const render = sinon.spy(function fakeRenderer(attrs) {
      const rval = this || { render: fakeRenderer, unmount: () => {} };
      s = attrs.state;
      return rval;
    });

    const attrs = { foo: 'bar' };
    const context = { fizz: 'bang' };
    const state = { bar: 'bat' };

    const r = makeStateful(state)(render);
    r(attrs, context);
    s.update(st => Object.assign({}, st, { frib: 'frab' }));
    render.calledTwice.should.be.true();
    const shouldBeAttrs = render.secondCall.args[0];
    const shouldBeState = shouldBeAttrs.state;
    delete shouldBeAttrs.state;
    delete shouldBeState.update;
    attrs.should.eql(shouldBeAttrs);
    ({ bar: 'bat', frib: 'frab' }).should.eql(shouldBeState);
    context.should.eql(render.secondCall.args[1]);
  });

  it('should queue up an update if called in render and then execute it', function () {
    let rendered;
    let updateCount = 0;
    function extractBits(args) {
      const context = args[1];
      const attrs = Object.assign({}, args[0]);
      const state = attrs.state;
      delete attrs.state;
      state.update.should.be.a.Function();
      delete state.update;
      return { attrs, state, context };
    }

    const render = sinon.spy(function fakeRenderer(attrs) {
      const rval = this || { render: fakeRenderer, unmount: () => {} };
      if (!rendered) {
        attrs.state.update((state) => {
          if (rendered) {
            updateCount += 1;
          }
          return Object.assign(state, { updateCount });
        });
      }
      rendered = true;

      return rval;
    });

    const at = { foo: 'bar' };
    const co = { fizz: 'bang' };
    const st = { bar: 'bat' };

    const r = makeStateful(st)(render);
    const comp = r(at, co);
    rendered = false;
    comp.render({}, {});
    render.callCount.should.equal(4);
    updateCount.should.equal(2);

    let { attrs, state, context } = extractBits(render.args[0]);
    attrs.should.eql(at);
    state.should.eql(st);
    context.should.eql(co);
    ({ attrs, state, context } = extractBits(render.args[1]));
    attrs.should.eql(at);
    state.should.eql(Object.assign(st, { updateCount: 1 }));
    context.should.eql(co);
    ({ attrs, state, context } = extractBits(render.args[2]));
    attrs.should.eql({});
    state.should.eql(Object.assign(st, { updateCount: 1 }));
    context.should.eql({});
    ({ attrs, state, context } = extractBits(render.args[3]));
    attrs.should.eql({});
    state.should.eql(Object.assign(st, { updateCount: 2 }));
    context.should.eql({});
  });
});
