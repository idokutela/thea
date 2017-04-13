import forEach from '../src/forEach';

describe('forEach test', function () {
  it('should run a function for each value of an iterable', function () {
    function* tester() {
      yield 1;
      yield 2;
      yield 5;
    }

    const arr = [];
    const doer = (x, i) => arr.push(x + i);
    const expected = [1, 3, 7];
    const iter = tester();
    forEach(iter, doer);
    arr.should.eql(expected);
  });

  it('should do nothing if an iterable is empty', function () {
    const iter = [][Symbol.iterator]();
    const arr = [];
    const doer = (x, i) => arr.push(x + i);
    const expected = [];
    forEach(iter, doer);
    arr.should.eql(expected);
  });
});
