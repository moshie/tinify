"use strict";

const log = console.log;
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const mime = require('mime-types');

class DirectoryChunkingService {

    /**
     * Directory chunking Service Constructor
     * 
     * @param  string directory
     * @return void
     */
    constructor(directory) {
        this.directory = directory;
        this.mimeTypes = ['image/jpeg', 'image/png'];
        this.tree = [];
    }

    /**
     * Process directory
     * 
     * @param  string directory
     * @return void
     */
    recursiveProcess(directory) {
        this.tree.push(
            this.directoryObject(directory)
        );

        this.processPaths(directory);

        return this.tree;
    }

    /**
     * Determine if the path is a directory or file
     * 
     * @param  string directory
     * @return void
     */
    processPaths(directory) {
        let dirsAndFiles = fs.readdirSync(directory);

        for (var i = dirsAndFiles.length - 1; i >= 0; i--) {
            let resolvedPath = path.resolve(directory, dirsAndFiles[i]);
            let stats = fs.lstatSync(resolvedPath);

            if (
                stats &&
                stats.isFile() &&
                _.includes(this.mimeTypes, mime.lookup(resolvedPath))
            ) {
                this.chunkDirectories(directory, resolvedPath);
                continue;
            }

            if (stats && stats.isDirectory()) {
                this.tree.push(
                    this.directoryObject(directory)
                );
                this.recursiveProcess(resolvedPath);
            }
        }
    }

    /**
     * Take the file and place it into an appropriate directory chunk
     * 
     * @param  string directory
     * @param  string filePath
     * @return void
     */
    chunkDirectories(directory, filePath) {
        const applingDir = this.tree.filter((v, i) => { 
            return v.directory == directory && v.chunk.length < 10;
        });

        if (!applingDir.length) {
            this.tree.push(
                this.directoryObject(directory, filePath)
            );
            return;
        }

        var applingDirIndex = this.tree.indexOf(applingDir[0]);
        this.tree[applingDirIndex].chunk.push(filePath);
    }

    /**
     * Build a directory chunk
     * 
     * @param  string directory
     * @param  string filePath
     * @return object
     */
    directoryObject(directory, filePath) {
        return typeof filePath === 'undefined' ? {directory, chunk: []} : {directory, chunk: [filePath]};
    }

    /**
     * initialize the recursive process & remove empty chunks
     * 
     * @return array
     */
    build() {
        return this.recursiveProcess(this.directory).filter(dir => dir.chunk.length);
    }

}

module.exports = DirectoryChunkingService;
