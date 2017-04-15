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
        render: placeholder,
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
        render: placeholder,
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
});
