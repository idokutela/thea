import { insert, insertAll, remove } from '../src/dom/domUtils';

describe('Dom utils test', function () {
  afterEach(function () {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should insert correctly', function () {
    const n = document.createElement('div');
    const m = document.createElement('p');
    const q = document.createElement('q');
    insert(n, undefined, document.body);
    insert(m, undefined, document.body);
    insert(q, n);
    [...document.body.childNodes].should.eql([q, n, m]);
    [...document.body.childNodes].forEach(x => document.body.removeChild(x));
  });

  it('should insert all correctly', function () {
    const n = document.createElement('div');
    const m = document.createElement('p');
    const q = document.createElement('q');
    const iter = [m, n, q];
    insertAll(iter, undefined, document.body);
    [...document.body.childNodes].should.eql([m, n, q]);
    const a = document.createTextNode('Hello');
    const b = document.createComment('World');
    insertAll([a, b], n);
    [...document.body.childNodes].should.eql([m, a, b, n, q]);
    [...document.body.childNodes].forEach(x => document.body.removeChild(x));
  });

  it('should remove correctly', function () {
    const n = document.createElement('div');
    const m = document.createElement('p');
    const q = document.createElement('q');
    insertAll([m, n, q], undefined, document.body);
    remove(n);
    [...document.body.childNodes].should.eql([m, q]);
    [...document.body.childNodes].forEach(x => document.body.removeChild(x));
  });
});
