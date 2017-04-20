import view from 'thea';
import TodoWidget from 'components/TodoWidget';

import './style.css';

// todoContainer is in fact in the global namespace, but better be explicit
const todoContainer = document.getElementById('todoContainer');
TodoWidget(todoContainer);
