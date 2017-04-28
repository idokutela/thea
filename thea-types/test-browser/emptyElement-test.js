import EmptyElement from '../src/emptyElement';

describe('Empty element tests', function () {
  it('should make an empty element with the correct comment node', function () {
    const el = EmptyElement();
    const children = [...el.children()];
    children.length.should.equal(1);
    el.firstChild().should.equal(children[0]);
    el.lastChild().should.equal(el.firstChild());
    children[0].nodeType.should.equal(window.Node.COMMENT_NODE);
    children[0].textContent.should.equal('%%');
    el.toString().should.equal('<!--%%-->');
    el.unmount.should.be.a.Function();
  });

  it('should mount on a node correctly', function () {
    const or = EmptyElement();
    const child = or.firstChild();
    const el = EmptyElement.call(child);
    const children = [...el.children()];
    children.length.should.equal(1);
    el.firstChild().should.equal(children[0]);
    el.lastChild().should.equal(el.firstChild());
    children[0].nodeType.should.equal(window.Node.COMMENT_NODE);
    children[0].textContent.should.equal('%%');
    el.toString().should.equal('<!--%%-->');
    el.should.not.equal(or);
    el.unmount.should.be.a.Function();
  });

  it('should tolerantly mount on non-matching nodes', function () {
    let node = document.createElement('div');
    document.body.appendChild(node);
    let el = EmptyElement.call(node);
    el.firstChild().nextSibling.should.equal(node);
    document.body.removeChild(node);
    el.unmount();
    node = document.createComment('Hello');
    el = EmptyElement.call(node);
    el.firstChild().should.equal(node);
    node.textContent.should.equal('%%');
  });

  it('should render idempotently', function () {
    const or = EmptyElement();
    const clone = Object.assign({}, or);
    const el = EmptyElement.call(or);
    el.should.equal(or);
    Object.assign({}, el).should.eql(clone);
  });

  it('should unmount correctly', function () {
    const el = EmptyElement();
    document.body.appendChild(el.firstChild());
    [...document.body.childNodes].length.should.equal(1);
    el.unmount();
    [...document.body.childNodes].length.should.equal(0);
    (el.firstChild().parentNode === null).should.be.true();
  });
});
