const isInBrowser = typeof window !== 'undefined';

function removeAllChildren(node) {
  node.textContent = ''; // eslint-disable-line
}

export default function renderInto(node) {
  if (process.env.node_env !== 'production') {
    if (!isInBrowser) {
      throw new Error('renderIntoNode can only be used in a browser.');
    }
    if (!node || !node.nodeType || node.nodeType !== window.Node.ELEMENT_NODE) {
      throw new Error('renderIntoNode: Expected an element node to mount components into.');
    }
  }

  let currentComponent;

  function unmount() {
    currentComponent && currentComponent.unmount(); // eslint-disable-line
    removeAllChildren(node);
  }

  function render([Component, attrs] = [], context) {
    if (!Component) {
      if (process.env.node_env !== 'production') {
        console.warn( // eslint-disable-line
          'renderIntoNode called without arguments. Unmounting current component.',
        );
      }
      currentComponent && currentComponent.unmount(); // eslint-disable-line
      removeAllChildren(node);
      return undefined;
    }

    if (currentComponent) {
      if (currentComponent.render === Component) {
        currentComponent = currentComponent.render(attrs, context);
        return currentComponent;
      }

      currentComponent.unmount();

      if (process.env.node_env !== 'production') {
        if (node.firstChild) {
          throw new Error(`The previous component ${currentComponent.render.name} did not completely unmount`);
        }
      }

      removeAllChildren(node);
      currentComponent = undefined;
    }

    if (node.firstChild) {
      try {
        currentComponent = Component.call(node.firstChild, attrs, context);
        return currentComponent;
      } catch (e) {
        if (process.env.node_env !== 'production') {
          console.warn( // eslint-disable-line
            `mounting ${Component.name} onto a node with children failed. Removing all children and trying again.`,
          );
        }
        removeAllChildren(node);
        currentComponent = undefined;
      }
    }
    currentComponent = Component(attrs, context);
    const children = currentComponent.children();
    for (let i = 0; i < children.length; i++) { // eslint-disable-line
      node.appendChild(children[i]);
    }

    return currentComponent;
  }

  render.unmount = unmount;

  return render;
}
