import makeComponent from '../src/simpleComponent';

describe('Simple Component tests', function () {
  let component;
  let attrsToValue;
  let valueToString;
  let nodeType;
  let componentName;
  let createNode;

  beforeEach(function () {
    attrsToValue = s => `----${s}----`;
    valueToString = v => `tString(${v})`;
    nodeType = window.Node.TEXT_NODE;
    componentName = 'Bloop';
    createNode = value => document.createTextNode(value);
    component = makeComponent({
      attrsToValue,
      valueToString,
      nodeType,
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
    c.render.should.equal(component);
    c.toString().should.equal('tString(----hello----)');
  });

  it('should mount correctly', function () {
    let node = document.createTextNode(attrsToValue('bla'));
    const c = component.call(node, 'bla');
    c.unmount.should.be.a.Function();
    c.children().should.eql([document.createTextNode(attrsToValue('bla'))]);
    c.firstChild().should.eql(document.createTextNode(attrsToValue('bla')));
    c.lastChild().should.eql(document.createTextNode(attrsToValue('bla')));
    c.render.should.equal(component);
    c.toString().should.equal('tString(----bla----)');

    node = document.createTextNode(attrsToValue('hello'));
    (() => component.call(node, 'bla')).should.throw();

    node = document.createComment(attrsToValue('hello'));
    (() => component.call(node, 'hello')).should.throw();
  });

  it('should unmount correctly', function () {
    const c = component('bla');
    document.body.appendChild(c.firstChild());
    c.firstChild().parentNode.should.equal(document.body);
    c.unmount();
    [...document.body.childNodes].length.should.equal(0);
  });

  it('should update correctly', function () {
    const o = component('bye');
    const c = component.call(o, 'hello');
    o.should.not.equal(c);
    c.children().should.eql([document.createTextNode(attrsToValue('hello'))]);
    c.firstChild().should.eql(document.createTextNode(attrsToValue('hello')));
    c.lastChild().should.eql(document.createTextNode(attrsToValue('hello')));
    c.render.should.equal(component);
    c.toString().should.equal('tString(----hello----)');
  });

  it('should correctly deal with the case that createNode returns undefined', function () {
    createNode = () => undefined;

    component = makeComponent({
      attrsToValue,
      valueToString,
      nodeType,
      componentName,
      createNode,
    });

    const c = component('hello');
    c.unmount.should.be.a.Function();
    c.children().should.eql([]);
    (c.firstChild() === undefined).should.be.true();
    (c.lastChild() === undefined).should.be.true();
    c.render.should.equal(component);
    c.toString().should.equal('tString(----hello----)');
    c.unmount();
  });
});
