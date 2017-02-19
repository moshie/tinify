"use strict";

const path = require('path');
const Chunk = require('./chunk');
const mime = require('mime-types');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const mimeTypes = ['image/jpeg', 'image/png'];

const tree = [];

function resolveFiles(directory, resolvedPath, stat) {
    if (mimeTypes.indexOf(mime.lookup(resolvedPath)) != -1) {
        const applingDir = chunkFilter(tree, directory);

        if (!applingDir.length) {
            tree.push(
                new Chunk(directory).add(resolvedPath)
            );
            return;
        }

        var applingDirIndex = tree.indexOf(applingDir[0]);
        tree[applingDirIndex].files.push(resolvedPath);
    }
}

function directoryMapper(directory) {

    return fs.readdirAsync(directory).map((dirOrFile) => {
            let resolvedPath = path.resolve(directory, dirOrFile);
            return fs.statAsync(resolvedPath)
                .then((stat) => {
                    if (stat.isDirectory()) {
                        return directoryMapper(resolvedPath);
                    }

                    return resolveFiles(directory, resolvedPath, stat);
                });
        })
        .then(() => filterEmpty(tree));

}

function chunkFilter(arr, directory) {
    var match = [];

    for (var i = arr.length - 1; i >= 0; i--) {
        let v = arr[i];
        if (v.directory == directory && v.files.length < 10) match.push(v);
    }

    return match;
}

function filterEmpty(arr) {
    var match = [];

    for (var i = arr.length - 1; i >= 0; i--) {
        let v = arr[i];
        if (v.files.length) match.push(v);
    }

    return match;
}

module.exports.mapdirAsync = directoryMapper;
module.exports.mapdir = function(directory, success) {
    return directoryMapper(directory)
        .then(function(result) {
            success(null, result);
        })
        .catch(success);
};
