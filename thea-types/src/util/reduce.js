export default function reduce(iter, reducer, initial) {
  const iterator = iter[Symbol.iterator]();
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
