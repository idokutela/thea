import toMap from '../src/util/toLowerCaseMap';

describe('toLowerCaseMap tests', function () {
  it('should take an object, lowercase the keys, and turn the result into a map', function () {
    const o = {
      aB: 3,
      CDE: 4,
      XQ: { eR: 12 },
    };
    const m = toMap(o);
    m.size.should.equal(3);
    m.get('ab').should.equal(3);
    m.get('cde').should.equal(4);
    m.get('xq').should.equal(o.XQ);
  });
});
