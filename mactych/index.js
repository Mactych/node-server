// http.server
/*


const server = server();

// should return 
const site = new server.Virtual("macstudio.pro");
site.


const test = new server.Router();
test.get(...);
test.use(...)
*/




class Server {
    constructor() {
        this.Virtuals = {};
        this.Virtual = require("./virtual.js")
        this.Router = require("./router/index.js");
    }
}

/* function Server() {

    this.Virtual = require("./virtual.js");
    this.Router = require("./router/index.js");
    return function(req, res) {

    };
} */

module.exports = Server;