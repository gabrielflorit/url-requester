'use strict';

// let _ = require('lodash');
// let d3 = require('d3');
// let inquirer = require('inquirer');
// let isThere = require('is-there');
// let NeDB = require('nedb');
// let path = require('path');
// let fs = require('fs');

// // What to do:
// // - read in json from command line
// // - store in db in an optional place
// // 		- if such db exists, then
// // 			- either use existing db,
// // 			- or overwrite with new csv
// // - for each record in the db with no new response field,
// // - request field
// // - and save record
// //

// // Setup user options
// let argv = require('yargs')
// 	.option('f', {
// 		alias: 'file',
// 		demand: true,
// 		describe: 'file name',
// 		type: 'string'
// 	})
// 	.option('r', {
// 		alias: 'requestField',
// 		demand: false,
// 		describe: 'field used to save url request contents',
// 		type: 'string',
// 		default: 'request'
// 	})
// 	.argv;

// // Read file
// let file = fs.readFileSync(argv.file, 'utf-8');

// // Look at file extension to see if it's CSV or JSON.
// let fileName = argv.file.split('.')[0];
// let fileExtension = argv.file.split('.')[1].toLowerCase();

// // Parse CSV or JSON
// let records = fileExtension === 'csv' ?
// 	d3.csv.parse(file) :
// 	JSON.parse(file);

// // Make db filename
// let dbFilename = fileName + '.db';

// function insertRecordsIntoDb(records, dbName, callback) {

// 	// tell pace how many elements we're going to process
// 	let pace = require('pace')({
// 		total: records.length,
// 		itemType: 'records'
// 	});

// 	// keep track of the number of inserted records
// 	var counter = 0;

// 	// connect to database
// 	let db = new NeDB({
// 		filename: dbFilename,
// 		autoload: true
// 	});

// 	// chunk records into manageable sizes
// 	var chunks = _.chunk(records, 2);

// 	function insertChunkOrExit() {

// 		// get the next chunk
// 		let chunk = chunks.pop();

// 		// do we actually have a new chunk?
// 		if (chunk) {

// 			// insert chunk into db
// 			db.insert(chunk, function(err, newDocs) {

// 				// increment counter
// 				counter += newDocs.length;

// 				// inform pace of our pace
// 				pace.op(counter);

// 				// insert the next chunk
// 				insertChunkOrExit();

// 			});

// 		} else {

// 			// we are done!
// 			callback();
// 		}

// 	}

// 	insertChunkOrExit();
// }

// // If db file exists ask user if we should overwrite.
// if (isThere(dbFilename)) {

// 	inquirer.prompt([
// 		{
// 			type: 'list',
// 			name: 'whatToDo',
// 			choices: ['Use existing', 'Create new'],
// 			message: 'Use existing database, or create new?'
// 		}
// 	],
// 	function(answers) {

// 		if (answers.whatToDo === 'Create new') {

// 			// delete db
// 			fs.unlinkSync(dbFilename);

// 			insertRecordsIntoDb(records, dbFilename, connectToDb);

// 		} else {

// 			connectToDb();
// 		}

// 	});
// } else {

// 	// Db file does not exist.
// 	// Create it and insert file into db.
// 	insertRecordsIntoDb(records, dbFilename, connectToDb);

// }

// // This is the "main" program.
// // Obviously this is not the way to do things,
// // but for now it will do.
// // If things turn into callback hell I'll implement Promises.
// function connectToDb() {

// // 	let db = new NeDB({
// // 		filename: dbFilename,
// // 		autoload: true
// // 	});

// // 	// find all records that don't have a request field,
// // 	// and make the request
// // 	let requestField = argv.requestField;

// // 	db.find({requestField: { $exists: false }}, function(err, docs) {

// // 		console.log(JSON.stringify(docs, null, 4));

// // 	});

// }

