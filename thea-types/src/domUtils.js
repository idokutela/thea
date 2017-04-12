export const insert = (newNode, successor, parent = successor && successor.parentNode) => parent &&
  (successor ? parent.insertBefore(newNode, successor) : parent.appendChild(newNode));
export const remove = node => node && node.parentNode && node.parentNode.removeChild(node);

export const insertAll = (nodes, successor, parent) =>
  [...nodes].forEach(node => insert(node, successor, parent));
