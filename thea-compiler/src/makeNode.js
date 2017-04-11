import * as t from 'babel-types';

const stringToMember = (s, start) => s
  .split('.')
  .map(name => t.identifier(name))
  .reduce((o, p) => (o ? t.memberExpression(o, p) : p), start);

export const TH = thea => exp => stringToMember(exp, thea);

export default (type, attrs, key) => {
  const props = [
    type, attrs,
  ];
  if (key) {
    props.push(key);
  }

  return t.arrayExpression(props);
};
