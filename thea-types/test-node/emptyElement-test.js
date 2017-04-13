import EmptyElement from '../src/emptyElement';

describe('Empty element node tests', function () {
  it('should make an empty element with an empty node', function () {
    const el = EmptyElement();
    const children = [...el.children()];
    children.length.should.equal(0);
    (el.firstChild() === el.lastChild()).should.be.true();
    (el.firstChild() === undefined).should.be.true();
    el.toString().should.equal('<!--%%-->');
    el.render.should.equal(EmptyElement);
    el.unmount.should.be.a.Function();
  });

  it('should render idempotently', function () {
    const or = EmptyElement();
    const clone = Object.assign({}, or);
    const el = or.render();
    el.should.equal(or);
    el.should.eql(clone);
  });

  it('unmount should be a no-op', function () {
    const el = EmptyElement();
    const clone = Object.assign({}, el);

    el.unmount();
    el.should.eql(clone);
  });
});
