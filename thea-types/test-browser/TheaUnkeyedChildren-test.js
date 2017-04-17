import render from '../src/TheaUnkeyedChildren';

describe('TheaUnkeyedChildren tests', function () {
  let components;

  function renderChildSpan(attrs, context) {
    const numNodes = 10;
    function makeChild(nodes) {
      return {
        children() { return nodes; },
        firstChild() { return nodes[0]; },
        lastChild() { return nodes[nodes.length - 1]; },
        unmount() {
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
      for (let node = this; nodes.length < numNodes; node = node.nextSibling) {
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
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy'], [renderChildSpan, 'bar']];
    const component = render(children, ' the sloop');
    const childNodes = [...component.children()];
    childNodes[0].should.equal(component.firstChild());
    childNodes[29].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('hello the sloop');
    component.firstChild().tagName.should.equal('SPAN');
    component.lastChild().textContent.should.equal('bar the sloop');
    component.lastChild().tagName.should.equal('SPAN');
    for (let i = 0; i < 10; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hello the sloop');
    }
    for (let i = 10; i < 20; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('fraidy the sloop');
    }
    for (let i = 20; i < 30; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('bar the sloop');
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
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy'], [renderChildSpan, 'bar']];
    [...render(children, ' the sloop').children()].forEach(n => document.body.appendChild(n));
    components = [];
    const component = render.call(document.body.firstChild, children, ' the sloop');
    const childNodes = [...component.children()];
    childNodes.length.should.equal(30);
    childNodes[0].should.equal(component.firstChild());
    childNodes[29].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('hello the sloop');
    component.firstChild().tagName.should.equal('SPAN');
    component.lastChild().textContent.should.equal('bar the sloop');
    component.lastChild().tagName.should.equal('SPAN');
    for (let i = 0; i < 10; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hello the sloop');
    }
    for (let i = 10; i < 20; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('fraidy the sloop');
    }
    for (let i = 20; i < 30; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('bar the sloop');
    }

    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hello');
    components[0].context.should.equal(' the sloop');
    components[1].attrs.should.equal('fraidy');
    components[1].context.should.equal(' the sloop');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the sloop');
    [...document.body.childNodes].should.eql(childNodes);
  });

  it('should update a bunch children when the new list is shorter', function () {
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy'], [renderChildSpan, 'bar']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [[renderChildSpan, 'hallo'], [renderChildSpan, 'basty']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes.length.should.equal(20);
    for (let i = 0; i < 10; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hallo the slap');
    }
    for (let i = 10; i < 20; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('basty the slap');
    }
    childNodes[0].should.equal(component.firstChild());
    childNodes[19].should.equal(component.lastChild());
    [...document.body.childNodes].should.eql(childNodes);

    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hallo');
    components[0].context.should.equal(' the slap');
    components[1].attrs.should.equal('basty');
    components[1].context.should.equal(' the slap');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the sloop');
    components[2].unmounted.should.be.true();
  });

  it('should update a bunch children when the new list is longer', function () {
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [[renderChildSpan, 'hallo'], [renderChildSpan, 'basty'], [renderChildSpan, 'moose']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes.length.should.equal(30);
    for (let i = 0; i < 10; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hallo the slap');
    }
    for (let i = 10; i < 20; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('basty the slap');
    }
    for (let i = 20; i < 30; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('moose the slap');
    }
    childNodes[0].should.equal(component.firstChild());
    childNodes[29].should.equal(component.lastChild());
    [...document.body.childNodes].should.eql(childNodes);

    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hallo');
    components[0].context.should.equal(' the slap');
    components[1].attrs.should.equal('basty');
    components[1].context.should.equal(' the slap');
    components[2].attrs.should.equal('moose');
    components[2].context.should.equal(' the slap');
  });

  it('should update a bunch children when the new list is empty', function () {
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const child = component.firstChild();
    child.nodeType.should.equal(window.Node.COMMENT_NODE);
    child.textContent.should.equal('%%');
    component.lastChild().should.equal(component.firstChild());
    [...component.children()].should.eql([child]);
    component.unmount.should.be.a.Function();
  });

  it('should update a bunch children when the old list was empty', function () {
    const component = render([], ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [[renderChildSpan, 'hallo'], [renderChildSpan, 'basty'], [renderChildSpan, 'moose']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes.length.should.equal(30);
    for (let i = 0; i < 10; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hallo the slap');
    }
    for (let i = 10; i < 20; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('basty the slap');
    }
    for (let i = 20; i < 30; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('moose the slap');
    }
    childNodes[0].should.equal(component.firstChild());
    childNodes[29].should.equal(component.lastChild());
    [...document.body.childNodes].should.eql(childNodes);

    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hallo');
    components[0].context.should.equal(' the slap');
    components[1].attrs.should.equal('basty');
    components[1].context.should.equal(' the slap');
    components[2].attrs.should.equal('moose');
    components[2].context.should.equal(' the slap');
  });

  it('should update when the list stays empty', function () {
    const children = [];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    const updatedAttrs = [];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const child = component.firstChild();
    child.nodeType.should.equal(window.Node.COMMENT_NODE);
    child.textContent.should.equal('%%');
    component.lastChild().should.equal(component.firstChild());
    [...component.children()].should.eql([child]);
    component.unmount.should.be.a.Function();
  });

  it('should update unmounted children correctly when the list increases', function () {
    const children = [[renderChildSpan, 'hello', 'a'], [renderChildSpan, 'fraidy', 'b'], [renderChildSpan, 'bar', 'c']];
    const component = render(children, ' the sloop');
    const updatedAttrs = [[renderChildSpan, 'froozy', 'b'], [renderChildSpan, 'zoot', 'a'], [renderChildSpan, 'hello', 'd'], [renderChildSpan, 'bat', 'c'], [renderChildSpan, 'baz', 'z']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes.length.should.equal(50);
    childNodes[0].should.equal(component.firstChild());
    childNodes[49].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('froozy the slap');
    component.firstChild().tagName.should.equal('SPAN');
    component.lastChild().textContent.should.equal('baz the slap');
    component.lastChild().tagName.should.equal('SPAN');
    for (let i = 0; i < 10; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('froozy the slap');
    }
    for (let i = 10; i < 20; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('zoot the slap');
    }
    for (let i = 20; i < 30; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('hello the slap');
    }
    for (let i = 30; i < 40; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('bat the slap');
    }
    for (let i = 40; i < 50; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('baz the slap');
    }
    component.unmount.should.be.a.Function();
    components.length.should.equal(5);
    components[0].attrs.should.equal('froozy');
    components[0].context.should.equal(' the slap');
    components[1].attrs.should.equal('zoot');
    components[1].context.should.equal(' the slap');
    components[2].attrs.should.equal('hello');
    components[2].context.should.equal(' the slap');
    components[3].attrs.should.equal('bat');
    components[3].context.should.equal(' the slap');
    components[4].attrs.should.equal('baz');
    components[4].context.should.equal(' the slap');
  });

  it('should update unmounted children correctly when the list decreases', function () {
    const children = [[renderChildSpan, 'hello', 'a'], [renderChildSpan, 'fraidy', 'b'], [renderChildSpan, 'bar', 'c']];
    const component = render(children, ' the sloop');
    const updatedAttrs = [[renderChildSpan, 'froozy', 'b']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes.length.should.equal(10);
    childNodes[0].should.equal(component.firstChild());
    childNodes[9].should.equal(component.lastChild());
    component.firstChild().textContent.should.equal('froozy the slap');
    component.firstChild().tagName.should.equal('SPAN');
    component.lastChild().textContent.should.equal('froozy the slap');
    component.lastChild().tagName.should.equal('SPAN');
    for (let i = 0; i < 10; i++) { // eslint-disable-line
      childNodes[i].tagName.should.equal('SPAN');
      childNodes[i].textContent.should.equal('froozy the slap');
    }

    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('froozy');
    components[0].context.should.equal(' the slap');
    components[1].attrs.should.equal('fraidy');
    components[1].context.should.equal(' the sloop');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the sloop');
  });

  it('should unmount correctly', function () {
    const children = [[renderChildSpan, 'hello', 'a'], [renderChildSpan, 'fraidy', 'b'], [renderChildSpan, 'bar', 'c']];
    const component = render(children, ' the sloop');
    [...component.children()].forEach(n => document.body.appendChild(n));
    component.unmount();
    components.forEach(c => c.unmounted.should.be.true());
    [...document.body.childNodes].length.should.equal(0);
  });
});
