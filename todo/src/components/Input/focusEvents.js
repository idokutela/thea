import { set } from '../../util/functional';

const isDescendant = parent => function desc(node) {
  if (node === parent) return true;
  if (!node) return false;
  return desc(node.parentNode);
};

const isChildFocussed = parent => isDescendant(parent)(document.activeElement);


export default function makeFocusHandlers({
  update, parent, isFocussed,
}) {
  function focus() {
    if (isFocussed) return;
    update(set('isFocussed', true));
  }

  function blur() {
    requestAnimationFrame(() => {
      if (isFocussed && !isChildFocussed(parent)) {
        update(set('isFocussed', false));
      }
    });
  }

  return { focus, blur };
}
