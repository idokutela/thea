/* eslint-disable no-unused-expressions, no-param-reassign */
import view from 'thea';
import classnames from 'classnames';

import IconButton from 'components/IconButton';
import Done from 'components/Icons/Done';
import Clear from 'components/Icons/Clear';
import ControlledInput from 'components/ControlledInput';
import { compose } from 'util/functional';
import makeStateful from 'wrappers/StatefulComponent';

import styles from './style.css';

import { initialState, stateToProps } from './state';


import makeFocusHandlers from './focusEvents';
import makeInputHandlers from './inputEvents';
import makeSetRef from './refs';

export const render = ({ disabled, value, placeholder, onInput, state }) => {
  const { valueChanged, isFocussed } = state;
  const { focus, blur } = makeFocusHandlers(state);
  const { accept, reject, handleInput, handleKeyDown } = makeInputHandlers(state, onInput);
  const setRef = makeSetRef(state);

  return (
    <span
      class={classnames(styles.container, isFocussed && styles.isFocussed)}
      ref={setRef('parent')} captureFocus={focus} captureBlur={blur}
    >
      <span class={styles.inputcontainer}>
        <ControlledInput
          type="text" class={styles.input} value={value} placeholder={placeholder}
          ref={setRef('input')} onkeydown={handleKeyDown} oninput={handleInput}
          disabled={disabled}
        />
      </span>
      <branch>
        <if test={valueChanged}>
          <IconButton label={'Accept'} onclick={accept} >
            <Done />
          </IconButton>
          <IconButton label={'Cancel'} onClick={reject} >
            <Clear />
          </IconButton>
        </if>
      </branch>
    </span>
  );
};

export default compose(
  makeStateful(initialState, stateToProps),
  view,
)(render);
