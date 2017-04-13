import render from '../src/TheaComment';

describe('TheaComment node tests', function () {
  it('should correctly mount', function () {
    const val = 'foo & bar';
    const c = render([val]);
    c.unmount.should.be.a.Function();
    c.children().should.eql([]);
    (c.firstChild() === undefined).should.be.true();
    (c.lastChild() === undefined).should.be.true();
    c.render.should.equal(render);
    c.toString().should.equal('<!--foo &amp; bar-->');
  });

  it('should correctly update', function () {
    const val = 'foo & bar';
    const c = render(['foo']).render([val]);
    c.unmount.should.be.a.Function();
    c.children().should.eql([]);
    (c.firstChild() === undefined).should.be.true();
    (c.lastChild() === undefined).should.be.true();
    c.render.should.equal(render);
    c.toString().should.equal('<!--foo &amp; bar-->');
  });
});
