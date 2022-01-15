1.0.1 / 2022-01-15
===================

    * Update: the params function to make params faster, and more reliable
    * Update: error handling when arguments aren't specified within the utils
    * Fix: static video in byte range would always stay Content-Type=video/mp4

1.0.0 / 2022-01-13
===================

    * Add: correct functions within the Reponse.
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
    * Fix: issue where when middlewares were appended to another route it would get a path when not needed
    * Add: support for not requiring to use .html when serving static files - default is true can be set using static options.requireHTMLExtension
    * Rename: the req.cookie getter to req.cookies, this is more logical