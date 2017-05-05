export const insert = (newNode, successor, parent = successor && successor.parentNode) => parent &&
  (successor ? parent.insertBefore(newNode, successor) : parent.appendChild(newNode));
export const remove = node => node && node.parentNode && node.parentNode.removeChild(node);
/* eslint-disable no-plusplus */
export const insertAll = (nodes, successor, parent = successor && successor.parentNode) => {
  if (!parent) return;
  if (!nodes.length) return;
  if (!successor) {
    for (let i = 0; i < nodes.length; i++) {
      parent.appendChild(nodes[i]);
    }
    return;
  }
  for (let i = 0; i < nodes.length; i++) {
    parent.insertBefore(nodes[i], successor);
  }
};
export function removeAll(start, end, parent) {
  if (!parent) {
    return;
  }
  const after = end.nextSibling;
  while (start.nextSibling !== after) {
    parent.removeChild(start.nextSibling);
  }
  parent.removeChild(start);
}
/* eslint-enable no-plusplus */
