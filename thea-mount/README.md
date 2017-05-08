# thea-mount
An easy way to mount a component.

## Gist

```js
import renderInto from 'thea-mount';

/* The node the component should be mounted inside */
const mountNode = document.getElementById('mount');
// defines a renderer to render components into a node
const renderIntoNode = renderInto(mountNode);

/* Component is a component, attrs, context are defined somewhere... */
const component = renderIntoNode(<Component {...attrs} />, context);

// later, update the component
component.render(newAttrs);

// later, replace the component
const newComponent = renderIntoNode(<SomeOtherComponent {...someAttrs} />);

renderIntoNode.unmount(); // removes whatever is currently mounted
// Equivalent to renderIntoNode(), but the latter will warn in DEV
```

## Spec
### `renderInto(node:Node):(vdom: VDOM, context:?{}) => ActiveComponent`
Creates a renderer that renders a piece of vdom with the given context into
a node. If no component has been mounted, attempts to mount the component
on the first child of the node, and if this fails, clears the children of the
node and mounts it afresh. It returns the active component.

Calling the renderer with a new component unmounts the currently active component
and replaces it with the new component.

The renderer has a method unmount that will unmount whatever the renderer has
currently mounted on the node, and remove all the node’s children.
