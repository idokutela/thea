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

export function diffMaps(a, b) {
  const diffEntry = (res, [k, v]) => {
    const aval = a.get(k);
    a.delete(k);
    if (v !== aval) res.set(k, [v, aval]);
    return res;
  };
  const removeEntry = (res, k) => {
    res.set(k, [undefined]);
    return res;
  };

  const result = reduce(b.entries(), diffEntry, new Map());
  return reduce(a.keys(), removeEntry, result);
}

export function toMap(o) {
  const keys = Object.keys(o).filter(k => Object.hasOwnProperty.call(o, k));
  return keys.reduce((r, k) => {
    r.set(k, o[k]);
    return r;
  }, new Map());
}
