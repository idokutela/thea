/* eslint-disable react/no-unknown-property, react/react-in-jsx-scope,
   react/jsx-filename-extension, react/prop-types */
import view from 'thea';
import styles from './style.css';
import Delete from '../Icons/Delete';
import Done from '../Icons/Done';
import Edit from '../Icons/Edit';

export const render = ({ item, deleteItem = () => {} }) => (
  <li class={styles.container}>
    <button onClick={deleteItem} class={styles.button}><Done /></button>
    <p class={styles.item} tabindex="0">{item}</p>
    <button onClick={deleteItem} class={styles.button}><Edit /></button>
    <button onClick={deleteItem} class={styles.button}><Delete /></button>
  </li>
);

export default view(render);
