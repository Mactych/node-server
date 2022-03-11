/**
 * node-server - router.js
 * @author Mactych
 */

const utils = require('./utilities.js');
const mime = require('./mime.js');
const etag = require('./etag.js');
const cache = require('./cache.js');
const fs = require('fs');
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const router = exports = module.exports = function() {
  this._stack = [];
  for (const m of methods) {
    this[m.toLowerCase()] = function() {
      if (typeof arguments[0] != 'string') throw TypeError('route.add() invalid path');
      if (typeof arguments[1] != 'function') throw TypeError('route.add() invalid route');
      this.add(m, arguments[0], arguments[1]);
    }
  }
  /**
   * create a new middleware
   *
   * @param {function} middleware
   * @public
   */
  this.use = function() {
    if (typeof arguments[0] === 'object' && (arguments[0] && arguments[0]._stack)) {
      this._stack = this._stack.concat(arguments[0]._stack);
      arguments[0]._stack = this._stack;
      return;
    }
    if (typeof arguments[0] === 'string' && typeof arguments[1] === 'object' && arguments[1]._stack) {
      for (const r of arguments[1]._stack) if (r.path) r.path = arguments[0] + (r.path === '/' ? '' : r.path);
      this._stack = this._stack.concat(arguments[1]._stack);
      arguments[1]._path = arguments[0];
      arguments[1]._stack = this._stack;
      return;
    }
    if (typeof arguments[0] === 'string' && typeof arguments[1] === 'function' && !arguments[1]._stack) {
      this.add('MIDDLEWARE', arguments[0], arguments[1]);
      return;
    }
    if (typeof arguments[0] === 'function' && !arguments[0]._stack) {
      this.add('MIDDLEWARE', arguments[0]);
      return;
    }
    throw new TypeError('route.use() not a valid middleware or router to pass in');
  }
}

/**
 * add a route to the main stack
 *
 * @param {String} method
 * @param {String} path
 * @param {Object} route
 * @private
 */
router.prototype.add = function() {
  const options = { method: arguments[0] };
  if (typeof arguments[1] === 'string' && typeof arguments[2] === 'function') {
    // default
    options.path = this._path ? this._path + arguments[1] : arguments[1];
    options.route = arguments[2];
    if (options.method === 'MIDDLEWARE') options.path += '*';
  } else if (typeof arguments[1] === 'function') {
    options.route = arguments[1];
  }
  if (typeof arguments[0] === 'string') return this._stack.push(options);
  throw new TypeError('router._add() invalid options');
}
/**
 * deletes a route from the stack
 *
 * @param {string} method
 * @param {string} path
 * @private
 */
router.prototype.delete = function(method, path) {
  method = method.toUpperCase();
  if (method === 'MIDDLEWARE') throw TypeError('router._delete() cannot delete middlware');
  for (const index in this._stack) {
    const route = this._stack[index];
    if (route.method === method.toUpperCase() && route.path === path) {
      this._stack.splice(index, index + 1);
      break;
    }
  }
}
/**
 * handles the request
 *
 * @param {function} request
 * @param {function} response
 * @returns {bool} resolved
 * @private
 */
router.prototype.handle = async function(req, res) {
  for (const r of this._stack) {
    if (r.method === 'MIDDLEWARE') {
      if (r.path && !utils.wildcard(r.path, req.path)) continue;
      var next = false;
      await r.route.call(r, req, res, () => next = true);
      if (next) {
        continue;
      } else if (!next) {
        return true;
      }
    }
    if (req.method === 'OPTIONS') continue;

    var parsed = {path: r.path};
    if (r.path.includes(':')) {
      parsed = utils.params(r.path, req.path);
      if (parsed.path) path = parsed.path;
      if (parsed.params) req.params = parsed.params;
    }
    if (!utils.wildcard(parsed.path.endsWith('/') ? parsed.path.slice(0,-1) : parsed.path, (req.path.endsWith('/') ? req.path.slice(0,-1) : req.path))) continue;
    if (r.method === req.method) {
      await r.route.call(r, req, res);
      return true;
    }
  }
  return false;
};