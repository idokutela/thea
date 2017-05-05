import makeComponent from '../src/common/simpleComponent';

describe('Simple Component tests', function () {
  let component;
  let attrsToValue;
  let valueToString;
  let validateNode;
  let componentName;
  let createNode;

  beforeEach(function () {
    attrsToValue = s => `----${s}----`;
    valueToString = v => `tString(${v})`;
    validateNode = node => node && node.nodeType === window.Node.TEXT_NODE;
    componentName = 'Bloop';
    createNode = value => document.createTextNode(value);
    component = makeComponent({
      attrsToValue,
      valueToString,
      validateNode,
      componentName,
      createNode,
    });
  });

  it('should make a component', function () {
    const c = component('hello');
    c.unmount.should.be.a.Function();
    c.children().should.eql([document.createTextNode(attrsToValue('hello'))]);
    c.firstChild().should.eql(document.createTextNode(attrsToValue('hello')));
    c.lastChild().should.eql(document.createTextNode(attrsToValue('hello')));
    c.toString().should.equal('tString(----hello----)');
  });

  it('should mount correctly', function () {
    let node = document.createTextNode(attrsToValue('bla'));
    const c = component.call(node, 'bla');
    c.unmount.should.be.a.Function();
    c.children().should.eql([document.createTextNode(attrsToValue('bla'))]);
    c.firstChild().should.eql(document.createTextNode(attrsToValue('bla')));
    c.lastChild().should.eql(document.createTextNode(attrsToValue('bla')));
    c.toString().should.equal('tString(----bla----)');

    node = document.createTextNode(attrsToValue('hello'));
    (() => component.call(node, 'bla')).should.throw();

    node = document.createComment(attrsToValue('hello'));
    (() => component.call(node, 'hello')).should.throw();
  });

  it('should deal with trimmed text tolerantly', function () {
    let node;
    let c;
    attrsToValue = s => `${s}`;
    createNode = (value) => {
      const n = document.createElement('P');
      n.textContent = value;
      return n;
    };
    component = makeComponent({
      attrsToValue,
      valueToString,
      validateNode,
      componentName,
      createNode,
    });

    node = document.createTextNode(attrsToValue('hello'));
    c = component.call(node, 'hello   ');
    node.textContent.should.equal('hello   ');
    c.firstChild().should.equal(node);

    node = document.createComment(attrsToValue('hello'));
    document.body.appendChild(node);
    c = component.call(node, '    ');
    c.firstChild().nextSibling.should.equal(node);
    document.body.removeChild(node);
    c.unmount();
  });

  it('should unmount correctly', function () {
    const c = component('bla');
    document.body.appendChild(c.firstChild());
    c.firstChild().parentNode.should.equal(document.body);
    c.unmount();
    [...document.body.childNodes].length.should.equal(0);
  });

  it('should update correctly', function () {
    const c = component('bye');
    component.call(c, 'hello');
    c.children().should.eql([document.createTextNode(attrsToValue('hello'))]);
    c.firstChild().should.eql(document.createTextNode(attrsToValue('hello')));
    c.lastChild().should.eql(document.createTextNode(attrsToValue('hello')));
    c.toString().should.equal('tString(----hello----)');
  });

  it('should correctly deal with the case that createNode returns undefined', function () {
    createNode = () => undefined;

    component = makeComponent({
      attrsToValue,
      valueToString,
      validateNode,
      componentName,
      createNode,
    });

    const c = component('hello');
    c.unmount.should.be.a.Function();
    c.children().should.eql([]);
    (c.firstChild() === undefined).should.be.true();
    (c.lastChild() === undefined).should.be.true();
    c.toString().should.equal('tString(----hello----)');
    c.unmount();
  });
});
