import { unset, set, get, compose } from '../functional';

describe('functional helpers tests', function () {
  it('should compose functions correctly', function () {
    const f = x => x * x;
    const g = x => x + 2;
    const h = compose(f, g);
    h(3).should.equal(f(g(3)));
  });

  it('should make a setter', function () {
    set('x', 4)({ z: 3 }).should.eql({ x: 4, z: 3 });
  });

  it('should make an unsetter', function () {
    unset('x')({ z: 2, x: 4 }).should.eql({ z: 2 });
  });

  it('should make a getter', function () {
    get('x')({ x: 3 }).should.equal(3);
  });
});
