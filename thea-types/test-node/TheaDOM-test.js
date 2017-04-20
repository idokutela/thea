import DOM from '../src/TheaDOM';

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
});
