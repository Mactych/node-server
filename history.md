1.0.0 / 2022-01-13
===================

    * Add: correct functions within the Reponse.
        - Update: res.send() to use the proper 'utf8' encoding
        - Create: res.html() use to send HTML code this will set the correct content type
        - Create: res.json() use to send JSON
    * Add: Support for passing in an Array into the app.virtual() function allowing for multiple domains to be used
    * Add: Getter for req.host
    * Fix: res.status() function from instead of writingHead to set the statusCode
    * Move: req extended variables into their prototype file
    * Prevent: params being added if there are none
    * Fix: res.redirect() function
    * Add: definitions for request functions
    * Fix: query not being remove from urls
    * Change: make middleware functions not use a path
    * Fix: A route would not be used if it ended with '/' because it was always removed, this issue is fixed