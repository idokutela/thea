export default function reduce(iter, f) {
  const iterator = iter[Symbol.iterator]();
  let i = -1;
  let isDone = false;
  return {
    [Symbol.iterator]() { return this; },
    next() {
      if (isDone) return { done: true };
      const { value, done } = iterator.next();
      if (done) {
        isDone = true;
        return { done: true };
      }
      i += 1;
      return { value: f(value, i) };
    },
  };
}
