const crypto = require('crypto');
const stats = require('fs').Stats;
exports = module.exports = function(entity, options = {}) {
	if (entity == null) throw new TypeError('etag() argument entity is required');
	const stat = isStat(entity);
	var weak = options && typeof options.weak === 'boolean' ? options.weak : stat;
	if (!stat && typeof entity !== 'string' && !Buffer.isBuffer(entity)) throw new TypeError('etag() argument entity must be string, Buffer, or fs.Stats');
	var tag = stat ? genStatTag(entity) : genTag(entity);
	return weak ? 'W/' + tag : tag;
}

function isStat(obj) {
	if (typeof Stats === 'function' && obj instanceof stats) {
		return true
	}
	return obj && typeof obj === 'object' &&
		'ctime' in obj && toString.call(obj.ctime) === '[object Date]' &&
		'mtime' in obj && toString.call(obj.mtime) === '[object Date]' &&
		'ino' in obj && typeof obj.ino === 'number' &&
		'size' in obj && typeof obj.size === 'number';
}

function genStatTag(entity) {
	var mtime = entity.mtime.getTime().toString(16);
	var size = entity.size.toString(16);
	return '"' + size + '-' + mtime + '"';
}

function genTag(entity) {
	if (entity.length === 0) return '\'0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\'';
	var hash = crypto.createHash('sha1').update(entity, 'utf8').digest('base64').substring(0, 27);
	var len = typeof entity === 'string' ? Buffer.byteLength(entity, 'utf8') : entity.length;
	return '"' + len.toString(16) + '-' + hash + '"';
}