/* eslint-disable react/no-unknown-property, react/react-in-jsx-scope,
   react/jsx-filename-extension, react/prop-types */
import view from 'thea';

import Input from '../TodoInput';
import Item from '../Item';
import styles from './style.css';

export const render = ({ items = [] }) => (
  <div class={styles.container}>
    <Input />
    <ul class={styles.todos}>
      <each of={items} keyedBy={item => item.id}>
        <Item {...item} />
      </each>
    </ul>
  </div>
);

export default view(render);
