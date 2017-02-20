#!/usr/bin/env node

'use strict';

const cwd = process.cwd();
const log = console.log;

const Promise = require('bluebird');
Array.prototype.search = require('./src/polyfills').search;
const packageVersion = require('./package.json').version;

const program = require('commander');

const path = require('path');
const fs = require('fs');

const https = Promise.promisifyAll(require('https'));

var authUrl;

program
    .version(packageVersion)
    .usage('<url>')
    .arguments('<url>', 'Provide the tiny png / jpg authentication url')
    .action((url) => {
        authUrl = url;
    });

program.parse(process.argv);

if (!authUrl) {
    log('Please supply tinify with a valid authentication url');
    process.exit(1);
}

const {mapdirAsync} = require('./src/directory-mapper');
const {compressAsync} = require('./src/compressor');


mapdirAsync(cwd)
    .then((directories) => compressAsync(directories, authUrl))
    .then((result) => {
        //log(result);
    })
    .catch((error) => {
        log(error);
    });
