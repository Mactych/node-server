/**
 * Expose `createApplication()`.
 */
const Utils = require("./utilities.js");
const Application = require("./application.js");
exports = module.exports = createApplication;

function createApplication() {
  const app = function (req, res) {
    app.handleRoute(req, res);
  }
  Utils.mergeObject(Application, app, false);
  app.init();
  return app;
}
/**
 * Expose constructors.
 */
exports.Router = require("./router.js");