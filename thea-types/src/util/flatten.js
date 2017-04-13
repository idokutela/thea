export default function flatten(iterable) {
  if (!iterable[Symbol.iterator]) {
    return {
      [Symbol.iterator]() { return this; },
      next() {
        if (!this.calledOnce) {
          this.calledOnce = true;
          return { value: iterable };
        }
        return { done: true };
      },
    };
  }
  const iter = iterable[Symbol.iterator]();
  let current;
  let isDone;
  return {
    [Symbol.iterator]() { return this; },
    next() {
      if (isDone) return { done: true };
      if (!current) {
        const { value, done } = iter.next();
        if (done) {
          isDone = true;
          return { done: true };
        }

        if (!value[Symbol.iterator] || typeof value === 'string') {
          return { value };
        }
        current = flatten(value);
      }

      const { value, done } = current.next();
      if (!done) return { value };
      current = undefined;
      return this.next();
    },
    current: {
      next() {
        return { done: true };
      },
    },
  };
}
