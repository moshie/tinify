/*!
 * Compressor
 */

'use strict';

const log = console.log;
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const shell = require('child_process').execFile;

const writeFile = Promise.promisify(fs.writeFile);

class Compressor {

    constructor(url, mapper) {
        this.authUrl = url;
        this.mapper = mapper;
        this.tempFilePath = __dirname + '/temp.json';
    }

    compress() {
        const directories = this.mapper.build();

        return Promise.map(directories, (directory, index) => {
            let chunkTempFile = `${__dirname}/temp-${index}.json`;

            log(`processing: ${directory.directory}`);

            return writeFile(chunkTempFile, JSON.stringify(directory.chunk))
                .then(() => {
                    return this.compressChunk(chunkTempFile);
                })
                .then((chunkUrls) => ({directory: directory.directory, urls: chunkUrls}));
        }, {concurrency: 6})
            .then((urlChunks) => {
                this.removeFiles(directories.length);
                return urlChunks;
            })
            .then((urlChunks) => this.mergeChunks(urlChunks));

    }

    removeFiles(count) {
        for (var i = count - 1; i >= 0; i--) {
            fs.unlinkSync(`${__dirname}/temp-${i}.json`);
        }
    }

    mergeChunks(urlChunks) {
        
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

    compressChunk(chunkTempFile) {
        return new Promise((resolve, reject) => {
            shell('casperjs', [`${__dirname}/casperjs-compressor.js`, this.authUrl, chunkTempFile], {
                cwd: process.cwd()
            }, (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }

                var urls = [];

                if (this.isJSON(stdout)) {
                    urls.push(JSON.parse(stdout));
                } else {
                    return reject(stdout);
                }

                return resolve(urls);
            });

        });
    }

    isJSON(data) {
        try {
            JSON.parse(data);
        } catch (e) {
            return false;
        }
        return true;
    }

}

module.exports = Compressor;