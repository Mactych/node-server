/**
 * node-server - cookie.js
 * @author Mactych
 */

const utils = require("./utilities.js");

exports = module.exports = function(req, res, next) {
	res.removeCookie = function(key, path, domain) {
		if (!key) throw new TypeError('res.removeCookie() argument key is required');
		const options = [];
		options.push(`${key}=`);
		options.push(`Max-Age=0`);
		if (path) options.push(`Path=${path}`);
		if (domain) options.push(`Domain=${domain}`);
		req.cookieQueue = (req.cookieQueue ? req.cookieQueue : []);
		req.cookieQueue.push(options.join('; '));
		this.setHeader("set-cookie", req.cookieQueue);
	}
	res.setCookie = function(options, value) {
		if (!options) throw new TypeError('res.setCookie() argument options is required');
		if (!value) throw new TypeError('res.setCookie() argument value is required');
		if (value.length > 4000) throw new TypeError('res.setCookie value must be below 4kb');
		const payload = [];
		const opts = {
			value: value,
			path: "/",
			// key: "",
			// path: "/", // Header: Path
			// age: 0, // Header: Max-Age
			// domain: "", // Header: Domain
			// expire: "" // Header: Expires
			// secure: true // Header: Secure
			// samesite: '' // Header: SameSite
		}
		if (typeof options === 'string') opts.key = options;
		if (typeof options === 'object') {
			utils.copyProperties(options, opts, ['key', 'path', 'age', 'domain', 'expires', 'secure', 'samesite']);	
			if (!opts.key) throw new TypeError('res.setCookie() argument options.key is required');
		}
		payload.push(opts.key + '=' + opts.value);
		if (opts.path) payload.push('Path=' + opts.path);
		if (opts.age) payload.push('Max-Age=' + opts.age);
		if (opts.domain) payload.push('Domain=' + opts.domain);
		if (opts.expire) payload.push('Expires=' + new Date(Date.now() + (parseInt(opts['expire']) * 1000).toUTCString()));
		if (opts.secure) payload.push('Secure');
		if (opts.samesite) payload.push('SameSite=' + opts.samesite[0].toUpperCase() + opts.samesite.substring(1));
		req.cookieQueue = (req.cookieQueue ? req.cookieQueue : []);
		req.cookieQueue.push(payload.join("; "));
		this.setHeader("set-cookie", req.cookieQueue);
	}
	next();
}