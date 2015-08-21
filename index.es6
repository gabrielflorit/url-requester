'use strict';

let inquirer = require('inquirer');
let isThere = require('is-there');
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

// Make db filename
let dbFilename = argv.file.split('.')[0] + '.db';

function insertFileIntoDb(file, dbFilename, callback) {

	let db = new NeDB({
		filename: dbFilename,
		autoload: true
	});

	db.insert(file, callback);
}

// If db file exists ask user if we should overwrite.
if (isThere(dbFilename)) {

	inquirer.prompt([
		{
			type: 'list',
			name: 'whatToDo',
			choices: ['Use existing', 'Create new'],
			message: 'Use existing database, or create new?'
		}
	],
	function(answers) {

		if (answers.whatToDo === 'Create new') {

			// delete db
			fs.unlinkSync(dbFilename);

			insertFileIntoDb(file, dbFilename, connectToDb);

		} else {

			connectToDb();
		}

	});
} else {

	// Db file does not exist.
	// Create it and insert file into db.
	insertFileIntoDb(file, dbFilename, connectToDb);

}

// This is the "main" program.
// Obviously this is not the way to do things,
// but for now it will do.
// If things turn into callback hell I'll implement Promises.
function connectToDb() {

	let db = new NeDB({
		filename: dbFilename,
		autoload: true
	});

}

