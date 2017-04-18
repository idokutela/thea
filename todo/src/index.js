import view from 'thea';
import Item from './components/Item';
import './style.css';

const render = ({item = 'hello'}) => <Item item={item} />

const r = view(render);
const inst = r({ item: 'Hello' });
[...inst.children()].forEach(c => document.body.appendChild(c));
