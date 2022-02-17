1.2.0 / 2022-02-14
===================

    * Update: disable Etag on static content if cache is not enabled
    * Fix: bug where request would not be parsed if it had a charset

1.1.9 / 2022-02-14
===================

    * Add: parser no longer throws error when no data

1.1.8 / 2022-02-14
===================

    * Add: parser which can be invoked using server.parser(req) within a middleware
        * Supports: 'application/json', 'application/x-www-form-urlencoded', 'text/plain'
    * Add: CORS will now send extra 'allow' header for better compatibility
    * Add: routes and middlewares can now be asynchronous
    * Update: routes are now skipped if method is 'OPTIONS', but still cycles through middlewares
    * Fix: bug where CORS was enabling Etag for requests
    * Update: cache remove default opts values
    * Add: support for manually getting request data to buffer using server.parser.data function

1.1.6 / 2022-02-14
===================

    * Update: added support for promises

1.1.3 / 2022-02-12
===================

    * Update: fix the utils.params function to be more accurate and performant
    * Update: fix the utils.params from parsing the req.url to instead parse req.path

1.1.2 / 2022-02-06
===================

    * Update: make utils.query only decode
    * Add: make the query string be parsed outside of the function

1.0.8 / 2022-01-18
===================

    * Fix: issue where if there was no query the url would be put into the req.query variable
    * Update: name of the handle function for application.js
    * Update: automatically end request once all routes have been resolved if method - OPTIONS, HEAD
    * Update: request add semicolons where missing
    * Fix: spelling errors within readme file
    * Update: End the request with a 404 if it was not resolved.
    * Update: rework how requests and responses are handled
    * Update: don't modify req.url instead create req.path with the querystring excluded
    * Add: support for Etag's
    * Add: cache manager to add appropriate cache headers, can be called by router.cache();s
    * Update: router name changed server.Router() -> server.router()
    * Add: req/res now have links to each other
    * Update: better management for options
    * Update: now using single quotes '' to be more consistent.
    * Update: added missing error throwing in response
    * Remove: not needed getter definitions in request
    * Fix: path getter redefining over req.path
    * Add: a new CORS handler which can be called using server.cors(res, options)
    * Update: fix the cookie function to not throw error when parsing empty cookie
    * Add: the cookie handler which can be applied using route.use(server.cookie)
    * Update: small code enhancements

1.0.7 / 2022-01-16
===================

    * Update: format all javascript files
    * Fix: issue where query would be redone every time a route was run

1.0.6 / 2022-01-16
===================

    * Support: OPTIONS method, automatically resolves after all routes have completed
    * Support: HEAD method can be initiated using the router.head(url, route) function

1.0.5 / 2022-01-15
===================

    * Remove: debugging log from query function

1.0.4 / 2022-01-15
===================

    * Remove: query encodeURICompontent for more flexibility

1.0.3 / 2022-01-15
===================

    * Fix: Issue where if params had extra url they would become corrupt

1.0.2 / 2022-01-15
===================

    * Remove: virtual class since it is not needed
    
1.0.1 / 2022-01-15
===================

    * Update: the params function to make params faster, and more reliable
    * Update: error handling when arguments aren't specified within the utils
    * Fix: static video in byte range would always stay Content-Type=video/mp4
    * Update: response functions throw error if insufficient arguments
    * Add: response function res.sendStatus(statusCode)
    * Add: getter req.path

1.0.0 / 2022-01-13
===================

    * Add: correct functions within the Response.
        - Update: res.send() to use the proper 'utf8' encoding
        - Create: res.html() use to send HTML code this will set the correct content type
        - Create: res.json() use to send JSON
    * Add: support for passing in an Array into the app.virtual() function allowing for multiple domains to be used
    * Add: getter for req.host to make accessing hostname easier
    * Fix: res.status() function from instead of writingHead to set the statusCode
    * Move: req extended variables into their prototype file
    * Prevent: params being added if there are none
    * Fix: res.redirect() function
    * Add: definitions for request functions
    * Fix: query not being remove from urls
    * Change: make middleware functions not use a path
    * Fix: route would not be used if it ended with '/' because it was always removed, this issue is fixed
    * Add: support for byte ranges with static content
    * Fix: issue where when middleware's were appended to another route it would get a path when not needed
    * Add: support for not requiring to use .html when serving static files - default is true can be set using static options.requireHTMLExtension
    * Rename: the req.cookie getter to req.cookies, this is more logical