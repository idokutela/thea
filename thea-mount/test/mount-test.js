import dom from 'thea/types/TheaDOM';
import renderInto from '../src/index';

const p = dom('p');
const div = dom('div');

describe('thea-mount tests', function () {
  let mountNode;
  let renderIntoNode;

  beforeEach(function () {
    document.body.innerHTML = '<div id="mountNode"></div>';
    mountNode = document.body.firstChild;
    renderIntoNode = renderInto(mountNode);
  });

  afterEach(function () {
    document.body.textContent = '';
  });

  it('should mount a component into a node', function () {
    const comp = renderIntoNode([p, { class: 'test' }]);
    [...mountNode.childNodes].length.should.equal(1);
    mountNode.firstChild.tagName.should.equal('P');
    mountNode.firstChild.className.should.equal('test');
    comp.unmount.should.be.a.Function();
    comp.unmount();
    (!(mountNode.firstChild)).should.be.true();
  });

  it('should mount a component into a even if the node has the wrong children', function () {
    mountNode.appendChild(document.createTextNode('bla'));
    const comp = renderIntoNode([p, { class: 'test' }]);
    [...mountNode.childNodes].length.should.equal(1);
    mountNode.firstChild.tagName.should.equal('P');
    mountNode.firstChild.className.should.equal('test');
    comp.unmount.should.be.a.Function();
    comp.unmount();
    (!(mountNode.firstChild)).should.be.true();
  });

  it('should replace a component if render is called with a different component', function () {
    renderIntoNode([div]);
    const comp = renderIntoNode([p, { class: 'test' }]);
    [...mountNode.childNodes].length.should.equal(1);
    mountNode.firstChild.tagName.should.equal('P');
    mountNode.firstChild.className.should.equal('test');
    comp.unmount.should.be.a.Function();
    comp.unmount();
    (!(mountNode.firstChild)).should.be.true();
  });

  it('should update a component if render is called with the same component', function () {
    const prev = renderIntoNode([p]);
    const comp = renderIntoNode([p, { class: 'test' }]);
    [...mountNode.childNodes].length.should.equal(1);
    mountNode.firstChild.tagName.should.equal('P');
    mountNode.firstChild.className.should.equal('test');
    comp.should.equal(prev);
    comp.unmount();
    (!(mountNode.firstChild)).should.be.true();
  });

  it('should unmount a component if render is called without arguments', function () {
    renderIntoNode([p, { class: 'test' }]);
    renderIntoNode();
    (!(mountNode.firstChild)).should.be.true();
  });

  it('should have an unmount member that unmounts the currently mounted component', function () {
    const comp = renderIntoNode([p, { class: 'test' }]);
    let unmounted = false;
    const unmount = comp.unmount;
    comp.unmount = function () {
      unmount.call(this);
      unmounted = true;
    };

    renderIntoNode.unmount();
    (!mountNode.firstChild).should.be.true();
    unmounted.should.be.true();
  });
});
