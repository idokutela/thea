/**
 * Turns a jsDOM valued function into a component.
 */
export default function view(def) {
  return function render(attrs, context) {
    const [r, args] = def(attrs, context);
    if (!this || !this.unmount) {
      const retval = Object.create(r.call(this, args, context));
      retval.render = render;
      return retval;
    }
    return r.call(this, args, context);
  };
}
