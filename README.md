# Thea
Thea is a javascript tiny library to create views.
It’s lightning fast and stupidly easy.

## The gist

```js
// Imports: don't worry about these for now.
import thea from 'thea';
import mountOnNode from 'thea-mount';
import connect from 'thea-wrapper-redux';

import store from '<somewhere>'; // Suppose we have some redux store

/*
 * Components are defined by rendering functions,
 * which are just functions of one variable that return JSX:
 */

const render = ({ value, increment, decrement }) => (
  <div>
    The counter is '{ value }'.
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
  </div>
);

/*
 * One turns rendering functions into stateless components
 * with thea:
 */
const StatelessCounter = thea(render);

/*
 * A component is just a function that controls a piece
 * of dom. For example:
 */
const activeCounter = StatelessCounter({
  value: 2
});

/*
 * makes an active <StatelessCounter>, with value two.
 * One can explicitly obtain an iterable of the nodes
 * it manages with the children method:
 */
console.log([...activeCounter.children()]);
// -> [<div>...</div>]

/*
 * One may thus mount the component by adding the children.
 * thea provides a utility method to save work:
 */
mountComponentOnNode(activeCounter, someNode);

/*
 * This does precisely the following:
 * ```
 * const documentFragment = document.createDocumentFragment();
 * [...activeCounter.children()].forEach(documentFragment.appendChild.bind(documentFragment));
 * someNode.appendChild(document);
 */


/*
 * For server side rendering, one can obtain a string representation using toString.
 * Any text is escaped.
 */
console.log(activeCounter.toString());
// -> <div>
//       The counter value is &quot;2&quot;.
//       <button>+</button>
//       <button>-</button>
//    </div>

/*
 * Components can also be revived on DOM as follows:
 */
const domNode = document.getElementById('DOMNode');
domNode.innerHTML = activeCounter.toString();
// One simply binds the rending function to the dom node that is the
// first rendered child
const activeCounter2 = StatelessCounter.call(domNode.firstChild, { value: 2 });

/*
 * activeCounter2 now manages the content of domNode.
 *
 * To update a component, simply call its rendering function
 * with 'this' bound to the active component:
 */
StatelessCounter.call(activeCounter2, { value: 3 });

// Now the node shows: The counter value is '3'

```
