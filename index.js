/**
 * Created by igor on 01.10.16.
 */
var express = require('express');
var app = express();
var cabmin = require('./lib');

cabmin.init(express, app, {
	require : { logger : true },
	users : {tds : { password : 'fack', groups: 'req' } }
}, function (e) {

	if (e) {
		return console.log('ERR:', e);
	}

	var port = process.env.port || 3000;
	app.listen(port, function () {
		console.log(`Example app listening on port ${port}!`);
	});
});


