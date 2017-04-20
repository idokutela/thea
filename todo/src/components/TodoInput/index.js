import view from 'thea';
import IconButton from '../IconButton';
import DoneAll from '../Icons/DoneAll';
import styles from './style.css';
import Input from '../Input';
import DeleteSweep from '../Icons/DeleteSweep';

export const render = ({
  noItems,
  addItem = () => {},
  markAllAsDone = () => {},
  deleteAll = () => {},
}) => (
  <div class={styles.container}>
    <IconButton onclick={markAllAsDone} disabled={noItems || undefined}><DoneAll /></IconButton>
    <Input placeholder="Add todo" onInput={addItem} value="" />
    <IconButton onclick={deleteAll} disabled={noItems || undefined}><DeleteSweep /></IconButton>
  </div>
);

export default view(render);
