const createDoctype = (
  typeof document !== 'undefined' &&
  document.implementation &&
  document.implementation.createDocumentType
) ?
  ({ name = 'html', publicId = '', systemId = '' }) =>
    document.implementation.createDocumentType(name, publicId, systemId) :
  () => {};

const NAME = Symbol('name');
const PUBLIC_ID = Symbol('publicId');
const SYSTEM_ID = Symbol('systemId');

const NODE = Symbol('node');

/**
 * The doctype component.
 */
export default function Doctype(attrs = {}) {
  const { name = 'html', publicId = '', systemId = '' } = attrs;
  let result = this;
  if (!result || !result.unmount) {
    result = {
      [NAME]: name,
      [PUBLIC_ID]: publicId,
      [SYSTEM_ID]: systemId,
      [NODE]: this || createDoctype(attrs),
      firstChild() { return this[NODE]; },
      lastChild() { return this[NODE]; },
      children() { return this[NODE] === undefined ? [] : [this[NODE]]; },
      toString() {
        const value = [];
        /* eslint-disable no-unused-expressions */
        this[NAME] && value.push(this[NAME]);
        this[PUBLIC_ID] && value.push(`PUBLIC "${this[PUBLIC_ID]}"`);
        this[SYSTEM_ID] && value.push(`"${this[SYSTEM_ID]}"`);
        /* eslint-enable no-unused-expressions */
        return `<!DOCTYPE ${value.join(' ')}>`;
      },
      unmount() {
        /* eslint-disable no-unused-expressions */
        this[NODE] &&
        this[NODE].parentNode &&
        this[NODE].parentNode.removeChild(this[NODE]);
        /* eslint-enable no-unused-expressions */
      },
      render: Doctype,
    };
    if (process.env.node_env !== 'production') {
      if (
        result[NODE] && (
          result[NODE].nodeType !== 10 ||
          result[NODE].name !== name ||
          result[NODE].publicId !== publicId ||
          result[NODE].systemId !== systemId
       )) {
        throw new Error(`Error reviving DOCTYPE.
Either attempting to revive on a non-doctype node, or with incorrect parameters.`);
      }
    }
  }
  if (process.env.node_env !== 'production') {
    if (
      name !== result[NAME] ||
      publicId !== result[PUBLIC_ID] ||
      systemId !== result[SYSTEM_ID]
    ) {
      throw new Error('Attempting to change DOCTYPE attributes. They are immutable.');
    }
  }
  return result;
}
