import DOM from '../src/TheaDOM';
import { setUnmountListener } from '../src/common/unmountDaemon';
import { MOUNTED } from '../src/constants';

describe('TheaDOM tests', function () {
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

  beforeEach(function () {
    components = [];
  });

  afterEach(function () {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should create a DOM renderer', function () {
    const render = DOM('div');
    render.should.be.a.Function();
    DOM('div').should.equal(render);
    DOM('p').should.not.equal(render);
    DOM('DIV').should.equal(render);
  });

  it('should produce a dom node with the correct attributes and children', function () {
    const rdiv = DOM('div');
    const rp = DOM('p');
    const attrs = {
      class: 'Bah',
      CONTENTEDITABLE: '',
      children: [[rp, {}]],
    };
    const component = rdiv(attrs);
    [...component.children()].length.should.equal(1);
    component.firstChild().should.equal(component.lastChild());
    component.firstChild().tagName.should.equal('DIV');
    [...component.firstChild().childNodes].should.eql([document.createElement('P')]);
    component.firstChild().getAttribute('class').should.eql('Bah');
    component.firstChild().getAttribute('contenteditable').should.eql('');
    [...component.firstChild().attributes].length.should.equal(2);
  });

  it('should produce a dom node with the correct style', function () {
    const rdiv = DOM('div');
    const attrs = {
      style: {
        borderTop: '3px solid black',
        fontFamily: 'Roboto, serif',
        width: '10px',
      },
    };
    const component = rdiv(attrs);
    [...component.children()].length.should.equal(1);
    component.firstChild().should.equal(component.lastChild());
    component.firstChild().tagName.should.equal('DIV');
    [...component.firstChild().childNodes].should.eql([]);
    component.firstChild().style.borderTop.should.equal('3px solid black');
    component.firstChild().style.fontFamily.should.equal('Roboto, serif');
    component.firstChild().style.width.should.equal('10px');
  });

  it('should update the attrs correctly', function () {
    const rdiv = DOM('div');
    const attrs = {
      class: 'Bah',
      CONTENTEDITABLE: '',
      autofocus: '',
      children: [[renderChildP, 'fizz']],
    };
    const component = rdiv(attrs);
    const newAttrs = {
      class: 'Bee bah',
      tabindex: '-1',
      autofocus: undefined,
      children: [[renderChildP, 'bang']],
    };
    component.render(newAttrs, { a: 'fry' });
    [...component.children()].length.should.equal(1);
    component.firstChild().should.equal(component.lastChild());
    component.firstChild().tagName.should.equal('DIV');
    [...component.firstChild().childNodes].should.eql([components[0].firstChild()]);
    components[0].attrs.should.equal('bang');
    components[0].context.should.eql({ a: 'fry' });
    components.length.should.equal(1);
    component.firstChild().getAttribute('class').should.eql('Bee bah');
    component.firstChild().tabIndex.should.equal(-1);
    (component.firstChild().getAttribute('contenteditable') === null).should.be.true();
    (component.firstChild().getAttribute('autofocus') === null).should.be.true();
    [...component.firstChild().attributes].length.should.equal(2);
  });

  it('should update the style correctly', function () {
    const rdiv = DOM('div');
    const attrs = {
      style: {
        borderTop: '3px solid black',
        fontFamily: 'Roboto, serif',
        width: '10px',
      },
    };
    const component = rdiv(attrs);
    const newAttrs = {
      style: {
        borderTop: '1px dashed white',
        height: '2px',
        width: '10px',
      },
    };
    component.render(newAttrs);
    component.firstChild().style.borderTop.should.equal('1px dashed white');
    component.firstChild().style.fontFamily.should.equal('');
    component.firstChild().style.width.should.equal('10px');
    component.firstChild().style.height.should.equal('2px');
  });

  it('should call refs', function () {
    const div = DOM('div');
    let node;
    const attrs = { ref: n => (node = n) };

    const component = div(attrs);
    node.should.eql(component.firstChild());
  });

  it('should revive correctly', function () {
    const rdiv = DOM('div');
    const rp = DOM('p');
    const attrs = {
      class: 'Bah',
      CONTENTEDITABLE: '',
      children: [[rp, {}]],
    };
    document.body.appendChild(rdiv(attrs).firstChild());
    const component = rdiv.call(document.body.firstChild, attrs);
    [...component.children()].length.should.equal(1);
    component.firstChild().should.equal(component.lastChild());
    component.firstChild().tagName.should.equal('DIV');
    [...component.firstChild().childNodes].should.eql([document.createElement('P')]);
    component.firstChild().getAttribute('class').should.eql('Bah');
    component.firstChild().getAttribute('contenteditable').should.eql('');
    [...component.firstChild().attributes].length.should.equal(2);
  });

  it('should add event listeners on new mount', function () {
    const div = DOM('div');
    let node;
    let clicked = false;
    const listener = e => (e.target === node) && (clicked = !clicked);
    const attrs = { ref: n => (node = n), onclick: listener };

    div(attrs);
    node.click();
    clicked.should.be.true();
  });

  it('should add event listeners on updates', function () {
    const div = DOM('div');
    let node;
    let clicked = false;
    const listener = e => e.target === node && (clicked = !clicked);
    const attrs = { ref: n => (node = n) };

    const component = div(attrs);
    component.render({ onclick: listener });
    node.click();
    clicked.should.be.true();
  });

  it('should add event listeners on revive', function () {
    document.body.innerHTML = '<div></div>';
    const div = DOM('div');
    let clicked = false;
    const listener = e => (e.target === document.body.firstChild && (clicked = !clicked));
    const attrs = { onclick: listener };
    div.call(document.body.firstChild, attrs);
    document.body.firstChild.click();
    clicked.should.be.true();
  });

  it('should delete event listeners when not in attributes', function () {
    const div = DOM('div');
    let node;
    let clicked = false;
    const listener = e => (e.target === node.firstChild() && (clicked = !clicked));
    const attrs = { ref: n => (node = n), onclick: listener };

    const component = div(attrs);
    component.render({});
    node.click();
    clicked.should.be.false();
  });

  it('should update event listeners when the attributes change', function () {
    const div = DOM('div');
    let node;
    let clicked1 = false;
    let clicked2 = false;
    const listener1 = e => e.target && (clicked1 = !clicked1);
    const listener2 = e => e.target && (clicked2 = !clicked2);
    const attrs = { ref: n => (node = n), onclick: listener1 };

    const component = div(attrs);
    component.render({ onclick: listener2 });
    node.click();
    clicked1.should.be.false();
    clicked2.should.be.true();
  });

  it('should delete event listeners on unmount', function () {
    const div = DOM('div');
    let node;
    let clicked = false;
    const listener = e => e.target && (clicked = !clicked);
    const attrs = { ref: n => (node = n), onclick: listener };

    const component = div(attrs);
    const child = node;
    component.unmount();
    return new Promise(res => setTimeout(() => {
      (!(child.parentNode)).should.be.true();
      child.click();
      clicked.should.be.false();
      res();
    }));
  });

  it('should unmount itself from its parent', function () {
    const div = DOM('div');

    const component = div({});
    document.body.appendChild(component.firstChild());
    component.unmount();
    [...document.body.childNodes].length.should.equal(0);
  });

  it('should mount svg nodes correctly', function () {
    const svg = DOM('svg');
    const rect = DOM('rect');
    const rattrs = { x: '0', y: '0', width: '10', height: '10' };
    const attrs = { children: [[rect, rattrs]] };
    const s = svg(attrs);
    s.firstChild().getAttribute('xmlns').should.equal('http://www.w3.org/2000/svg');
    s.firstChild().namespaceURI.should.equal('http://www.w3.org/2000/svg');
    s.firstChild().firstChild.namespaceURI.should.equal('http://www.w3.org/2000/svg');
  });

  it('should capture events', function () {
    const p = DOM('p');
    const input = DOM('input');
    let focussed = false;
    let node;
    const iattrs = { ref: el => (node = el) };
    const pattrs = { children: [[input, iattrs]], capturefocus: () => (focussed = true) };
    p(pattrs);
    node.focus();
    focussed.should.be.true();
  });

  it('shoud add capturers on revived nodes', function () {
    const p = DOM('p');
    const input = DOM('input');
    let focussed = false;
    let node;
    const iattrs = { ref: el => (node = el) };
    const pattrs = { children: [[input, iattrs]] };
    const parent = p(pattrs).firstChild();
    pattrs.capturefocus = () => (focussed = true);
    node.focus();
    focussed.should.be.false();
    p.call(parent, pattrs);
    node.focus();
    focussed.should.be.true();
  });

  it('shoud update capturers when a capturer is added late', function () {
    const p = DOM('p');
    const input = DOM('input');
    let focussed = false;
    let node;
    const iattrs = { ref: el => (node = el) };
    const pattrs = { children: [[input, iattrs]] };
    const parent = p(pattrs).firstChild();
    node.focus();
    focussed.should.be.false();
    pattrs.capturefocus = () => (focussed = true);
    p.call(parent, pattrs);
    node.focus();
    focussed.should.be.true();
  });

  it('should update capturers when a capturer is changed', function () {
    const p = DOM('p');
    const input = DOM('input');
    let node;
    let focussed1 = false;
    let focussed2 = false;
    const listener1 = e => e.target && (focussed1 = !focussed1);
    const listener2 = e => e.target && (focussed2 = !focussed2);
    const iattrs = { ref: el => (node = el) };
    const pattrs = { children: [[input, iattrs]], capturefocus: listener1 };

    const component = p(pattrs);
    const pattrs2 = { children: [[input, iattrs]], capturefocus: listener2 };
    component.render(pattrs2);
    node.focus();
    focussed1.should.be.false();
    focussed2.should.be.true();
  });

  it('should update capturers when a capturer is removed', function () {
    const p = DOM('p');
    const input = DOM('input');
    let node;
    let focussed = false;
    const listener = e => e.target && (focussed = !focussed);
    const iattrs = { ref: el => (node = el) };
    const pattrs = { children: [[input, iattrs]], capturefocus: listener };

    const component = p(pattrs);
    delete pattrs.capturefocus;
    component.render(pattrs);
    node.focus();
    focussed.should.be.false();
  });

  it('should remove capturers on unmount', function () {
    const p = DOM('p');
    const input = DOM('input');
    let node;
    let focussed = false;
    const listener = e => e.target && (focussed = !focussed);
    const iattrs = { ref: el => (node = el) };
    const pattrs = { children: [[input, iattrs]], capturefocus: listener };
    const component = p(pattrs);
    component.unmount();
    return new Promise(res => setTimeout(() => {
      node.focus();
      focussed.should.be.false();
      res();
    }));
  });

  it('should make an unescaped script tag', function () {
    const script = DOM('script');
    const attrs = { type: 'text/myscript', children: ['hello & bye', '<= 12 + 3', '\'">'] };
    const component = script(attrs);
    const node = component.firstChild();
    node.nodeType.should.equal(window.Node.ELEMENT_NODE);
    node.tagName.toLowerCase().should.equal('script');
    node.getAttribute('type').should.equal('text/myscript');
    node.textContent.should.equal('hello & bye<= 12 + 3\'">');
    component.attrs.should.eql(attrs);
    const newAttrs = { type: 'text/ms', children: ['a'] };
    component.render(newAttrs);
    node.getAttribute('type').should.equal('text/ms');
    node.textContent.should.equal('a');

    const componentCopy = script.call(node, newAttrs);
    componentCopy.should.not.equal(component);
    componentCopy.firstChild().should.equal(node);
    node.getAttribute('type').should.equal('text/ms');
    node.textContent.should.equal('a');
  });

  it('should make an unescaped style tag', function () {
    const style = DOM('style');
    const attrs = { type: 'text/mystyle', children: ['hello & bye', '<= 12 + 3', '\'">'] };
    const component = style(attrs);
    const node = component.firstChild();
    node.nodeType.should.equal(window.Node.ELEMENT_NODE);
    node.tagName.toLowerCase().should.equal('style');
    node.getAttribute('type').should.equal('text/mystyle');
    node.textContent.should.equal('hello & bye<= 12 + 3\'">');
    component.attrs.should.eql(attrs);
    const newAttrs = { type: 'text/ms', children: ['a'] };
    component.render(newAttrs);
    node.getAttribute('type').should.equal('text/ms');
    node.textContent.should.equal('a');

    const componentCopy = style.call(node, newAttrs);
    componentCopy.should.not.equal(component);
    componentCopy.firstChild().should.equal(node);
    node.getAttribute('type').should.equal('text/ms');
    node.textContent.should.equal('a');
  });

  it('should eventually unmount fully', function () {
    const p = DOM('p');
    const div = DOM('div');
    const attrs = { children: [[p], [p]] };
    const component = div(attrs);
    const childComponents = component[MOUNTED].childComponents;
    document.body.appendChild(component.firstChild());
    let resolvePromise;
    const afterUnmountPromise = new Promise((res) => {
      resolvePromise = res;
    });
    setUnmountListener(() => {
      childComponents.length.should.equal(2);
      childComponents[0].isMounted().should.be.false();
      childComponents[1].isMounted().should.be.false();
      component.isMounted().should.be.false();
      setTimeout(resolvePromise, 10);
    });
    component.unmount();
    return afterUnmountPromise;
  });
});
