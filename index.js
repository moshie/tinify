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
    // Replace the local file with the downloaded file
    // 


// var fullPath = path.join(dir, path.basename(url));

// var file = fs.createWriteStream(fullPath);
// var request = https.get(url, function(response) {
//      response.pipe(file);

//      if (e < urls.length) {
//             urlLoop(++e);
//  }

//   if (urls.length == e && d < chunks.length) {
//      chunksLoop(++d);
//   }

//   if (urls.length == e && chunks.length == d && i < files.length) {
//      // chunks are done
//      filesLoop(++i);
//   }
// });
//                      }



});