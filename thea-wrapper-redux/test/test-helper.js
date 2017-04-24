// Adapted from https://medium.com/@TomazZaman/how-to-get-fast-unit-tests-with-out-webpack-793c408a076f

import should from 'should';

// Environment setup (used by Babel as well, see .babelrc)
process.env.NODE_ENV = 'test';
