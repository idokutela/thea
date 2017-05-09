// Adapted from https://medium.com/@TomazZaman/how-to-get-fast-unit-tests-with-out-webpack-793c408a076f

// Adapted from https://medium.com/@TomazZaman/how-to-get-fast-unit-tests-with-out-webpack-793c408a076f

import jsdom from 'jsdom';
import should from 'should';

// Environment setup (used by Babel as well, see .babelrc)
process.env.NODE_ENV = 'test';

// setup the simplest document possible
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

// set globals for mocha that make access to document and window feel
// natural in the test environment
global.document = doc;
global.window = win;
global.self = global;
global.should = should;

/**
 * Take all the properties of the window object and attach them to the mocha
 * global object. This is to prevent 'undefined' errors which sometime occur.
 * Gotten from: http://jaketrent.com/post/testing-react-with-jsdom/
 * @param  {object} window: The fake window, build by jsdom
 */
(window => Object
  .keys(window)
  .filter(k => Object.hasOwnProperty.call(window, k))
  .forEach(k => (k in global) || (global[k] = window[k]))
)(win);
