import reduce from '../src/util/reduce';

describe('reduce test', function () {
  it('should reduce an iterable', function () {
    function* tester() {
      yield 1;
      yield 2;
      yield 5;
    }

    const res = 12;
    const reducer = (r, x, i) => x + r + i;
    const iter = tester();
    reduce(iter, reducer, 1).should.eql(res);
  });

  it('should reduce an empty iterable', function () {
    const iter = [][Symbol.iterator]();

    const res = 3;
    const reducer = (r, x, i) => x + r + i;
    reduce(iter, reducer, res).should.eql(res);
  });
});
