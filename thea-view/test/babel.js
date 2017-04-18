require('babel-core/register')({
  babelrc: false,
  presets: [['env', { targets: { node: 6.0 } }]],
});
