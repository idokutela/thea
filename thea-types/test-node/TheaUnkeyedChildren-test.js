import render from '../src/TheaUnkeyedChildren';

describe('TheaUnkeyedChildren tests', function () {
  let components;

  function renderChildSpan(attrs, context) {
    function makeChild() {
      return {
        children() { return []; },
        firstChild() { return undefined; },
        lastChild() { return undefined; },
        unmount() {
          this.unmounted = true;
        },
        attrs,
        context,
        toString() { return attrs + context; },
        render: renderChildSpan,
      };
    }
    if (!this) {
      components.push(makeChild());
      return components[components.length - 1];
    }
    if (!this.unmount) {
      components.push(makeChild());
      return components[components.length - 1];
    }
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
    [...component.children()].should.eql([]);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    component.unmount.should.be.a.Function();
  });

  it('should render a bunch of children', function () {
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy'], [renderChildSpan, 'bar']];
    const component = render(children, ' the sloop');
    const childNodes = [...component.children()];
    childNodes.length.should.equal(0);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();

    component.unmount.should.be.a.Function();
    components.length.should.equal(3);
    components[0].attrs.should.equal('hello');
    components[0].context.should.equal(' the sloop');
    components[1].attrs.should.equal('fraidy');
    components[1].context.should.equal(' the sloop');
    components[2].attrs.should.equal('bar');
    components[2].context.should.equal(' the sloop');
  });

  it('should correctly compute toString', function () {
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy'], [renderChildSpan, 'bar']];
    let component = render(children, ' the sloop');
    component.toString().should.equal('hello the sloopfraidy the sloopbar the sloop');
    component = render([]);
    component.toString().should.equal('<!--%%-->');
  });

  it('should update a bunch children when the new list is shorter', function () {
    const children = [[renderChildSpan, 'hello'], [renderChildSpan, 'fraidy'], [renderChildSpan, 'bar']];
    const component = render(children, ' the sloop');
    const updatedAttrs = [[renderChildSpan, 'hallo'], [renderChildSpan, 'basty']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();

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
    const updatedAttrs = [[renderChildSpan, 'hallo'], [renderChildSpan, 'basty'], [renderChildSpan, 'moose']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    childNodes.length.should.equal(0);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();

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
    const updatedAttrs = [];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    [...component.children()].should.eql([]);
    component.unmount.should.be.a.Function();
  });

  it('should update a bunch children when the old list was empty', function () {
    const component = render([], ' the sloop');
    const updatedAttrs = [[renderChildSpan, 'hallo'], [renderChildSpan, 'basty'], [renderChildSpan, 'moose']];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    const childNodes = [...component.children()];
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    childNodes.length.should.equal(0);

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
    const updatedAttrs = [];
    render.call(component, updatedAttrs, ' the slap').should.equal(component);
    (component.firstChild() === component.lastChild() &&
      component.firstChild() === undefined).should.be.true();
    [...component.children()].should.eql([]);
    component.unmount.should.be.a.Function();
  });
});
