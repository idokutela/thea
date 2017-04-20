import view from 'thea';

import Input from '../TodoInput';
import Item from '../Item';
import TodoZero from '../TodoZero';
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
  deleteAll = () => {},
}) => {
  const makeItem = (item, index) => Object.assign({}, item, {
    showSwitch: index !== items.length - 1,
    toggleDone: () => toggleDone(index),
    updateItem: value => updateItem(index, value),
    swapItems: () => swapItems(index),
    deleteItem: () => deleteItem(index),
  });

  const inputHandlers = {
    addItem: value => addItem(value),
    markAllAsDone,
    deleteAll,
  };

  return (
    <div class={styles.container}>
      <Input {...inputHandlers} noItems={!items.length} />
      <branch>
        <if test={items.length}>
          <ul class={styles.todos}>
            <each of={items.map(makeItem)} keyedBy={item => item.id}>
              <Item {...item} />
            </each>
          </ul>
        </if>
        <default>
          <TodoZero />
        </default>
      </branch>
    </div>
  );
};

export default view(render);
