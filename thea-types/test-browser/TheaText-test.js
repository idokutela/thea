import render from '../src/TheaText';

describe('TheaText browser tests', function () {
  it('should make a TheaText component', function () {
    const val = 'foo & bar';
    const c = render(val);
    const expectedNode = document.createTextNode(val);
    c.unmount.should.be.a.Function();
    c.children().should.eql([expectedNode]);
    c.firstChild().should.eql(expectedNode);
    c.lastChild().should.eql(expectedNode);
    c.toString().should.equal('foo &amp; bar');
  });

  it('should mount correctly', function () {
    const val = '<What?!>';
    let node = document.createTextNode(val);
    const c = render.call(node, val);
    c.unmount.should.be.a.Function();
    c.children().should.eql([node]);
    c.firstChild().should.eql(node);
    c.lastChild().should.eql(node);
    c.toString().should.equal('&lt;What?!&gt;');

    node = document.createTextNode('What?!');
    (() => render.call(node, val)).should.throw();

    node = document.createComment(val);
    (() => render.call(node, val)).should.throw();
  });

  it('should unmount correctly', function () {
    const val = '<What?!>';
    const c = render(val);
    document.body.appendChild(c.firstChild());
    c.firstChild().parentNode.should.equal(document.body);
    c.unmount();
    [...document.body.childNodes].length.should.equal(0);
  });

  it('should update correctly', function () {
    const c = render('initial');
    const val = 'some text';
    render.call(c, val);
    const expectedNode = document.createTextNode(val);
    c.children().should.eql([expectedNode]);
    c.firstChild().should.eql(expectedNode);
    c.lastChild().should.eql(expectedNode);
    c.toString().should.equal(val);
  });
});
