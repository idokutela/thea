import view from 'thea';
import classnames from 'classnames';

import styles from './style.css';


export default view((attrs) => {
  const theAttrs = Object.assign({}, attrs);
  const { label, children, class: classes } = theAttrs;
  delete theAttrs.label;
  delete theAttrs.children;
  delete theAttrs.class;
  return (
    <button class={classnames(styles.button, classes)} {...theAttrs}>
      {children}
      <span class={styles.hidden}>{label}</span>
    </button>
  );
});
