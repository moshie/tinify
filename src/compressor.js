/*!
 * Compressor
 */

'use strict';

const log = console.log;
const fs = require('fs');
const cwd = process.cwd();
const path = require('path');
const Promise = require('bluebird');
const tempFilePath = __dirname + '/temp.json';
const shell = require('child_process').execFile;
const dirMapper = require('./directory-mapper');

class Compressor {

    constructor(url) {
        if (!url) {
            this.handleAuthFailure();
        }
        this.authUrl = url;
    }

    compress() {
        const directories = dirMapper(cwd);
        const obj = this;

        return Promise.map(directories, (directory) => {
            obj.writeToFile(directory.chunk);
            
            return obj.compressScript()
                .then((chunkUrls) => ({directory: directory.directory, urls: chunkUrls}))
        }, {concurrency: 1})
            .then((dirChunks) => obj.mergeChunks(dirChunks));

    }

    mergeChunks(dirChunks) {
        this.removeFile();

        var output = [];

        dirChunks.forEach((chunk) => {
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

    compressScript() {
        const obj = this;
        return new Promise((resolve, reject) => {
            shell('casperjs', [`${__dirname}/casperjs-compressor.js`, obj.authUrl], {
                cwd: process.cwd()
            }, (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }

                var urls = [];

                try {
                    urls.push(JSON.parse(stdout));
                } catch (e) {
                    return reject(e);
                }

                return resolve(urls);
            });

        });
    }

    writeToFile(chunk) {
        fs.writeFileSync(tempFilePath, JSON.stringify(chunk));
    }

    removeFile() {
        fs.unlinkSync(tempFilePath);
    }

    handleAuthFailure() {
        log('Please supply tinify with a valid authentication url');
        process.exit(1);
    }

}

module.exports = Compressor;