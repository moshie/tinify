#!/usr/bin/env node

'use strict';

const cwd = process.cwd();
const log = console.log;

Array.prototype.search = require('./src/polyfills').search;
const packageVersion = require('./package.json').version;

const program = require('commander');
const Compressor = require('./src/compressor');

var authUrl;

program
    .version(packageVersion)
    .usage('<url>')
    .arguments('<url>', 'Provide the tiny png / jpg authentication url')
    .action((url) => {
        authUrl = url;
    });

program.parse(process.argv);

const compressor = new Compressor(authUrl);

compressor.compress(function (results) {
    log(results);
});