import moveEntry from '../src/util/moveEntry';

describe('Move entry tests', function () {
  it('should move an entry later', function () {
    const array = [0, 1, 2, 3, 4];
    moveEntry(array, 1, 3);
    array.should.eql([0, 2, 3, 1, 4]);
  });

  it('should move an entry earlier', function () {
    const array = [0, 1, 2, 3, 4];
    moveEntry(array, 3, 1);
    array.should.eql([0, 3, 1, 2, 4]);
  });

  it('should move an entry in place', function () {
    const array = [0, 1, 2, 3, 4];
    moveEntry(array, 1, 1);
    array.should.eql([0, 1, 2, 3, 4]);
  });
});
