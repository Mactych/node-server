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
      this._add(m, arguments[0], arguments[1]);
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
    if (typeof arguments[0] === 'string' && typeof arguments[1] === 'object' && (arguments[1] && arguments[1]._stack)) {
      for (const r of arguments[1]._stack) {
        if (r.path === '/') r.path = '';
        if (r.method != 'MIDDLEWARE') r.path = arguments[0] + r.path;
      }
      this._stack = this._stack.concat(arguments[1]._stack);
      arguments[1]._path = arguments[0];
      arguments[1]._stack = this._stack;
      return;
    }
    if (typeof arguments[0] === 'function' && !arguments[0]._stack) {
      this._add('MIDDLEWARE', arguments[0]);
      return;
    }
    throw new TypeError('route.use() not a valid middleware or router to pass in');
  }
  /**
   * @param {string} path
   * @param {string} directory
   * @public
   */
  this.static = function(path, directory, options = {}) {
    const opts = {
      requireHTMLExtension: true,
    };
    utils.copyProperties(options, opts, ["requireHTMLExtension"]);
    this.use(function(req, res, next) {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) || !req.path.startsWith(path)) return next();
      var urlPath = decodeURIComponent(req.path.substring(path.length) ? req.path.substring(path.length) : '/');
      var filePath = directory + (directory.endsWith('/') ? '' : '/') + urlPath;
      if (!filePath.startsWith('/')) filePath = '/' + filePath;
      if (filePath.endsWith('/')) filePath += 'index.html';
      if (!fs.existsSync(filePath)) {
        if (!opts.requireHTMLExtension && fs.existsSync(filePath + '.html')) {
          filePath += '.html';
        } else {
          return next();
        }
      }
      const stat = fs.statSync(filePath);
      if (!filePath.endsWith('/') && fs.statSync(filePath).isDirectory()) {
        if (!fs.existsSync(`${filePath}/index.html`)) return next();
        return res.redirect(urlPath + '/');
      }
      if (req.method === 'OPTIONS') return res.end();

      const type = mime.lookup(filePath);
      if (type) res.setHeader('Content-Type', type);

      if (res.cache && cache.check(req, etag(stat, { weak: true }))) return;
      if (req.headers['range']) {
        const range = req.headers['range'];
        const total = stat.size;
        var [partialstart, partialend] = range.replace(/bytes=/, '').split('-');
        partialstart = parseInt(partialstart, 10);
        partialend = partialend ? parseInt(partialend, 10) : total - 1;
        if (!isNaN(partialstart) && isNaN(partialend)) {
          partialstart = partialstart;
          partialend = total - 1;
        }
        if (isNaN(partialstart) && !isNaN(partialend)) {
          partialstart = total - partialstart;
          partialend = total - 1;
        }
        if (partialstart >= total || partialend >= total) {
          res.writeHead(416, { 'Content-Range': `bytes */${total}` });
          return res.end();
        }
        res.writeHead(206, {
          'Content-Range': `bytes ${partialstart}-${partialend}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': partialend - partialstart + 1,
        });
        const buffer = fs.createReadStream(filePath, { start: partialstart, end: partialend }).on('error', (e) => {
          return next();
        });
        if (req.method === 'HEAD') {
          console.log('static head');
          res.end();
          return;
        };
        buffer.pipe(res, { end: true });
      } else {
        res.writeHead(200, {
          'Content-Length': stat.size
        });
        const buffer = fs.createReadStream(filePath).on('error', (e) => {
          return next();
        });
        if (req.method === 'HEAD') {
          console.log('static head');
          res.end();
          return;
        };
        buffer.pipe(res, { end: true });
      }
    });
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
router.prototype._add = function() {
  const options = { method: arguments[0] };
  if (typeof arguments[1] === 'string' && typeof arguments[2] === 'function') {
    options['path'] = this._path ? this._path + arguments[1] : arguments[1];
    options['route'] = arguments[2];
  } else if (typeof arguments[1] === 'function') {
    options['route'] = arguments[1];
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
router.prototype._delete = function(method, path) {
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
router.prototype._handle = async function(req, res) {
  for (const r of this._stack) {
    if (r.method === 'MIDDLEWARE') {
      var next = false;
      await r.route(req, res, () => next = true);
      if (next) {
        continue;
      } else if (!next) {
        return true;
      }
    }
    if (req.method === 'OPTIONS') continue;
    
    var parsed = {};
    if (r.path.includes(':')) {
      parsed = utils.params(r.path, req.path);
      if (parsed.params) req.params = parsed.params;
    }
    if (!utils.wildcard((parsed.path ? parsed.path : r.path), (r.path.endsWith('/') ? req.path : (req.path.substr(1).endsWith('/') ? req.path.slice(0, -1) : req.path)))) continue;
    if (r.method === req.method) {
      await r.route(req, res);
      return true;
    }
  }
  return false;
};