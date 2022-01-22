/**
 * node-server - cache.js
 * @author Mactych
 */

const utils = require('./utilities.js');

exports = module.exports = function(res, options = {}) {
	if (!res) throw new TypeError('cache() argument res is required');
	if (!options || typeof options != 'object') throw new TypeError('cache() argument options is required');
	const opts = {
		validate: true,
		transform: true,
		private: false,
	};
	utils.copyProperties(options, opts, ['validate', 'transform', 'private', 'duration']);
	res.cache = opts;
	var cache_control = '';
	if (opts['duration']) cache_control += `max-age=${opts['duration']},`;
	cache_control += (opts['private'] ? 'private' : 'public') + ',';
	if (opts['validate']) {
		cache_control += 'no-cache,';
		cache_control += 'must-revalidate,';
	}
	if (!opts['transform']) cache_control += 'no-transform,';
	res.setHeaders({ 'Cache-Control': cache_control.slice(0, -1), 'Expires': new Date(Date.now() + (parseInt(opts['duration']) * 1000)).toUTCString() });
	return;
}
exports.check = function(req, etag) {
	req.res.setHeaders({ 'Etag': etag });
	if (req.headers['if-none-match']) {
		if (etag === '*' || etag === req.headers['if-none-match']) {
			req.res.writeHead(304);
			req.res.end();
			return true;
		}
	}
}

/* expires
	date the web cache expires
*/

/* cache-control: 'no-store'
	instructs web caches not to store any version of the resource under any circumstances;
*/

/* cache-control: 'no-cache'
	tells the web cache that it must validate the cached content with the origin server before serving it to users
*/

/* cache-control: 'max-age'
	sets the maximum amount of time that the cache can keep the saved resource before re-downloading it or revalidating it with the origin server. It takes its value in seconds. For example, cache-control: max-age= 31536000 (which is the max value) tells the web cache that the resource must be considered fresh for one year from the time of the request. After that, the content is marked as stale;
	
	setting the max-age to 0, we guarantee that the resource becomes stale as soon as it reaches the browser.
*/

/* cache-control: 'private'
	tells the web caches that only private caches can store the response
*/

/* cache-control: 'public'
	marks the response as public. Any intermediate caches can store responses marked with this instruction;
*/

/* cache-control: 'must-revalidate'
	tells the cache to strictly obey the freshness information you provide. For example, if your set cache-control: max-age= 31536000, must-revalidate the web cache can't serve the stale content under any circumstances;
*/

/* cache-control: 'no-store'
	instructs web caches not to store any version of the resource under any circumstances;
*/

/* cache-control: 'no-transform'
	Instructs the browser to not transform the content received from the server in any way (usually compression etc). 
*/

/* etag
	is a validator to check if content has changed
	The etag works in a similar way to the previous method.
	Here, the server creates an etag for the resource when it initially serves it to the cache.
	
		- the strong ETag taking more server resources to generate guarantees two representations of the same resources are byte-for-byte identical, including the body and the headers.
		- by contrast, the weak ETag is easier to create but can only ensure the body is semantically equivalent.
*/