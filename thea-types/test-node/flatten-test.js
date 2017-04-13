import flatten from '../src/flatten';

describe('Flatten test', function () {
  it('should turn a value into an iterable', function () {
    [...flatten(2)].should.eql([2]);
  });

  it('should flatten an iterable', function () {
    [...flatten(([[], [[], '123', 2], 3, 4, [], [[[[5]]]], [], [6, 7, [8, 9, 10]]])[Symbol.iterator]())].should.eql(
      ['123', 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );
  });
});
