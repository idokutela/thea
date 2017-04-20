import view from 'thea';
import TodoList from 'components/TodoList';
import makeStateful from 'wrappers/StatefulComponent';
import { compose } from 'util/functional';

import { makeStateUpdaters, stateToAttrs, initialState } from './stateManager';

/* eslint-disable no-shadow, no-param-reassign */
const render = ({ items, update }) => <TodoList items={items} {...makeStateUpdaters(update)} />;

export const ToDoWidget = compose(
  makeStateful(initialState, stateToAttrs),
  view,
)(render);


export default function mountOnNode(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) {
    throw new Error('Expected a node to mount the TodoList into.');
  }
  const inst = ToDoWidget.call(node.firstChild || undefined);
  if (!node.firstChild) {
    [...inst.children()].forEach(c => node.appendChild(c));
  }
}
