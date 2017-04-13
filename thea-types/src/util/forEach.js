export default function forEach(iter, doer) {
  const iterator = iter[Symbol.iterator]();

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
