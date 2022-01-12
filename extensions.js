Object.prototype.mergeObject = function (src, /* dest, */ redefine) {
    dest = this;
    if (!dest) throw new TypeError('argument dest is required')
    if (!src) throw new TypeError('argument src is required');
    if (redefine === undefined) redefine = true;
    Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
        if (!redefine && Object.prototype.hasOwnProperty.call(dest, name)) return;
        var descriptor = Object.getOwnPropertyDescriptor(src, name);
        Object.defineProperty(dest, name, descriptor);
    })
    return dest;
}