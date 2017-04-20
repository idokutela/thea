/* eslint-disable no-unused-expressions */
import { set, unset } from '../../util/functional';

export default function makeInputHandlers(state, onInput = () => {}) {
  const { valueChanged, update, input, currentValue } = state;

  const accept = () => {
    valueChanged && onInput && onInput(currentValue); // Only alert if the value has changed
    input && input.focus();
    update(unset('currentValue'));
  };
  const reject = () => {
    input && input.focus();
    update(unset('currentValue'));
  };
  const handleInput = e => update(set('currentValue', e.target.value));
  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 13: accept(); e.preventDefault(); break;
      case 27: reject(); e.preventDefault(); break;
      default:
    }
  };

  return { accept, reject, handleInput, handleKeyDown };
}
