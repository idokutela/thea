/* eslint-disable react/no-unknown-property, react/react-in-jsx-scope,
   react/jsx-filename-extension, react/prop-types */
import view from 'thea';
import styles from './style.css';
import CrossIcon from '../CrossIcon/index';

export const render = ({ item, deleteItem = () => {} }) => (
  <div>
  <li class={styles.container}>
    <p class={styles.item}>{item}</p>
    <button onClick={deleteItem} class={styles.button}><CrossIcon /></button>
  </li>
  <svg width="500px" height="200px" viewBox="0 0 10 10">
    <rect fill="#ccc" x="0" y="0" width="10" height="10" />
  </svg>
  </div>
);

export default view(render);
