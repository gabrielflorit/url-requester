#!/usr/bin/env node

var request = require('request');
var RateLimiter = require('limiter').RateLimiter;

var argv = require('yargs')
	.option('h', {
		alias: 'host',
		describe: 'mongodb host',
		type: 'string',
		default: '127.0.0.1'
	})
	.option('p', {
		alias: 'port',
		describe: 'mongodb port',
		type: 'integer',
		default: 27017
	})
	.option('d', {
		alias: 'database',
		describe: 'database name',
		type: 'string',
		demand: true
	})
	.option('c', {
		alias: 'collection',
		describe: 'collection name',
		type: 'string',
		demand: true
	})
	.argv;

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(`mongodb://${argv.host}:${argv.port}/${argv.database}`, function(err, db) {

	var collection = db.collection(argv.collection);

	var limiter = new RateLimiter(1, 'second');

	var pace;

	// get the number of documents we're going to geocode
	collection.count({geocode:{$exists:false}}, function(err, doc) {

		pace = require('pace')({
			total: doc,
			itemType: 'rows'
		});

		makeARequestOrExit();

	});

	function makeARequestOrExit() {

		// try to find a doc with no geocode
		collection.findOne({geocode:{$exists:false}}, function(err, doc) {

			if (doc) {

				// make a request
				limiter.removeTokens(1, function(err, remainingRequests) {

					// make request to google
					var url = `https://maps.googleapis.com/maps/api/geocode/json?address=230 Lowell St Waltham MA`;
					request(url, function(error, response, body) {

						if (!error && response.statusCode === 200) {

							var geocode = JSON.parse(body);

							collection.updateOne({_id: doc._id}, {$set:{geocode:geocode}}, function(a, b, c) {

								pace.op();
								makeARequestOrExit();

							});

						}
					});

				});

			} else {

				// no documents left to process. exit.
				db.close();
			}

		});
	}

});

