const server = require("./server.js");
const app = server();
const web_default = new server.Router();
const web_localhost = new server.Router();

web_localhost.use((req, res, next) => {
    res.setHeaders({
        "Connection": "keep-alive",
        "Server": "MacStudio"
    });
    next();
});
const web_mw = new server.Router();
web_mw.use((req, res, next) => {
    // console.log(`middleware: ${req.url}`);
    // res.setHeaders({ "x-test": "true" });
    next();
});
web_mw.static("/", `${__dirname}/server/routes/uploader/static`, { requireHTMLExtension: true });
web_mw.get("*", (req, res) => {
    res.html("hi");
});
web_localhost.use(web_mw);

// use the virtual network
app.virtual("*", web_localhost);
app.virtual("*", web_default);
app.listen(80, (port) => {
    console.log(`listening on port ` + port);
});