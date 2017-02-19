"use strict";

class Chunk {

	constructor(directory) {
		this.directory = directory;
		this.files = [];
	}

	add(file) {
		this.files.push(file);

		return this;
	}

}

module.exports = Chunk;