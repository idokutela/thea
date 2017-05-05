let toUnmount = [];
let waitingTimeout;

function unmountBatch() {
  waitingTimeout = undefined;
  const end = Date.now() + 100;
  let index = 0;
  while (Date.now() < end && index < toUnmount.length) {
    toUnmount[index].unmount(true);
    index += 1;
  }
  if (index < toUnmount.length) {
    toUnmount = toUnmount.slice(index);
    waitingTimeout = setTimeout(unmountBatch);
  }
}

export default function addToUnmount(nodes) {
  Array.prototype.push.apply(toUnmount, nodes);
  if (!waitingTimeout) {
    waitingTimeout = setTimeout(unmountBatch);
  }
}
