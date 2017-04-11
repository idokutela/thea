import extractType from './extractType';
import extractAttributes from './extractAttributes';
import extractKey from './extractKey';
import branchProcessor from './branchProcessor';
import eachProcessor from './eachProcessor';
import commentProcessor from './commentProcessor';
import componentProcessor from './componentProcessor';

const extractName = path => path.node.openingElement.name.name;

const specialNames = {
  branch: branchProcessor,
  comment: commentProcessor,
  component: componentProcessor,
  each: eachProcessor,
};

function processSpecialElements(t, path) {
  const name = extractName(path);
  if (specialNames[name]) {
    specialNames[name](t, path);
    return true;
  }
  return false;
}

const buildNode = (t, type, attrs, key) =>
  t.objectExpression(key ? [type, attrs, key] : [type, attrs]);

export default t => (path) => {
  if (!processSpecialElements(t, path)) {
    const type = extractType(t, path);
    const attrs = extractAttributes(t, path);
    const key = extractKey(t, path);
    path.replaceNode(buildNode(t, type, attrs, key));
  }
};
