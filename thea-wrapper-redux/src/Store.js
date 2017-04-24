import view from 'thea/types/TheaView';
import { STORE } from './wrapper';

export default function Store({ children, store }, context) {
  const theContext = Object.assign({}, context, { [STORE]: store });

  if (this && this.unmount) {
    return view.call(this, children, theContext);
  }
  const result = Object.create(view.call(this, children, theContext));
  result.render = Store;
  return result;
}
