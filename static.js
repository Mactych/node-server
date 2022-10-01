const utils = require('./utilities.js');
const mime = require('./mime.js');
const etag = require('./etag.js');
const cache = require('./cache.js');
const fs = require("fs");

/**
 * @param {string} path
 * @param {string} directory
 * @public
 */
exports = module.exports = function(directory, options = {}) {
	const opts = {
		extension: true,
	};
	utils.copyProperties(options, opts, ["extension", "path"]);

	return function(req, res, next) {
		if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
		if (req.method === 'OPTIONS') return res.end();
		var file = {};
		file.directory = directory.endsWith('/') ? directory : directory + "/";
		file.original = req.path.startsWith('/') ? req.path.substring(1) : req.path;
		file.path = file.directory + decodeURIComponent(this.path ? file.original.substring(this.path.length - 1) : file.original);
		if (req.path.endsWith("/")) file.path += 'index.html';
		if (!fs.existsSync(file.path)) {
			if (opts.extension && fs.existsSync(file.path + '.html')) {
				file.path += '.html';
			} else {
				return next();
			}
		}
		const stat = fs.statSync(file.path);
		if (!file.path.endsWith('/') && stat.isDirectory()) {
			if (fs.existsSync(`${file.path}/index.html`)) {
				return res.redirect(req.path + '/');
			}
			return next();
		}
		const type = mime.lookup(file.path);
		if (type) res.setHeader('Content-Type', type)
		if (res.cache && cache.check(req, etag(stat, { weak: true }))) return;
		if (req.headers['range']) {
			const range = req.headers['range'];
			var [partialstart, partialend] = range.replace(/bytes=/, '').split('-');
			partialstart = parseInt(partialstart, 10);
			partialend = partialend ? parseInt(partialend, 10) : stat.size - 1;
			if (!isNaN(partialstart) && isNaN(partialend)) {
				partialstart = partialstart;
				partialend = stat.size - 1;
			}
			if (isNaN(partialstart) && !isNaN(partialend)) {
				partialstart = stat.size - partialstart;
				partialend = stat.size - 1;
			}
			if (partialstart >= stat.size || partialend >= stat.size) {
				res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
				return res.end();
			}
			res.writeHead(206, {
				'Content-Range': `bytes ${partialstart}-${partialend}/${stat.size}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': partialend - partialstart + 1,
			});
			if (req.method === 'HEAD') return res.end();
			const buffer = fs.createReadStream(file.path, { start: partialstart, end: partialend }).on('error', (e) => {
				return next();
			});
			buffer.pipe(res, { end: true });
		} else {
			res.writeHead(200, {
				'Content-Length': stat.size
			});
			if (req.method === 'HEAD') return res.end();
			const buffer = fs.createReadStream(file.path).on('error', (e) => {
				return next();
			});
			buffer.pipe(res, { end: true });
		}
	};
}