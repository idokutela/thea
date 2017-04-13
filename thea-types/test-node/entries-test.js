import { set, entries, keys, toMap } from '../src/entries';

describe('entries tests', function () {
  it('should get the own keys of an object', function () {
    const e = { a: 12, b: 3 };
    keys(e).should.eql(['a', 'b']);
  });

  it('should get the own entries of an object', function () {
    const x = { a: 12, b: 3 };
    const e = entries(x);
    e.next.should.be.a.Function();
    [...e].should.eql([['a', 12], ['b', 3]]);
  });

  it('should set a value in an object', function () {
    const o = { a: 12 };
    set(o, 'r', 6).should.eql({ a: 12, r: 6 });
  });

  it('should turn a list of entries into a map', function () {
    const e = [['x', 12], ['hello', 'world']];
    const map = toMap(e);
    map.should.be.an.instanceOf(Map);
    map.size.should.equal(2);
    map.get('x').should.equal(12);
    map.get('hello').should.equal('world');
  });
});
