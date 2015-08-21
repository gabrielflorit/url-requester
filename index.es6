'use strict';

let NeDB = require('nedb');
let path = require('path');
let fs = require('fs');

// What to do:
// - read in json from command line
// - store in db in an optional place
// 		- if such db exists, then
// 			- either use existing db,
// 			- or overwrite with new csv
// - for each record in the db with no new response field,
// - request field
// - and save record
//

// Setup user options
let argv = require('yargs')
	.option('f', {
		alias: 'file',
		demand: true,
		describe: 'file name',
		type: 'string'
	})
	.argv;

// Read JSON file
let file = JSON.parse(fs.readFileSync(argv.file, 'utf8'));
console.log(JSON.stringify(file, null, 4));

// Get db filename
let dbFilename = argv.file.split('.')[0] + '.db';

// Connect to db
// TODO: this assumes file only has one dot
var db = new NeDB({
	filename: dbFilename,
	autoload: true // automatic loading
});



