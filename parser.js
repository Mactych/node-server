/**
 * node-server - parser.js
 * @author Mactych
 */

const utils = require("./utilities.js");

function data(req) {
    return new Promise((resolve, reject) => {
        const content = [];
        req.on("data", (d) => {
            content.push(d);
        }).on("end", () => {
            try {
                resolve(Buffer.concat(content));
            } catch (e) {
                reject(e);
            }
        });
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