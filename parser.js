/**
 * node-server - parser.js
 * @author Mactych
 */

const utils = require("./utilities.js"),
    fs = require('fs'),
    crypto = require('crypto');

function data(req) {
    return new Promise((resolve, reject) => {
        const content = [];
        function finish() {
            try {
                resolve(Buffer.concat(content));
            } catch (e) {
                reject(e);
            }
        }
        req.on("data", (d) => {
            content.push(d);
        }).on("end", finish).on("close", finish);
    });
}

exports = module.exports = async function(req) {
    if (!req) throw new TypeError('parser() argument req is required');
    return new Promise(async (resolve, reject) => {
        try {
            const content_types = {
                'text/plain': async function() {
                    const d = (await data(req)).toString();
                    req.body = d ? d : '';
                },
                'application/x-www-form-urlencoded': async function() {
                    const d = (await data(req)).toString();
                    req.body = d ? utils.query(d) : {};
                },
                'application/json': async function() {
                    const d = (await data(req)).toString();
                    req.body = d ? JSON.parse(d) : {};
                },
                'multipart/form-data': async function() {
                    const boundary = req.headers['content-type'].split('boundary=')[1];
                    if (!boundary) return res.status(400).send('Boundary information missing');
                    Buffer.prototype.indexOfEnd = function(string) {
                        var io = this.indexOf(string);
                        return io == -1 ? -1 : io + string.length;
                    }
                    var d = await data(req);
                    var files = [];
                    var files_final = [];
                    while (d.indexOf('--' + boundary + '\r\n') != -1) {
                        const content = d.slice(d.indexOfEnd('--' + boundary + '\r\n'), d.indexOf('\r\n--' + boundary));
                        files.push(content);
                        d = d.slice(d.indexOf('\r\n--' + boundary) + 2, d.length);
                    }
                    for (const file of files) {
                        const final = {};
                        const information = file.slice(0, file.indexOf('\r\n\r\n')).toString().split('\r\n');
                        final.content = file.slice(file.indexOfEnd('\r\n\r\n'), file.length);
                        let filename = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        let name = /name[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        let filename_d = filename.exec(information[0]);
                        let name_d = name.exec(information[0]);
                        if (filename_d != null && filename_d[1]) final.filename = filename_d[1].replace(/['"]/g, '');
                        if (name_d != null && name_d[1]) final.name = name_d[1].replace(/['"]/g, '');
                        if (information[1]) final.type = information[1].split(': ')[1];
                        files_final.push(final);
                    }
                    req.body = files_final;
                }
            }
            for (const type in content_types) {
                if (req.headers["content-type"] && req.headers["content-type"].startsWith(type)) {
                    await content_types[type]();
                    break;
                }
            }
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}
exports.data = data;