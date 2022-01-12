/**
 * Expose `createApplication()`.
 */
require("./extensions.js");
const Application = require("./application.js");
exports = module.exports = createApplication;

function createApplication() {
    const app = function (req, res) {
      app.handle(req, res);
    }
    app.mergeObject(Application, false);
    app.init();
    return app;
}
/**
 * Expose constructors.
 */
exports.Router = require("./router.js");