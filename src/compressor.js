/*!
 * Compressor
 */

'use strict';

const log = console.log;
const path = require('path');
const Promise = require('bluebird');
const shell = require('child_process').execFile;
const fs = Promise.promisifyAll(require('fs'));
const https = Promise.promisifyAll(require('https'));

function isJSON(data) {
    try {
        JSON.parse(data);
    } catch (e) {
        return false;
    }
    return true;
}

function compressChunk(chunkTempFile, authUrl) {
    return new Promise((resolve, reject) => {
        shell('casperjs', [`${__dirname}/casperjs-compressor.js`, authUrl, chunkTempFile], {
            cwd: process.cwd()
        }, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }

            var urls = [];

            if (isJSON(stdout)) {
                urls = JSON.parse(stdout);
            } else {
                return reject(stdout);
            }

            return resolve(urls);
        });

    });
}

function download(url, dest) {
    var file = fs.createWriteStream(dest);
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            response.pipe(file);

            file.on('finish', () => {
                file.close(() => {
                    log(dest + ' replaced successfully');
                    return resolve();
                });
            })
        }).on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            console.log(err);
        });
    });
}

function processDirectory(directory, authUrl, index) {
    let chunkTempFile = `${__dirname}/temp-${index}.json`;

    log(`processing: ${directory.directory}`);

    return fs.writeFileAsync(chunkTempFile, JSON.stringify(directory.files))
            .then(() => compressChunk(chunkTempFile, authUrl))
            .then((chunkUrls) => {
                fs.unlinkAsync(chunkTempFile)
                return chunkUrls;
            })
            .then((chunkUrls) => {
                return Promise.map(chunkUrls, (chunkUrl) => {
                    var dest = path.resolve(directory.directory, path.basename(chunkUrl));
                    return download(chunkUrl, dest);
                });
            })
            //.then((chunkUrls) => ({directory: directory.directory, urls: chunkUrls}));
}

function mergeChunks(urlChunks) {
    var output = [];

    urlChunks.forEach((chunk) => {
        var existing = output.filter((v, i) => v.directory == chunk.directory);

        if (existing.length) {
            var existingIndex = output.indexOf(existing[0]);
            output[existingIndex].urls.push(chunk.urls);
        } else {
            output.push({
                directory: chunk.directory,
                urls: [chunk.urls]
            });
        }

    });

    return output;
}

function compress(directories, authUrl) {

    return Promise.map(directories, (directory, index) => {
        return processDirectory(directory, authUrl, index);
    }, {concurrency: 6})

}

module.exports.compressAsync = compress;
module.exports.compress = function(directories, authUrl, success) {
    return compress(directories, authUrl)
        .then(function(result) {
            success(null, result);
        })
        .catch(success);
};