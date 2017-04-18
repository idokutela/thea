import view from 'thea';
import './style.css';
import TodoList from './components/TodoList';
import Input from './components/TodoInput';

const items = [{
  item: 'Eat burger',
  id: 'burger',
}, {
  item: 'Work softly',
  id: 'soft',
}];

const render = () => (
  <TodoList items={items}/>
);

const r = view(render);
const inst = r({ item: 'Hello' });
[...inst.children()].forEach(c => document.body.appendChild(c));
