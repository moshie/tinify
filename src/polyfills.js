exports.search = function (key, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][key] == value) {
            return this[i];
        }
    }

    return this;
}