class Virtual extends Router {
    constructor(hostname, server) {
        super();
        this.server = server;
        this.hostname = hostname;
    }
}

module.exports = Virtual;