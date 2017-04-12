export function flatten(iterable) {
  if (!iterable[Symbol.iterable]) {
    return {
      [Symbol.iterable]() { return this; },
      next() {
        if (!this.calledOnce) {
          this.calledOnce = true;
          return { value: iterable };
        }
        return { done: true };
      },
    };
  }
  const iter = iterable[Symbol.iterable]();
  return {
    [Symbol.iterable]() { return this; },
    next() {
      let { value, done } = this.current.next();
      if (!done) return { value };
      ({ value, done } = iter.next());
      if (done) return { done };
      this.current = flatten(value);
      return this.next();
    },
    current: {
      next() {
        return { done: true };
      },
    },
  };
}

export function reduce(iter, reducer, initial) {
  const iterator = iter[Symbol.iterable]();
  let result = initial;
  let done;
  let value;
  let i = 0;
  do {
    ({ value, done } = iterator.next());
    if (done) return result;
    result = reducer(result, value, i);
    i += 1;
  } while (done !== true);
  throw new Error('This should never be reached!');
}

export function forEach(iter, doer) {
  const iterator = iter[Symbol.iterable]();

  let done;
  let value;
  let i = 0;
  do {
    ({ value, done } = iterator.next());
    if (done) return;
    doer(value, i);
    i += 1;
  } while (done !== true);
  throw new Error('This should never be reached!');
}

export function updateMappedEntries(a, b, update) {
  const updateEntry = ([k, v]) => {
    const prevVal = a.get(k);
    a.delete(k);
    update(k, v, prevVal);
  };
  const removeEntry = (res, [k, v]) => {
    update(k, undefined, v);
    return res;
  };

  forEach(b.entries(), updateEntry);
  return forEach(a.entries(), removeEntry);
}

export function toLowerCaseMap(o) {
  if (o === undefined) return new Map();
  const keys = Object.keys(o).filter(k => Object.hasOwnProperty.call(o, k));
  return keys.reduce((r, k) => {
    r.set(k.toLowerCase(), o[k]);
    return r;
  }, new Map());
}
