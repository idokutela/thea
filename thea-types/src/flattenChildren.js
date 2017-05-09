import TheaText from './TheaText';
import { TRANSPARENT } from './constants';

const normaliseChild = (r, child) => {
  if (child === null || child === undefined || child === true || child === false) return r;
  if (!Array.isArray(child)) return r.concat([[TheaText, String(child)]]);
  if (child[0][TRANSPARENT]) {
    return r.concat(flattenChildren(child[1])); // eslint-disable-line
  }
  return r.concat([child]);
};

function flattenChildren(children) {
  let result = children;
  if (!Array.isArray(children)) {
    result = [children];
  } else if (typeof children[0] === 'function') {
    result = [children];
  }
  result = result
    .reduce(normaliseChild, []);
  return result;
}

export default flattenChildren;
