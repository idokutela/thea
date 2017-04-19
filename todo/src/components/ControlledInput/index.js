import view from 'thea';

const base = view(attrs => <input {...attrs} />);

function render(attrs, context) {
  const theAttrs = Object.assign({}, attrs);
  theAttrs.oninput = (e) => {
    if (attrs.oninput) {
      attrs.oninput(e);
      return;
    }
    e.target.value = attrs.value;
    e.preventDefault();
  };
  theAttrs.ref = (ref) => {
    if (attrs.ref) {
      attrs.ref(ref);
    }
    const val = attrs.value || '';
    if (ref.value !== val) {
      ref.value = val; // eslint-disable-line
    }
  };
  return base.call(this, theAttrs, context);
}

export default render;
