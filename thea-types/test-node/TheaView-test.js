import render from '../src/TheaView';
import { TRANSPARENT } from '../src/constants';

const tuplesEqual = ([a0, a1], [b0, b1]) => a0 === b0 && a1 === b1;

describe('TheaView tests', function () {
  it('should protest if it has no children', function () {
    (() => render()).should.throw();
    (() => render([])).should.throw();
  });

  it('should be marked as transparent', function () {
    render[TRANSPARENT].should.be.true();
  });

  it('should deal with a render when the children have no nodes', function () {
    const record = [];
    const placeholder = (attrs, context) => {
      record.push([attrs, context]);
      return {
        children() { return []; },
        firstChild() { },
        lastChild() { },
        unmount() { },
      };
    };
    const childAttrs = [1, {}, { a: 'b' }, 'xxx', null];
    const context = { foo: 'bar' };
    const expectedRecord = childAttrs.map(x => [x, context]);
    const attrs = childAttrs.map(x => [placeholder, x]);
    const c = render(attrs, context);
    const recordsEqual = record.reduce((r, x, i) =>
      r && tuplesEqual(x, expectedRecord[i]), true);
    recordsEqual.should.be.true();
    [...c.children()].should.eql([]);
    (c.firstChild() === undefined).should.be.true();
    (c.lastChild() === undefined).should.be.true();
    c.unmount.should.be.a.Function();
  });

  it('should deal with a render when the children have nodes', function () {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const record = [];
    const expectedChildren = [];
    const makeChild = () => {
      const val = letters[Math.floor(letters.length * Math.random())];
      const pos = expectedChildren.length;

      const child = {
        val,
        get nextSibling() { return expectedChildren[pos + 1]; },
        get prevSibling() { return expectedChildren[pos - 1]; },
      };
      expectedChildren.push(child);
      return child;
    };

    const placeholder = (attrs, context) => {
      record.push([attrs, context]);
      const children = [];
      const numChildren = Math.floor(3 * Math.random()) + 1;
      for (let i = 0; i < numChildren; i++) { // eslint-disable-line
        children.push(makeChild());
      }
      return {
        children() { return children; },
        firstChild() { return children[0]; },
        lastChild() { return children[children.length - 1]; },
        unmount() { },
      };
    };
    const childAttrs = [1, {}, { a: 'b' }, 'xxx', null];
    const context = { foo: 'bar' };
    const expectedRecord = childAttrs.map(x => [x, context]);
    const attrs = childAttrs.map(x => [placeholder, x]);
    const c = render(attrs, context);
    const recordsEqual = record.reduce((r, x, i) =>
      r && tuplesEqual(x, expectedRecord[i]), true);
    recordsEqual.should.be.true();
    [...c.children()].should.eql(expectedChildren);
    c.firstChild().should.equal(expectedChildren[0]);
    c.lastChild().should.equal(expectedChildren[expectedChildren.length - 1]);
    c.unmount.should.be.a.Function();
  });

  it('should mount on dom nodes', function () {
    const record = [];
    let index = 0;
    const nodes = [1, 3, 5, 2, 4, 6, 3, 5, 7, 4, 6, 8];

    function renderChild(attrs, context) {
      record.push([attrs, context, this]);
      index += 2;
      return {
        children() { return [attrs]; },
        firstChild() {
          return attrs;
        },
        lastChild() {
          return {
            nextSibling: nodes[index],
          };
        },
        unmount() {},
      };
    }

    const childAttrs = [2, 5, 0];
    const context = 'Hello';
    const expectedRecord = [[2, 'Hello', 1], [5, 'Hello', 5], [0, 'Hello', 4]];
    const expectedChildren = [2, 5, 0];
    const children = childAttrs.map(x => [renderChild, x]);
    const c = render.call(nodes[0], children, context);
    expectedRecord.should.eql(record);
    [...c.children()].should.eql(expectedChildren);
    c.firstChild().should.equal(2);
    c.lastChild().should.eql({ nextSibling: 3 });
    c.unmount.should.be.a.Function();
  });

  it('should update correctly', function () {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const record = [];
    const expectedChildren = [];
    const makeChild = function () {
      const val = letters[Math.floor(letters.length * Math.random())];
      const pos = expectedChildren.length;

      const child = {
        val,
        get nextSibling() { return expectedChildren[pos + 1]; },
        get prevSibling() { return expectedChildren[pos - 1]; },
      };
      expectedChildren.push(child);
      return child;
    };

    const placeholder = function (attrs, context) {
      record.push([attrs, context]);
      if (this) return this;
      const children = [];
      const numChildren = Math.floor(3 * Math.random()) + 1;
      for (let i = 0; i < numChildren; i++) { // eslint-disable-line
        children.push(makeChild());
      }
      return {
        children() { return children; },
        firstChild() { return children[0]; },
        lastChild() { return children[children.length - 1]; },
        unmount() { },
      };
    };
    const childAttrs = [1, {}, { a: 'b' }, 'xxx', null];
    const context = { foo: 'bar' };
    const expectedRecord = childAttrs.map(x => [x, context]);
    const attrs = childAttrs.map(x => [placeholder, x]);
    const c = render(attrs, context);
    const childAttrs2 = ['a', 'b', 'c', 'd', 'e'];
    const context2 = 'Hello';
    const attrs2 = childAttrs2.map(x => [placeholder, x]);
    const c2 = render.call(c, attrs2, context2);
    const expectedRecord2 = childAttrs2.map(x => [x, context2]);
    const er = expectedRecord.concat(expectedRecord2);
    const recordsEqual = record.reduce((r, x, i) =>
      r && tuplesEqual(x, er[i]), true);
    recordsEqual.should.be.true();
    c2.should.equal(c);
    [...c2.children()].should.eql(expectedChildren);
    c2.firstChild().should.equal(expectedChildren[0]);
    c2.lastChild().should.equal(expectedChildren[expectedChildren.length - 1]);
    c2.unmount.should.be.a.Function();
  });

  it('should complain if the node structure changes', function () {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const record = [];
    const expectedChildren = [];
    const makeChild = function () {
      const val = letters[Math.floor(letters.length * Math.random())];
      const pos = expectedChildren.length;

      const child = {
        val,
        get nextSibling() { return expectedChildren[pos + 1]; },
        get prevSibling() { return expectedChildren[pos - 1]; },
      };
      expectedChildren.push(child);
      return child;
    };

    const placeholder = function (attrs, context) {
      record.push([attrs, context]);
      if (this) return this;
      const children = [];
      const numChildren = Math.floor(3 * Math.random()) + 1;
      for (let i = 0; i < numChildren; i++) { // eslint-disable-line
        children.push(makeChild());
      }
      return {
        children() { return children; },
        firstChild() { return children[0]; },
        lastChild() { return children[children.length - 1]; },
        unmount() { },
      };
    };
    const childAttrs = [1, {}, { a: 'b' }, 'xxx', null];
    const context = { foo: 'bar' };
    const attrs = childAttrs.map(x => [placeholder, x]);
    const c = render(attrs, context);
    const childAttrs2 = ['a', 'b', 'c'];
    const context2 = 'Hello';
    const attrs2 = childAttrs2.map(x => [placeholder, x]);
    (() => render.call(c, attrs2, context2)).should.throw();
  });
});
