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
            switch (req.headers['content-type']) {
                case 'text/plain':
                    req.body = (await data(req)).toString();
                    break;
                case 'application/x-www-form-urlencoded':
                    req.body = utils.query((await data(req)).toString());
                    break;
                case 'application/json':
                    req.body = JSON.parse((await data(req)).toString());
                    break;
            }
            resolve();
        } catch(e) {
            reject(e);
        }
    });
}
exports.data = data;