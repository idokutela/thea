// Moves an item at index i to index j in array. Assumes i and j are array indices
export default function moveEntry(array, i, j) {
  array.splice(j, 0, array.splice(i, 1)[0]);
  return array;
}
