import view from '../src/view';

describe('view test', function () {
  it('should correctly render a view', function () {
    const save = [];
    const render = function (attrs, context) { save.push([this, attrs, context]); };
    const def = x => [render, `attrs: ${x}`];
    const r = view(def);
    r.call('a', 'b', 'c');
    save.should.eql([['a', 'attrs: b', 'c']]);
  });
});
