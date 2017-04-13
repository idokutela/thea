import updateEntries from '../src/util/updateEntries';

describe('updateEntries tests', function () {
  it('should call the diff function with the right values', function () {
    const prev = new Map([['f', 0], ['a', 2], ['c', 13], ['d', 1]]);
    const next = new Map([['c', 4], ['a', 2], ['x', 's']]);
    const result = [];
    const expected = [['c', 4, 13], ['a', 2, 2], ['x', 's', undefined], ['f', undefined, 0], ['d', undefined, 1]];
    const updater = (k, v1, v2) => result.push([k, v1, v2]);
    updateEntries(prev, next, updater);
    result.should.eql(expected);
  });
});
