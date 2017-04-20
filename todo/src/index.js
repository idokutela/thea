import view from 'thea';

import TodoList from 'components/TodoList';
import makeStateful from 'wrappers/StatefulComponent';

import './style.css';

import makeStateUpdaters from './stateManager';

const mapStateToProps = (_, state) => state;
const initialState = { items: [] };

/* eslint-disable no-shadow, no-param-reassign */
const render = ({ items, update }) => <TodoList items={items} {...makeStateUpdaters(update)} />;

const r = makeStateful(initialState, mapStateToProps)(view(render));
const inst = r();
[...inst.children()].forEach(c => document.body.appendChild(c));
