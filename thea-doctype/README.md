# thea-doctype
A component that renders a doctype node.

Usage:

```js
import Doctype from 'thea-doctype';
import view from 'thea';

// For the standard <!DOCTYPE html>
const easyPage = (
  <view>
    <Doctype>
    <head>
      {/* ... */}
    </head>
    <body>
      {/* ... */}
    </body>
  </view>
);

export const view(easyPage);

// For a custom doctype
// In this case, renders
// <!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">
// ... rest of page

const customPage = (
  <view>
    <Doctype
      name="html"
      publicId="-//W3C//DTD HTML 4.01//EN"
      systemId="http://www.w3.org/TR/html4/strict.dtd"
    >
    <head>
      {/* ... */}
    </head>
    <body>
      {/* ... */}
    </body>
  </view>
);

export const finickyView = view(customPage);
```
