const utils = require('./utilities.js');
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'PURGE'];

exports = module.exports = function(source) {
	source._stack = [];
	function add(method, route, path) {
		if (!method || !route) throw new TypeError('route._add() invalid options');
		const options = { method: method, route: route, path: path };
		if (source._path) options.path = source._path + path;
		return source._stack.push(options);
	}
	for (const method of methods) {
		source[method.toLowerCase()] = function() {
			if (typeof arguments[0] != 'string') throw TypeError('route.add() invalid path');
			if (typeof arguments[1] != 'function') throw TypeError('route.add() invalid route');
			add(method, arguments[1], arguments[0]);
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
	source._handle = async function(req, res) {
		for (const route of source._stack) {
			if (!route.method) {
				if (route.path && !utils.wildcard(route.path.toLowerCase(), req.path.toLowerCase())) continue;
				let next = false;
				await route.route.call(route, req, res, () => next = true);
				if (next) {
					continue;
				} else if (!next) {
					return true;
				}
			}
			if (req.method === 'OPTIONS') continue;
			let parsed = { path: route.path };
			if (route.path.includes(':')) {
				parsed = utils.params(route.path, req.path);
				if (parsed.params) req.params = parsed.params;
			}
			if (!utils.wildcard(parsed.path.toLowerCase(), (parsed.path.endsWith('/') ? req.path : (req.path.substr(1).endsWith('/') ? req.path.slice(0, -1) : req.path)).toLowerCase()) || parsed.valid == false) continue;
			if (route.method === req.method) {
				await route.route.call(route, req, res);
				return true;
			}
		}
		return false;
	}
	source.use = function() {
		if (typeof arguments[0] == 'string' && typeof arguments[1] == 'function') {
			source._stack.push({ path: source._path ? source._path + arguments[0] : arguments[0], route: arguments[1] });
			return;
		} else if (typeof arguments[0] == 'function') {
			source._stack.push({ route: arguments[0] });
			return;
		} else if (typeof arguments[0] == 'string' && typeof arguments[1] == 'object') {
			const route = arguments[1];
			route._path = arguments[0];
			for (const stack of route._stack) {
				if (stack.path) stack.path = route._path + stack.path;
			}
			source._stack = source._stack.concat(route._stack);
			route._stack = source._stack;
			return;
		} else if (typeof arguments[0]) {
			const route = arguments[0];
			source._stack = source._stack.concat(route._stack);
			route._stack = source._stack;
			return;
		}
	}
}