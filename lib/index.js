/**
 * Created by igor on 01.10.16.
 */
"use strict";

// Modules && utils

let myUtils = require('utils-igor')(['obj', 'str']);
let utils  = require('./controllers/utils');
let path   = require('path');
let swig   = require('swig');

exports.init = (express, app, opt, cb) => {
	opt = opt || {};

	var router = require('express').Router();

	router.options = myUtils.obj.ext({
		title: 'Cabmin',
		baseUrl: '/cabmin',
		staticUrl: '/cabmin/files',
		mainPage: '/',
		syntax: 'xcode',
		users: {
		},
		path: path.resolve() + '/cabmin/controllers',
		views: path.resolve() + '/cabmin/views',
		menu: [],
		noAuth: false,
		require :{
			cookies : true,
			logger : false,
			body : true,
			swig : swig
		},
		loadDefaults: true
	}, opt || {});

	myUtils.obj.each(router.options.users, (login , data) => data.password && !data.hash ?
		router.options.users[login].hash = myUtils.str.hash(data.password) :
		null
	);

	router.options.home = opt.home || router.options.baseUrl + router.options.mainPage;

	// Include extended for express

	if (router.options.require.cookies) {
		app.use(require('cookie-parser')());
	}

	if (router.options.require.body) {
		let bodyParser = require('body-parser');
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
	}

	if (router.options.require.logger)
		app.use(require('morgan')('dev', {
			skip: (req, res) => ~req.originalUrl.indexOf(router.options.staticUrl) && res.statusCode !== 404 ? true : false
		}));

	// -- Include extended for express

	// Include favicon
	app.use(router.options.staticUrl + '/favicon.ico', express.static(__dirname + '/cb-public/favicon-test.ico'));

	// Include statics files
	app.use(router.options.staticUrl + '/', express.static(__dirname + '/cb-public'));


	// Include template & engine for him

	var views = [{path : __dirname + '/views'}];

	if (router.options.views )
		views = views.concat(Array.isArray(router.options.views) ? router.options.views : [router.options.views]);


	router.options.fullViews = views;

	app.engine('html', swig.renderFile);

	myUtils.obj.each({
		'view engine' : 'html',
		'case sensitive routing': false,
		'views': views
	}, (key, val) => app.set(key, val));

	// Load external controllers
	utils.load(router.options, (e) => {
		if (e)
			 return cb(e);

		// Include routers
		utils.addRouters(router, app, cb);
	});

};
