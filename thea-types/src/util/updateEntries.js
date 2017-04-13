import forEach from './forEach';

export default function updateEntries(a, b, update) {
  const updateEntry = ([k, v]) => {
    const prevVal = a.get(k);
    a.delete(k);
    update(k, v, prevVal);
  };
  const removeEntry = ([k, v]) => update(k, undefined, v);

  forEach(b.entries(), updateEntry);
  return forEach(a.entries(), removeEntry);
}
