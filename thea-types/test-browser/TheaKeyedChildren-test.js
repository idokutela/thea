import render from '../src/TheaKeyedChildren';

describe('TheaKeyedChildren tests', function () {
  let components;

  function renderChildP(attrs, context) {
    function makeChild(node) {
      return {
        children() { return [node]; },
        firstChild() { return node; },
        lastChild() { return node; },
        unmount() {
          node.parentNode && node.parentNode.removeChild(node); // eslint-disable-line
          this.unmounted = true;
        },
        attrs,
        context,
        render: renderChildP,
      };
    }
    if (!this) {
      const node = document.createElement('P');
      node.textContent = attrs + context;
      components.push(makeChild(node));
      return components[components.length - 1];
    }
    if (!this.unmount) {
      components.push(makeChild(this));
      return components[components.length - 1];
    }
    this.attrs = attrs;
    this.context = context;
    this.firstChild().textContent = attrs + context;
    return this;
  }

  function renderChildSpan(attrs, context) {
    function makeChild(nodes) {
      return {
        children() { return nodes; },
        firstChild() { return nodes[0]; },
        lastChild() { return nodes[nodes.length - 1]; },
        unmount() {
          this.unmounted = true;
          nodes.forEach((node) => {
            node.parentNode && node.parentNode.removeChild(node); // eslint-disable-line
          });
          this.unmounted = true;
        },
        attrs,
        context,
        render: renderChildSpan,
      };
    }
    if (!this) {
      const numNodes = 10;
      const nodes = Array.from({ length: numNodes })
        .map(() => {
          const node = document.createElement('SPAN');
          node.textContent = attrs + context;
          return node;
        });
      components.push(makeChild(nodes));
      return components[components.length - 1];
    }
    if (!this.unmount) {
      const nodes = [];
      for (let node = this; node && (node.tagName === 'SPAN'); node = node.nextSibling) {
        nodes.push(node);
      }
      components.push(makeChild(nodes));
      return components[components.length - 1];
    }
    this.attrs = attrs;
    this.context = context;
    [...this.children()].forEach(x => x.textContent = attrs + context); // eslint-disable-line
    return this;
  }

  beforeEach(function () {
    components = [];
  });

  afterEach(function () {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should render an empty node if no children are present', function () {
    const children = [];
    const component = render(children);
    const child = component.firstChild();
    child.nodeType.should.equal(window.Node.COMMENT_NODE);
    child.textContent.should.equal('%%');
    component.lastChild().should.equal(component.firstChild());
    [...component.children()].should.eql([child]);
    component.unmount.should.be.a.Function();
  });

  it('should render a bunch of children', function () {
    const children = [[renderChildP, 'hello'], [renderChildSpan, 'fraidy'], [renderChildP, 'bar']];
    const component = render(children, ' the sloop');
    const childNodes = [...component.children()];
    childNodes[0].should.equal(component.firstChild());
    childNodes[11].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('hello the sloop');
    component.firstChild().tagName.should.equal('P');
    component.lastChild().textContent.should.equal('bar the sloop');
    component.lastChild().tagName.should.equal('P');
    for (let i = 1; i < 11; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('fraidy the sloop');
    }
    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hello');
    components[0].context.should.equal(' the sloop');
    components[1].attrs.should.equal('fraidy');
    components[1].context.should.equal(' the sloop');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the sloop');
  });

  it('should revive a bunch of children', function () {
    const children = [[renderChildP, 'hello'], [renderChildSpan, 'fraidy'], [renderChildP, 'bar']];
    [...render(children, ' the sloop').children()].forEach(n => document.body.appendChild(n));
    components = [];
    const component = render.call(document.body.firstChild, children, ' the sloop');
    const childNodes = [...component.children()];
    childNodes[0].should.equal(component.firstChild());
    childNodes[11].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('hello the sloop');
    component.firstChild().tagName.should.equal('P');
    component.lastChild().textContent.should.equal('bar the sloop');
    component.lastChild().tagName.should.equal('P');
    for (let i = 1; i < 11; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('fraidy the sloop');
    }
    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hello');
    components[0].context.should.equal(' the sloop');
    components[1].attrs.should.equal('fraidy');
    components[1].context.should.equal(' the sloop');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the sloop');
  });

  it('should update a bunch of children', function () {
    const children = [[renderChildSpan, 'hello'], [renderChildP, 'fraidy'], [renderChildP, 'bar']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [[renderChildP, 'hallo'], [renderChildP, 'basty']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes[0].should.equal(component.firstChild());
    childNodes[1].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('hallo the slap');
    component.firstChild().tagName.should.equal('P');
    component.lastChild().textContent.should.equal('basty the slap');
    component.lastChild().tagName.should.equal('P');
    [...document.body.childNodes].length.should.equal(2);

    component.unmount.should.be.a.Function();
    components.length.should.equal(4);
    components[0].attrs.should.equal('hello');
    components[0].context.should.equal(' the sloop');
    components[0].unmounted.should.be.true();
    components[1].attrs.should.equal('basty');
    components[1].context.should.equal(' the slap');
    components[2].unmounted.should.be.true();
    components[3].attrs.should.equal('hallo');
    components[3].context.should.equal(' the slap');
  });

  it('should move a keyed child', function () {
    const children = [[renderChildSpan, 'hello', 'a'], [renderChildP, 'fraidy', 'b'], [renderChildP, 'bar', 'c']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [[renderChildP, 'fraidy', 'b'], [renderChildSpan, 'hello', 'a'], [renderChildP, 'bar', 'c']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes[0].should.equal(component.firstChild());
    childNodes[11].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('fraidy the slap');
    component.firstChild().tagName.should.equal('P');
    component.lastChild().textContent.should.equal('bar the slap');
    component.lastChild().tagName.should.equal('P');
    [...document.body.childNodes].length.should.equal(12);
    for (let i = 1; i < 11; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hello the slap');
    }
    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hello');
    components[0].context.should.equal(' the slap');
    components[1].attrs.should.equal('fraidy');
    components[1].context.should.equal(' the slap');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the slap');
  });

  it('should insert a new component in the correct place', function () {
    const children = [[renderChildSpan, 'hello', 'a'], [renderChildP, 'fraidy', 'b'], [renderChildP, 'bar', 'c']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [[renderChildP, 'fraidy', 'b'], [renderChildP, 'zoot', 'e'], [renderChildSpan, 'hello', 'a'], [renderChildP, 'bar', 'c'], [renderChildP, 'baz', 'z']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes[0].should.equal(component.firstChild());
    childNodes[13].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('fraidy the slap');
    component.firstChild().tagName.should.equal('P');
    component.lastChild().textContent.should.equal('baz the slap');
    component.lastChild().tagName.should.equal('P');
    [...document.body.childNodes].length.should.equal(14);
    childNodes[1].tagName.should.equal('P');
    childNodes[1].textContent.should.equal('zoot the slap');
    childNodes[12].tagName.should.equal('P');
    childNodes[12].textContent.should.equal('bar the slap');

    for (let i = 2; i < 12; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hello the slap');
    }
    component.unmount.should.be.a.Function();
    components.length.should.equal(5);
    components[0].attrs.should.equal('hello');
    components[0].context.should.equal(' the slap');
    components[1].attrs.should.equal('fraidy');
    components[1].context.should.equal(' the slap');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the slap');
    components[3].attrs.should.equal('zoot');
    components[3].context.should.equal(' the slap');
    components[4].attrs.should.equal('baz');
    components[4].context.should.equal(' the slap');
  });

  it('should unmount correctly', function () {
    const children = [[renderChildSpan, 'hello', 'a'], [renderChildP, 'fraidy', 'b'], [renderChildP, 'bar', 'c']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    component.unmount();
    components.forEach(c => c.unmounted.should.be.true());
    [...document.body.childNodes].length.should.equal(0);
  });
});
