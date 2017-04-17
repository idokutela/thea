# Thea (Θέα): a static component toolkit
Thea is a javascript tiny library to create views.
It’s lightning fast and stupidly easy.

## Components
Components are defined by their *renderer* a function that takes
attributes and a rendering context, and updates DOM accordingly.
It returns any internal state it might need for future updates.

Thea’s basic philosophy is that views are built by composing
components. Thea sees components as completely defined by their render function.
This is a function of two variables:

 - `attrs:Object` - parameters related to the immediate rendering
   of the component,
 - `context:Object` - provides a “rendering context” for a component.

The rendering function _always_ returns an active component:
an object that encapsulates all of the current component state.

BLA

## Built in components
Thea provides a small set of built in components. All ignore the context.
They are exposed by importing `thea/types`, and may also be imported individually
under `thea/types/component`.


### `TheaText`
Renders a text node - takes a string as its `attrs`. Does not accept children. It always escapes its content.

###`TheaComment`
Renders an HTML comment. May only have text as children. Content is escaped.

### `TheaView`
Renders a fixed list of components without a containing DOM element.

### `TheaDOM(tag:string)`
Renders a DOM element. The `attrs` are any attributes of that tag,
along with a 'children' attribute that must be an array of components. Attribute values are escaped!

### `TheaKeyedChildren`
Renders a keyed array of children. The `attrs` is an array of keyed vdom elements.

### `TheaUnkeyedChildren`
Renders an unkeyed array of children. The `attrs` is an array of vdom elements.


## JSX and built in components
The easiest way to write VDOM is with JSX. The Babel plugin
`babel-plugin-transform-thea-jsx` then turns it into VDOM.

The Thea components never have to be referred to directly:
the plugin figures out which ones you mean.

For example,

```js
//...
const x = <div>Hello {location}</div>;
//...
```

turns into

```js
var TheaDOM = require('thea/types/TheaDOM'),
    TheaText = require('thea/types/TheaText'),
    TheaKeyedChildren = require('thea/types/TheaKeyedChildren');

// ...
const x = [TheaDOM('div'), { children: [[TheaText, 'Hello '], [TheaKeyedChildren, location]] }];
// ...
```

The JSX transpiler interprets a few elements specially:

### `<view>`
Becomes `TheaView`.
### `<comment>`
Becomes `TheaComment`.
### `<each>`
Loops through an iterable, providing a copy of its children for each item.

Has attributes
  - `of:iterable` - the iterable to loop through,
  - `item:string` - the name of the identifier that refers to the current item. Defaults to `item`.
  - `keyedBy:(item, iterCount) -> expression` - computes the key for the item. Defaults to the iteration count.
     Must be unique for each item in the iterable!

Example:

```js
<each item='article' of={articles} keyedBy={article => article.id}>
  <Article {...article} />
</each>
```

### `<branch>/<if>/<default>`
`<branch>` renders different branches depending on which
condition is satisfied. Conditions are specified by `<if test={expression}>` and
are evaluated in order. The first to be satisfied is taken. If a `<default>` child
is present, it is taken if no condition is satisfied. A `<default>` must be the last
child if present.

Example:

```js
<branch>
  <if test={showMercy}>👍</if>
  <default>👎</default>
</branch>
```

If no condition is satisfied, a comment placeholder is rendered.

### One last differences to React JSX
Thea doesn’t hold truck with the `className` sillyness. The class
of an element is simply called `class`:

```js
<p class="superHappy">Yeah!</p>
```

## Building components
Thea provides a single function `makeComponent` that
turns a function `(attrs, context?) => VDOM` into a component.
The easiest way to make such a function is as a simple arrow:

```js
const article = attrs => (
  <article>
    <h1>{attrs.title}!</h1>
    <h2>Published {attrs.date}</h2>
    <section>{attrs.content}</section>
  </article>
);
```
