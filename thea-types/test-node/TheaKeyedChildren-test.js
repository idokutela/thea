import render from '../src/TheaKeyedChildren';

describe('TheaKeyedChildren tests', function () {
  let components;

  function renderChildP(attrs, context) {
    function makeChild() {
      return {
        children() { return []; },
        firstChild() { return undefined; },
        lastChild() { return undefined; },
        unmount() { this.unmounted = true; },
        attrs,
        context,
        render: renderChildP,
      };
    }
    if (!this) {
      components.push(makeChild());
      return components[components.length - 1];
    }
    if (!this.unmount) {
      components.push(makeChild(this));
      return components[components.length - 1];
    }
    this.updated = true;
    this.attrs = attrs;
    this.context = context;
    return this;
  }

  function renderChildSpan(attrs, context) {
    function makeChild() {
      return {
        children() { return []; },
        firstChild() { return undefined; },
        lastChild() { return undefined; },
        unmount() { this.unmounted = true; },
        attrs,
        context,
        render: renderChildSpan,
      };
    }
    if (!this) {
      components.push(makeChild());
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
    this.updated = true;
    this.attrs = attrs;
    this.context = context;
    return this;
  }

  beforeEach(function () {
    components = [];
  });

  it('should render an empty node if no children are present', function () {
    const children = [];
    const component = render(children);
    component.unmount.should.be.a.Function();
    components.length.should.equal(0);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    [...component.children()].should.eql([]);
  });

  it('should render a bunch of children', function () {
    const children = [[renderChildP, 'hello'], [renderChildSpan, 'fraidy'], [renderChildP, 'bar']];
    const component = render(children, ' the sloop');
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    [...component.children()].should.eql([]);
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

    const updatedAttrs = [[renderChildP, 'hallo'], [renderChildP, 'basty']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    [...component.children()].should.eql([]);
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
    const updatedAttrs = [[renderChildP, 'fraidy', 'b'], [renderChildSpan, 'hello', 'a'], [renderChildP, 'bar', 'c']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    [...component.children()].should.eql([]);
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
    const updatedAttrs = [[renderChildP, 'fraidy', 'b'], [renderChildP, 'zoot', 'e'], [renderChildSpan, 'hello', 'a'], [renderChildP, 'bar', 'c'], [renderChildP, 'baz', 'z']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    [...component.children()].should.eql([]);
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
    component.unmount();
    components.forEach(c => c.unmounted.should.be.true());
  });
});
