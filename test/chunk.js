'use strict';

const chai = require('chai');
var assert = chai.assert;

const Chunk = require('../src/chunk');

describe('Chunk', function () {

    it('should make a new directory chunk', function () {
    	const directory = '/I/am a/custom/directory';
    	const filePathOne = 'i/am/a/file/path';
    	const filePathTwo = 'another/path/added';

        var chunk = new Chunk(directory);
        assert.equal(chunk.directory, directory, 'Chunk has a directory set');

        chunk.add(filePathOne);
        assert.typeOf(chunk.files, 'array', 'Chunk files is an array');


        assert.isObject(chunk, 'chunk is an object');
        assert.deepEqual(chunk, {
        	directory,
        	files: [filePathOne]
        });

        assert.deepEqual(chunk.add(filePathTwo), {
        	directory,
        	files: [filePathOne, filePathTwo]
        });
		
    });

});