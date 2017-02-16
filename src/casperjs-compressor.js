var casper = require('casper').create();
var fs = require('fs');

var filename = require('system').args[3].split(fs.separator);
filename.pop();
var __dirname = filename.join(fs.separator);
var files = fs.read(__dirname + fs.separator + 'temp.json');
var authUrl = casper.cli.args[0];
var chunkCount = casper.cli.args[1];

casper.options.waitTimeout = 60000; // needs work

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');

casper.start(authUrl);

casper.then(function () {
    this.page.uploadFile('.target [type="file"]', JSON.parse(files));
});

casper.waitFor(function check() {
    return this.evaluate(function() {
        return document.querySelectorAll('.buttons .download')[0].disabled == false;
    });
}, function then() {
    //this.echo('finished download');
}, function timeout() { // step to execute if check has failed
    this.capture(__dirname + '/testing.png', {
        width: 1280
    });
    console.log('ah no it timed out and we dont know wht did you run out of internet?');
    this.exit();
});

casper.then(function () {
    var urls = this.evaluate(function() {
        var files = document.querySelectorAll('.files .upload');
        var download_urls = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var download_link = file.querySelectorAll('.after a')[0].href;

            if (download_link != '') {
                download_urls.push(download_link);
            }
        }
        return download_urls;
    });

    console.log(JSON.stringify(urls));
});

casper.run(function() {
    this.exit();
});