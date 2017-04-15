import render from '../src/TheaComment';

describe('TheaComment browser tests', function () {
  it('should make a TheaText component', function () {
    const val = 'foo & bar';
    const c = render([val]);
    const expectedNode = document.createComment(val);
    c.unmount.should.be.a.Function();
    c.children().should.eql([expectedNode]);
    c.firstChild().should.eql(expectedNode);
    c.lastChild().should.eql(expectedNode);
    c.toString().should.equal('<!--foo &amp; bar-->');
  });

  it('should mount correctly', function () {
    const val = '<What?!>';
    let node = document.createComment(val);
    const c = render.call(node, [val]);
    c.unmount.should.be.a.Function();
    c.children().should.eql([node]);
    c.firstChild().should.eql(node);
    c.lastChild().should.eql(node);
    c.toString().should.equal('<!--&lt;What?!&gt;-->');

    node = document.createComment('What?!');
    (() => render.call(node, [val])).should.throw();

    node = document.createTextNode(val);
    (() => render.call(node, [val])).should.throw();
  });

  it('should unmount correctly', function () {
    const val = 'A comment';
    const c = render([val]);
    document.body.appendChild(c.firstChild());
    c.firstChild().parentNode.should.equal(document.body);
    c.unmount();
    [...document.body.childNodes].length.should.equal(0);
  });

  it('should update correctly', function () {
    const c = render(['initial']);
    const val = 'some text';
    render.call(c, [val]);
    const expectedNode = document.createComment(val);
    c.children().should.eql([expectedNode]);
    c.firstChild().should.eql(expectedNode);
    c.lastChild().should.eql(expectedNode);
    c.toString().should.equal('<!--some text-->');
  });

  it('should correctly handle expressions', function () {
    const content = ['this ', { toString() { return 'is'; } }, ` a ${'test'}`];
    const expectedContent = 'this is a test';
    const c = render(content);
    c.firstChild().textContent.should.equal(expectedContent);
  });
});
