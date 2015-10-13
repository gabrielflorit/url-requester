#!/usr/bin/env node
'use strict';

var request = require('request');
var RateLimiter = require('limiter').RateLimiter;

var argv = require('yargs').option('h', {
	alias: 'host',
	describe: 'mongodb host',
	type: 'string',
	'default': '127.0.0.1'
}).option('p', {
	alias: 'port',
	describe: 'mongodb port',
	type: 'integer',
	'default': 27017
}).option('d', {
	alias: 'database',
	describe: 'database name',
	type: 'string',
	demand: true
}).option('c', {
	alias: 'collection',
	describe: 'collection name',
	type: 'string',
	demand: true
}).option('u', {
	alias: 'unit',
	describe: 'rate limit unit',
	'default': 'minute',
	type: 'string'
}).option('n', {
	alias: 'number',
	describe: 'rate limit number of units',
	'default': 1,
	type: 'integer'
}).option('a', {
	alias: 'address',
	describe: 'address template',
	demand: true,
	type: 'string'
}).argv;

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://' + argv.host + ':' + argv.port + '/' + argv.database, function (err, db) {

	var collection = db.collection(argv.collection);

	var limiter = new RateLimiter(argv.number, argv.unit);

	var pace;

	// get the number of documents we're going to geocode
	collection.count({ geocode: { $exists: false } }, function (err, doc) {

		pace = require('pace')({
			total: doc,
			itemType: 'rows'
		});

		makeARequestOrExit();
	});

	function makeARequestOrExit() {

		// try to find a doc with no geocode
		collection.findOne({ geocode: { $exists: false } }, function (err, doc) {

			if (doc) {

				// make a request
				limiter.removeTokens(1, function (err, remainingRequests) {

					// construct the address from user-supplied template string
					var address = argv.address.replace(/({(.*?)})/g, function (match, p1, p2) {

						return doc[p2];
					});

					var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address;

					request(url, function (error, response, body) {

						if (!error && response.statusCode === 200) {

							var geocode = JSON.parse(body);
							var location = geocode.results[0].geometry.location;
							var lat = location.lat;
							var lng = location.lng;

							var update = { geocode: geocode, lat: lat, lng: lng };

							collection.updateOne({ _id: doc._id }, { $set: update }, function (a, b, c) {

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
