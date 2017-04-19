import view from 'thea';

import Input from '../TodoInput';
import Item from '../Item';
import styles from './style.css';

/* eslint-disable no-undef */
export const render = ({
  items = [],
  swapItems = () => {},
  updateItem = () => {},
  toggleDone = () => {},
  deleteItem = () => {},
  addItem = () => {},
  markAllAsDone = () => {},
}) => {
  const makeItem = (item, index) => Object.assign({}, item, {
    index,
    toggleDone: () => toggleDone(index),
    updateItem: value => updateItem(index, value),
    swapItems: () => swapItems(index),
    deleteItem: () => deleteItem(index),
  });

  const inputHandlers = {
    addItem: value => addItem(value),
    markAllAsDone,
  };

  return (
    <div class={styles.container}>
      <Input {...inputHandlers} />
      <ul class={styles.todos}>
        <each of={items.map(makeItem)} keyedBy={item => item.id}>
          <Item {...item} />
        </each>
      </ul>
    </div>
  );
};

export default view(render);
