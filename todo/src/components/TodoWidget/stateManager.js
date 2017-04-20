let lastId = 0;
const uid = () => ++lastId; // eslint-disable-line

export const stateToAttrs = (_, state) => state;
export const initialState = { items: [] };

export function makeStateUpdaters(update) {
  const swapItems = n => update((state) => {
    const oldItems = state.items;
    const items = oldItems.slice();
    items[n] = oldItems[n + 1];
    items[n + 1] = oldItems[n];
    return Object.assign({}, state, { items });
  });
  const updateItem = (n, value) => update(
    (state) => {
      const oldItems = state.items;
      const items = oldItems.slice();
      items[n] = Object.assign({}, oldItems[n], { value });
      return Object.assign({}, state, { items });
    },
  );
  const toggleDone = n => update(
    (state) => {
      const oldItems = state.items;
      const items = oldItems.slice();
      items[n] = Object.assign({}, oldItems[n], { done: !items[n].done });
      return Object.assign({}, state, { items });
    },
  );
  const deleteItem = n => update(
    (state) => {
      const items = state.items.slice(0, n).concat(state.items.slice(n + 1));
      return Object.assign({}, state, { items });
    },
  );
  const addItem = value => update(
    (state) => {
      const items = state.items.concat({ value, id: uid() });
      return Object.assign({}, state, { items });
    },
  );
  const markAllAsDone = () => update(
    state => Object.assign(
      {}, state, { items: state.items.map(x => Object.assign(x, { done: true })) },
    ),
  );
  const deleteAll = () => update(
    state => Object.assign(
      {}, state, { items: [] },
    ),
  );
  return {
    swapItems, updateItem, toggleDone, deleteItem, addItem, markAllAsDone, deleteAll,
  };
}
