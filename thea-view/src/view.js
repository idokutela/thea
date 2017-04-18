/**
 * Turns a jsDOM valued function into a component.
 */
export default function view(def) {
  return function render(attrs, context) {
    const [r, args] = def(attrs, context);
    return r.call(this, args, context);
  };
}
