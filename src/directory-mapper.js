

'use strict';

const fs = require('fs');
const _ = require('lodash');
const recursiveDir = require('./recursive-directory');

module.exports = function directoryMapper(directory) {
    var directories = recursiveDir(directory);

    for (var i = directories.length - 1; i >= 0; i--) {
        directories[i].files = _.chunk(directories[i].files, 10);
    }

    return directories;
}