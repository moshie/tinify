/*!
 * 
 */

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

    tree.push({directory, chunk: []});

    contents.forEach((fileName) => {
        let filePath = path.resolve(directory, fileName);
        stats = fs.lstatSync(filePath);

        if (stats && stats.isFile()) {
            if (_.includes(mimeTypes, mime.lookup(filePath))) {
                var applingDir = tree.filter((v, i) => v.directory == directory && v.chunk.length < 10);

                if (!applingDir.length) {
                    tree.push({directory, chunk: [filePath]});
                } else {
                    var applingDirIndex = tree.indexOf(applingDir[0]);
                    tree[applingDirIndex].chunk.push(filePath);
                }
            }
        } else {
            tree.push({
                directory: filePath, 
                chunk: []
            });
            recursive(filePath);
        }
    });

    return tree;
}

module.exports = function directoryMapper(directory) {
    return recursive(directory).filter(dir => dir.chunk.length);
}