/**
	Copyright (c) 2016 Adobe Systems Incorporated. All rights reserved.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
"use strict";

var Q = require('q');
var request = require('request');
var fs = require('fs');
var path = require("path");
var mkdirp = Q.nfbind( require("mkdirp") );

module.exports = function (sourceUrl, filePath)
{
	var deferred = Q.defer();

	var fileFolderPath = path.dirname(filePath);
	
	mkdirp(fileFolderPath)
	.then(function () {
		try {
			request(sourceUrl, { encoding : null })
			.on('error', function (error) { 
				deferred.reject(error);	
			})
			.on('response', function(response) {
				if (response.statusCode === 404)
				{
					deferred.reject(new Error(`URL(${sourceUrl}) Not Found`));
				} else if (response.statusCode >= 500)
				{
					deferred.reject(new Error(`An unexpected server error occurred trying to download ${sourceUrl}:  ${response.statusCode} - ${response.statusMessage}`));
				} else if (response.statusCode >= 400)
				{
					deferred.reject(new Error(`An unexpected error occurred trying to download ${sourceUrl}:  ${response.statusCode} - ${response.statusMessage}`));
				}
			})
			.pipe(fs.createWriteStream(filePath))
			.on('finish', function () { 
				deferred.resolve();	
			});
		} catch (err) {
			deferred.reject(err);
		}

	});
	return deferred.promise;
}