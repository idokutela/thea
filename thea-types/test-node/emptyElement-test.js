import EmptyElement from '../src/emptyElement';

describe('Empty element node tests', function () {
  it('should make an empty element with an empty node', function () {
    const el = EmptyElement();
    const children = [...el.children()];
    children.length.should.equal(0);
    (el.firstChild() === el.lastChild()).should.be.true();
    (el.firstChild() === undefined).should.be.true();
    el.toString().should.equal('<!--%%-->');
    el.unmount.should.be.a.Function();
  });

  it('should render equivalently', function () {
    const or = EmptyElement();
    const clone = Object.assign({}, or);
    const el = EmptyElement.call(or);
    el.should.equal(or);
    Object.assign({}, el).should.eql(clone);
  });

  it('unmount should be a no-op', function () {
    const el = EmptyElement();
    const clone = Object.assign({}, el);

    el.unmount();
    Object.assign({}, el).should.eql(clone);
  });
});
