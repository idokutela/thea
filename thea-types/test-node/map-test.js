import map from '../src/map';

describe('map test', function () {
  it('should map an iterable', function () {
    function* tester() {
      yield 1;
      yield 2;
      yield 5;
    }

    const mapper = (x, i) => x + i;

    const res = [1, 3, 7];
    const iter = tester();
    [...map(iter, mapper)].should.eql(res);
  });

  it('should map an empty iterable', function () {
    const iter = [][Symbol.iterator]();

    const res = [];
    const mapper = (x, i) => x + i;
    [...map(iter, mapper)].should.eql(res);
  });
});
