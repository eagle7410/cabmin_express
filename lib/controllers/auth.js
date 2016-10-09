"use strict";
let utils  = require('./utils');
let myUtil = require('utils-igor')(['obj', 'str', 'date']);

exports.test = (req, res, next) => {

	req.options.log.info('Start test auth');

	var login = req.cookies.login;
	var hash  = req.cookies.hash;

	if (req.options.noAuth || req.params.module === 'logout') {
		req.options.log.info('Start test auth not use');
		return next();
	}

	var authUrl = utils.baseUrl('auth');

	if (
		login &&
		hash &&
		req.options.users[login] &&
		exports.checkLogin(login, hash, req.options.users[login])
	) {
		req.options.log.info('Start test auth sucess ', req.originalUrl, (req.originalUrl !== authUrl ));
		req.options.user = myUtil.obj.ext({login: login, groups : ''}, req.options.users[login]);
		(req.originalUrl !== authUrl ? next() : res.redirect(utils.baseUrl('home'))) ;
	} else {
		req.options.log.warn('Start test auth bad. Redirect to auth');
		res.clearCookie('hash', {path: req.options.baseUrl});
		res.clearCookie('login', {path: req.options.baseUrl});
		res.cookie('back', req.baseUrl,  { maxAge: myUtil.date.ts.DAY, path: req.options.baseUrl});
		res.redirect(authUrl);
	}

};
exports.checkLogin = (login, hash, settings) => myUtil.str.hash(settings.hash + login + 'slt',null,'md5') === hash;
exports.render = (req, res, next) => {

	req.options.log.info('Auth render start');

	var login = req.cookies.login || null;

	if (login) {
		return exports.test(req, res, next);
	}

	login = req.body.login || null;

	// Данные с формы
	if (
		login &&
		req.body.password &&
		req.body.entercabmin &&
		req.options.users[req.body.login] &&
		myUtil.str.hash(req.body.password) === req.options.users[login].hash
	) {

		if (req.body.remember) {
			res.cookie('remember', '1', { maxAge: 3 * myUtil.date.ts.YEAR, path: req.options.baseUrl});
			req.cookies.remember = true;
		} else {
			res.clearCookie('remember', {path: req.options.baseUrl});
			req.cookies.remember = false;
		}

		var hash  = myUtil.str.hash(req.options.users[login].hash + login + 'slt', null, 'md5');
		var back  = req.cookies.back || req.options.home;

		res.cookie('login', login, { maxAge: 3 * myUtil.date.ts.YEAR, path: req.options.baseUrl});
		res.cookie('hash',hash,  req.cookies.remember ? { maxAge: 3 * myUtil.date.ts.YEAR, path: req.options.baseUrl} : {path: req.options.baseUrl});

		res.clearCookie('back');

		req.options.log.info('Auth render back to ' + back);

		return res.redirect(back);
	}

	req.options.log.info('Auth render get', utils.renderData(req,{
		login: login,
		isBad : req.method === 'POST'
	}));

	res.render(__dirname + '/../views/auth-content.html', utils.renderData(req,{
		login: login,
		isBad : req.method === 'POST'
	}));
};
