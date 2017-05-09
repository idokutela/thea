import DOM from '../src/TheaDOM';
import '../src/DOMKnowledge';

describe('TheaDOM tests', function () {
  it('should create a DOM renderer', function () {
    const render = DOM('div');
    render.should.be.a.Function();
    DOM('div').should.equal(render);
    DOM('p').should.not.equal(render);
    DOM('DIV').should.equal(render);
  });

  it('should produce a dom node with the correct attributes and children and make a correct string', function () {
    const div = DOM('div');
    const br = DOM('br');
    const clickHandler = () => {};
    const attrs = {
      class: 'Bah<',
      CONTENTEDITABLE: '',
      toBeIgnored: undefined,
      children: [[br, {}]],
      onClick: clickHandler,
    };
    const component = div(attrs);
    component.toString().should.equal('<div class="Bah&lt;"contenteditable><br/></div>');
  });

  it('should make an stringigy a script tag', function () {
    const script = DOM('script');
    const attrs = { type: 'text/myscript', children: ['hello & bye', '<= 12 + 3', '\'">'] };
    const component = script(attrs);
    component.toString().should.equal('<script type="text/myscript">hello & bye<= 12 + 3\'"></script>');
  });

  it('should make an unescaped style tag', function () {
    const style = DOM('style');
    const attrs = { type: 'text/mystyle', children: ['hello & bye', '<= 12 + 3', '\'">'] };
    const component = style(attrs);
    component.toString().should.equal('<style type="text/mystyle">hello & bye<= 12 + 3\'"></style>');
  });
});
