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