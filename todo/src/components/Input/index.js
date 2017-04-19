import view from 'thea';
import classnames from 'classnames';

import IconButton from '../IconButton';
import Done from '../Icons/Done';
import Clear from '../Icons/Clear';
import styles from './style.css';
import makeStateful from '../../wrappers/StatefulComponent';
import ControlledInput from '../ControlledInput';

const stateToProps = (attrs, {
  input, update, currentValue, parent,
  isFocussed,
}) => Object.assign(
  {},
  attrs,
  { input, update, parent, isFocussed },
  (currentValue !== undefined && currentValue !== attrs.value)
    ? { value: currentValue, showButtons: currentValue.trim() !== attrs.value } : {},
);

const isDescendant = parent => function desc(node) {
  if (node === parent) return true;
  if (!node) return false;
  return desc(node.parentNode);
};

const isChildFocussed = parent => isDescendant(parent)(document.activeElement);

const focussed = { isFocussed: true };
const notfocussed = { isFocussed: false };
const initialState = notfocussed;

/* eslint-disable no-param-reassign, no-unused-expressions */
export default makeStateful(
  initialState,
  stateToProps,
)(view(({
  disabled,
  showButtons,
  value,
  placeholder,
  input,
  update,
  parent,
  oninput,
  isFocussed,
}) => {
  const accept = () => {
    showButtons && oninput && oninput(value);
    input && input.focus();
    update((s) => { delete s.currentValue; return s; });
  };
  const cancel = () => {
    input && input.focus();
    update((s) => { delete s.currentValue; return s; });
  };
  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 13: accept(); e.preventDefault(); break;
      case 27: cancel(); e.preventDefault(); break;
      default:
    }
  };
  const handleFocus = () => update(s => Object.assign(s, focussed));
  const handleBlur = () => parent && update &&
    setTimeout(() => !isChildFocussed(parent) &&
      update(s => Object.assign(s, notfocussed)), 50);

  return (
    <span
      class={classnames(styles.container, isFocussed && styles.isFocussed)}
      ref={el => parent !== el && update(s => Object.assign(s, { parent: el }))}
    >
      <span class={styles.inputcontainer}>
        <ControlledInput
          type="text"
          class={styles.input} value={value} placeholder={placeholder}
          ref={el => input !== el && update(s => Object.assign(s, { input: el }))}
          onkeydown={handleKeyDown}
          oninput={() =>
            input && update(s => Object.assign(s, {
              currentValue: input.value }))}
          onfocus={handleFocus}
          onblur={handleBlur}
          disabled={disabled}
        />
      </span>
      <branch>
        <if test={showButtons}>
          <IconButton
            label={'Accept'}
            onclick={accept}
            onblur={handleBlur}
          >
            <Done />
          </IconButton>
          <IconButton
            label={'Cancel'}
            onClick={cancel}
            onblur={handleBlur}
          >
            <Clear />
          </IconButton>
        </if>
      </branch>
    </span>
  );
}));
