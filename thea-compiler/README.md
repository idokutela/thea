# babel-plugin-transform-thea-jsx
Turn JSX into Thea VDOM. By default, imports the
base Thea library automatically.

## Example
In
```js
var profile = <div>
  <img src="avatar.png" class="profile" />
  <h3>{[user.firstName, user.lastName].join(' ')}</h3>
</div>;
```

Out
```js
'use strict'

var ρ = require('thea');

var profile = [
  ρ.δ('div'), { children: [
    [ρ.δ('img'), { src: "avatar.png", class: "profile" }],
    [ρ.δ('h3'), { children: [[ρ.ε, [user.firstName, user.lastName].join(' ')]] }]
  ]}
]
```

## Custom
In
```js
/* @jsx T */
var profile = <div>
  <img src="avatar.png" class="profile" />
  <h3>{[user.firstName, user.lastName].join(' ')}</h3>
</div>;
```

Out
```js
'use strict'

var profile = [
  T.δ('div'), { children: [
    [T.δ('img'), { src: "avatar.png", class: "profile" }],
    [T.δ('h3'), { children: [[T.ε, [user.firstName, user.lastName].join(' ')]] }]
  ]}
]
```

**NB**: There is no automatic import if a custom name is set in the file.

## Installation

```
npm install --save-dev babel-plugin-transform-thea-jsx
```

## Usage

### Via `.babelrc` (Recommended)

Without options:

```json
{
  "plugins": ["transfrom-thea-jsx"]
}
```

With options:

```json
{
  "plugins": [
    ["transfrom-thea-jsx", {
      "pragma": "Thea"
    }]
  ]
}
```

### Via CLI

```
babel --plugins transform-thea-jsx script.js
```

### Via Node API

```js
require("babel-core").transform("code", {
  plugins: ["transform-thea-jsx"]
});
```

## Options

 - **`pragma`** : the name to use for Thea. Defaults to `ρ`. Thea will be imported under this name.
 - **`import`** : boolean flag whether to automatically import `thea`,
 - **`useHelper`**: boolean flag whether to use the babel helper to polyfill Object.assign. Defaults to false.

## References
This plugin is inspired by (transform-react-jsx)[https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx].
