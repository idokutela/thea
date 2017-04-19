import view from 'thea';
import IconButton from '../IconButton';
import DoneAll from '../Icons/DoneAll';
import styles from './style.css';
import Input from '../Input';

export const render = ({ addItem = () => {}, markAllAsDone = () => {} }) => (
  <div class={styles.container}>
    <IconButton onclick={markAllAsDone}><DoneAll /></IconButton>
    <Input placeholder="Add todo" oninput={addItem} value="" />
  </div>
);

export default view(render);
