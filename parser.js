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
                    const d1 = (await data(req)).toString();
                    req.body = d1 ? d1 : "";
                    break;
                case 'application/x-www-form-urlencoded':
                    const d2 = (await data(req)).toString();
                    req.body = d2 ? utils.query(d2) : {};
                    break;
                case 'application/json':
                    const d3 = (await data(req)).toString();
                    req.body = d3 ? JSON.parse(d3) : {};
                    break;
            }
            resolve();
        } catch (e) {
            reject(e);
        }
    });
}
exports.data = data;