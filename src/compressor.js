/*!
 * Compressor
 */

'use strict';

const log = console.log;
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const tempFilePath = __dirname + '/temp.json';
const shell = require('child_process').execFile;

class Compressor {

    constructor(url, mapper) {
        this.authUrl = url;
        this.mapper = mapper;
    }

    compress() {

        return Promise.map(this.mapper.build(), (directory) => {
            this.writeToFile(directory.chunk);

            log(`processing: ${directory.directory}`);
            
            return this.compressChunk()
                .then((chunkUrls) => ({directory: directory.directory, urls: chunkUrls}));
        }, {concurrency: 1})
            .then((urlChunks) => {
                this.removeFile();
                return urlChunks;
            })
            .then((urlChunks) => this.mergeChunks(urlChunks));

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

    compressChunk() {
        return new Promise((resolve, reject) => {
            shell('casperjs', [`${__dirname}/casperjs-compressor.js`, this.authUrl], {
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

    writeToFile(chunk) {
        fs.writeFileSync(tempFilePath, JSON.stringify(chunk));
    }

    removeFile() {
        fs.unlinkSync(tempFilePath);
    }

}

module.exports = Compressor;