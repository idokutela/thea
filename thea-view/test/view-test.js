import view from '../src/view';

describe('view test', function () {
  it('should correctly render a view', function () {
    const save = [];
    const render = function (attrs, context) {
      save.push([this, attrs, context]);
      return { render };
    };
    const def = x => [render, `attrs: ${x}`];
    const r = view(def);
    r.call('a', 'b', 'c');
    save.should.eql([['a', 'attrs: b', 'c']]);
  });

  it('should return a component with the same render as the view.', function () {
    const save = [];
    const render = function (attrs, context) {
      save.push([this, attrs, context]);
      return { render };
    };
    const def = x => [render, `attrs: ${x}`];
    const r = view(def);
    const comp = r.call('a', 'b', 'c');
    comp.render.should.equal(r);
  });
});
