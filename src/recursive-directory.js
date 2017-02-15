

'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const mime = require('mime-types');

const mimeTypes = ['image/jpeg', 'image/png'];

var tree = [];

function recursive(directory) {
    let contents = fs.readdirSync(directory),
        stats;

    tree.push({directory, files: []});

    contents.forEach((fileName) => {
        let filePath = path.resolve(directory, fileName);
        stats = fs.lstatSync(filePath);

        if (stats && stats.isFile()) {
            if (_.includes(mimeTypes, mime.lookup(filePath))) {
                tree.search('directory', directory).files.push(filePath);
            }
        } else {
            tree.push({filePath, files: []});
            recursive(filePath);
        }
    });

    return tree;
}

module.exports = function recursiveDir(directory) {
    return recursive(directory).filter(dir => dir.files.length);
}