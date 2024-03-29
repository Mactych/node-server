/**
 * node-server - response.js
 * @author Mactych
 */

const mime = require('./mime.js');
const etag = require('./etag.js');
const cache = require('./cache.js');
const http = require('http');
var res = module.exports = Object.create(http.ServerResponse.prototype);

exports = module.exports = function(response) {
  Object.setPrototypeOf(response, res);
};
res.send = function(chunk, type) {
  if (!chunk) throw new TypeError('res.send() argument chunk is required');
  if (typeof chunk === 'string') this.setHeader('Content-Type', mime.lookup(type ? type : 'txt'));
  if (this.cache) if (cache.check(this.req, etag(chunk))) return;
  const buffer = Buffer.from(chunk, 'utf8');
  this.setHeader('Content-Length', buffer.length);
  this.end(buffer, 'utf8');
  return;
};
res.type = function(ext) {
  if (!ext) throw new TypeError('res.type() argument ext is required');
  this.setHeader('content-type', mime.lookup('.' + ext));
}
res.html = function(html) {
  if (!html) throw new TypeError('res.html() argument html is required');
  return this.send(html, 'html');
};
res.json = function(json, beautify) {
  if (!json) throw new TypeError('res.json() argument json is required');
  return this.send(beautify ? JSON.stringify(json, null, 4) : JSON.stringify(json), 'json');
};
res.sendStatus = function(status) {
  if (!status) throw new TypeError('res.sendStatus() argument status is required');
  this.writeHead(status);
  this.end();
  return this;
};
res.status = function(status) {
  if (!status) throw new TypeError('res.status() argument status is required');
  this.statusCode = status;
  return this;
};
res.redirect = function(location, status) {
  if (!location) throw new TypeError('res.redirect() argument location is required');
  this.writeHead(status ? status : 302, { Location: location });
  this.end();
  return this;
};
res.setHeaders = function(headers) {
  if (!headers) throw new TypeError('res.setHeaders() argument headers is required');
  for (const head of Object.keys(headers)) this.setHeader(head, headers[head]);
  return this;
};
res.removeHeaders = function(headers) {
  if (!headers) throw new TypeError('res.removeHeaders() argument headers is required');
  for (const head of headers) this.removeHeader(head);
  return;
}