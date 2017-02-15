const dirMapper = require('./directory-mapper');
const fs = require('fs');
const path = require('path');
const shell = require('child_process').execFile;
var StringDecoder = require('string_decoder').StringDecoder;
const cwd = process.cwd();
const log = console.log;
const Promise = require('bluebird');

class Compressor {

    constructor(url) {
        if (!url) {
            this.handleAuthFailure();
        }
        this.authUrl = url;
    }

    compress(cb) {
        const directories = dirMapper(cwd); // Adjust the mapper to the format below
        const obj = this;

        // chunks
        // [
        //      {
        //          directory: '/dwadwadwadwa/wda/a/dwad/',
        //          chunk: [
        //              '/feseefses/efsefsfes/efefssef.jpg',
        //              '/feseefses/efsefsfes/efefssef.jpg',
        //          ]
        //      },
        //      {
        //          directory: '/dwadwadwadwa/wda/a/dwad/',
        //          chunk: [
        //              '/feseefses/efsefsfes/dwadwadawawdfe.jpg',
        //              '/feseefses/efsefsfes/wdaadwdawwfesf.jpg',
        //          ]
        //      },
        // ]

        let chunks = [];

        directories.forEach((dir) => {
            dir.files.forEach((chunk) => {
                chunks.push({
                    directory,
                    chunk
                });
            });
        });

        return Promise.map(chunks, (chunk) => { // Loop
            obj.writeToFile(chunk.chunk);
            
            return obj.compressScript()
                .then((chunkUrls) => {

                    return {
                        directory: chunk.directory,
                        urls: chunkUrls
                    };

                })
        }, {concurrency: 1})
            .then((dirChunks) => {
                obj.removeFile();

                // dirChunks
                // [
                //      {
                //          directory: '/dwadwadwadwa/wda/a/dwad/',
                //          urls: [
                //              '/feseefses/efsefsfes/efefssef.jpg',
                //              '/feseefses/efsefsfes/efefssef.jpg',
                //          ]
                //      },
                //      {
                //          directory: '/dwadwadwadwa/wda/a/dwad/',
                //          urls: [
                //              '/feseefses/efsefsfes/dwadwadawawdfe.jpg',
                //              '/feseefses/efsefsfes/wdaadwdawwfesf.jpg',
                //          ]
                //      },
                // ]

                // loop through url chunks array then merge the urls where the directories names match so it looks like this:
                
                // finalChunks
                // [
                //      {
                //          directory: '/dwadwadwadwa/wda/a/dwad/',
                //          urls: [
                //                  [
                //                      '/feseefses/efsefsfes/efefssef.jpg',
                //                      '/feseefses/efsefsfes/efefssef.jpg',
                //                  ],
                //                  [
                //                      '/feseefses/efsefsfes/dwadwadawawdfe.jpg',
                //                      '/feseefses/efsefsfes/wdaadwdawwfesf.jpg',
                //                  ]
                //          ]
                //      }
                // ]
                return finalChunks;
            })
            // .done  / .complete ?? cb(err, results);
            .then(cb)
            .catch((err) => {
                log(err);
            });

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

    isJson(data) {
        try {
            JSON.parse(data);
        } catch (e) {
            return false;
        }
        return true;
    }

    writeToFile(chunk) {
        const tempFilePath = __dirname + '/temp.json';
        fs.writeFileSync(tempFilePath, JSON.stringify(chunk));
    }

    removeFile() {
        const tempFilePath = __dirname + '/temp.json';
        fs.unlinkSync(tempFilePath);
    }

    handleAuthFailure() {
        log('Please supply tinify with a valid authentication url');
        process.exit(1);
    }

}

module.exports = Compressor;