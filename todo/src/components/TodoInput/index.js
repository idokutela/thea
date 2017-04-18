/* eslint-disable react/no-unknown-property, react/react-in-jsx-scope,
   react/jsx-filename-extension, react/prop-types */
import view from 'thea';
import styles from './style.css';

export const render = () => (
  <div class={styles.container}>
    <input type="text" class={styles.input} placeholder="Add todo" />
  </div>
);

export default view(render);
