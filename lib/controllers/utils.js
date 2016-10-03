// Modules && utils
var crypto = require('crypto');
var extend = require('util')._extend;
var async = require('async');
var path   = require('path');
var fs = require('fs');

// Vars
var cacheOptions = {};
var cacheTemplate = {};
var mainLayout = '';
var noop = () => null;
var log = {
	error : noop,
	info : noop,
	warn : noop,
	err : noop
};


exports.load = (options) => {

	var path = options.path;
	var controllers = {};
	var reinfo = {};

	fs.readdirSync(path).forEach(function (el) {
		// Require only .js files
		if (/.*\.js$/gi.test(el)) {
			var module = require(path + '/' + el);

			if (exports.isFn(module)) {
				var info = module();

				if (exports.isObj(info)) {

					for (var r in info) {
						reinfo[r] = module;
					}

					extend(controllers, info);
				}
			}
		}
	});

	for (var r in controllers) {
		controllers[r] = extend({
			title: '',
			route: r,
			showTitle:  true,
			showInMenu: true,
			parentMenu: '/',
			order: 5,
			count: 0,
			groups: 'all',
			url: (options.baseUrl + '/' + r),
			note: '',
			active: 0
		}, controllers[r]);
		options.menu.push(controllers[r]);
	}

	options.menu.sort((a, b) => a.order > b.order ? 1 : (a.order < b.order ? -1 : 0) );

	exports.add(options, controllers);

	if (options.reinfo) {
		extend(options.reinfo, reinfo);
	} else {
		options.reinfo = reinfo;
	}


	if (options.loadDefaults) {
		options.loadDefaults = false;
		options.path = __dirname + '/../default-pages';
		exports.load(options);
	}

};

// log event
process.env.debugRouter = true;
if (process.env.debugRouter) {
	var winston = require('winston');

	log = new winston.Logger({
		transports: [
			new winston.transports.Console({
				level: 'debug',
				handleExceptions: true,
				json: false,
				colorize: true
			})
		],
		exitOnError: false
	});

	log.err = log.error;
}

exports.loadTemplate = (router, cb) => {

	async.parallel({ layout : (taskEnd) => {

		if (mainLayout && mainLayout.length) {
			taskEnd();
		}

		fs.readFile(__dirname + '/../views/index.html', (e, data) => {

			if (e) {
				return cb(e);
			}

			mainLayout = data.toString();

			taskEnd();
		});
	}, views : function (taskEnd) {
		var scan =  (dir, endDir, add) => {
			fs.readdir(dir, (e, arFile) => {

				if (e) {
					return end(e);
				}

				var ext = '.html';
				var folder = [];
				async.map(
					arFile.filter((file)  =>{
						if (~file.indexOf(ext)) {
							return true;
						}

						try {
							var stats = fs.lstatSync(dir + '/' + file);

							if (stats.isDirectory()) {
								folder.push(file);
							}

						} catch (e) {
							console.log('ERR: Get stats', e);
						}

						return false;

					} ).map((file) => dir + '/' + file),
					(filePath, end) => {
						fs.readFile(filePath, (e, data) => {

							if (e) {
								return end(e);
							}

							cacheTemplate[cacheKey(path.basename(filePath, ext), add)] = data.toString();
							end();
						});


					},
					(e) => {

						if (e || !folder.length) {
							return endDir(e);
						}


						async.map(folder, (folder, endFolder) => {
							scan(dir + '/' + folder, endFolder, cacheKey(folder, add));
						}, endDir)
					}
				);
			});

		};

		async.map(cacheOptions.fullViews, scan, taskEnd);

	}}, cb);
};
cacheKey = (main, attach) => attach ? attach + '/' + main : main;
exports.addRouters = (router, app, cb) => {

	cacheOptions = router.options;

	exports.loadTemplate(router, (e) => {

		if (e) {
			return cb(e);
		}

		log.info('Load template suceess');

		// Прикрепляем опции к зпаросу
		app.use(exports.baseUrl(), (req, res, next) => {

			(req.options) ?
				extend(req.options, mainOption) :
				extend(req, {options: extend({}, cacheOptions)});

			req.options.log = log;

			log.info('Attach option to req');

			next();

		});

		var auth = require('./auth');
		app.use(exports.baseUrl('auth'), auth.render);
		app.use(exports.baseUrl(':module'), auth.test, (req, res, next) => {

			log.info( 'Start get module ' + req.params.module);

			if (req.params.module === 'auth') {
				return res.redirect('home');
			}

			var module = req.options.modules[req.params.module];

			if (module && exports.isFn(module.method) ) {
				log.info( 'Module ' + req.params.module + ' find');

				if (!module.noDefLayout) {

					log.info( 'Change render ');

					res.render = (view, options, callback)=> {

						res.req.options.log.info(`Process view ${view}`);

						if (options && options.noDef) {
							return res.render(view, options, callback);
						}


						if (exports.isFn(options)) {
							callback = options;
							options = {};
						}

						var content = cacheTemplate[view] || null;

						if (!content) {
							return res.render(view, options, callback);
						}

						content = mainLayout.replace('{{ content }}', content);

						options = options || {};

						options = exports.ext(options, res.req.options);

						options.login = options.login ||
							(
								res.req &&
								req.res.cookies &&
								req.res.cookies.login ?
									req.res.cookies.login :
									null
							);

						options = exports.renderData(res, options);

						content = cacheOptions.require.swig.render(content,{ locals: options } );

						if (exports.isFn(callback)) {
							return callback(null, content);
						}

						res.send(content);

					};
				}

				exports.handelOption(req, res, next);


			} else {
				log.warn( 'Module ' + req.params.module + ' 404');
				res.redirect(exports.baseUrl('404'));
			}


		});
		app.use(exports.baseUrl(), auth.test, (req, res) => res.redirect(exports.baseUrl('home')));
		cb();
	});

};
exports.handelOption = (req, res, next, cb) => {

	var page = req.options.modules[req.params.module];

	var user = req.options.user || false;
	var u = user ? req.options.users[user.login] : {upd: 0};
	var updated = false;

	// set tabs
	if (page && page.tabs) {

		var firstTab;
		var activeTab;

		for (var i = 0; i< page.tabs.length; ++i) {

			var tabKey = page.tabs[i];

			if (!firstTab) {
				firstTab = tabKey;
			}

			if (tabKey === 'default' && !activeTab) {
				activeTab = 'default';
			}

			if (req.query.tab && tabKey === req.query.tab) {
				activeTab = tabKey;
			}
		}

		page.activeTab = activeTab || firstTab;
	}

	if (user || req.options.noAuth) {
		var sec = parseInt(Date.now() / 1000, 10);

		if (!u.upd || Number(u.upd) !== sec) {
			u.upd = sec;
			req.options.menu.forEach(function (el, i) {
				var info = req.options.reinfo[req.options.menu[i].route](req.options.noAuth ? false : user);
				exports.add(req.options, info);
			});
		}

		updated = true;
	}

	req.options.page = page || { groups : ''};
	req.current = page;

	var iterMap = (el) => String(el.trim());

	req.options.page.groups = req.options.page.groups || '';

	var pg = req.options.page.groups.split(',').map(iterMap);
	var ug = (user && user.groups) ? user.groups.split(',').map(iterMap) : [];

	ug.push('all');

	// Remove unnecessary section menu
	if (user && user.groups) {
		req.options.menu = req.options.menu.filter((el) => {
			if (!el.groups) return false;
			var g = el.groups.split(',').map(iterMap);

			if (!exports.arrayTest(ug, g).length) {
				el.showInMenu = false;
			}

			return true;
		});
	}

	if (!exports.arrayTest(ug, pg).length) {
		log.warn('Access denied ', 'user', ug,'page', pg);
		return res.redirect(exports.baseUrl('access-denied'));
	}

	// Set active section menu
	req.options.menu.forEach(function (el, i) {
		if (updated) extend(req.options.menu[i], req.options.modules[req.options.menu[i].r]);
		el.active = exports.baseUrl(page.route.toLowerCase())  === el.url.toLowerCase();
	});

	// Set submenus
	var submenus = {};

	req.options.menu.forEach((el, i) => {

		if (el.submenu && el.submenu.length) {

			if (!submenus[el.submenu]) {
				submenus[el.submenu] = {
					items : [],
					order : 1
				};
			}

			var sub = submenus[el.submenu];

			sub.items.push(el);

			if (el.subOrder) {
				sub.order = el.subOrder;
			}

			if (el.active) {
				sub.open = true;
			}

			req.options.menu[i].showInMenu = false;
		}

	});

	req.options.submenus = sortByProp(submenus, 'order');

	var p = req.path.replace(req.options.page.url + '/', '').split('/');
	extend(req.params, p);
	req.length = p.length;

	if (exports.isFn(cb)) {
		return cb();
	}

	page.method(req, res, next);

};
exports.renderData = (req, data) => exports.ext({
		staticUrl: cacheOptions.staticUrl,
		baseUrl : cacheOptions.baseUrl,
		content : '',
		title : '',
		login: req.cookies && req.cookies.login ? req.cookies.login : '',
		menu : cacheOptions.menu || {}
	},
	exports.isEmptyObj(data) ? {} : data
);
sortByProp = (obj, prop) => {
	var sortObj = {};
	var after = {};
	var r = {};

	exports.forObj(obj, (key, el) => {

		if (!el[prop]) {
			after[key] = el;
			return;
		}

		var k = el[prop];

		sortObj[k] = sortObj[k] || {};

		sortObj[k][key] = el;

	});

	exports.forObj(sortObj, (k, el) => {
		exports.forObj(el, (k, val) => { r[k] = val; });
	}, exports.objSortNum);

	return extend(r, after);

};
exports.hex2rgba = (hex, opacity) => {
	hex = hex.replace('#', '');
	var r = parseInt(hex.substring(0, 2), 16);
	var g = parseInt(hex.substring(2, 4), 16);
	var b = parseInt(hex.substring(4, 6), 16);

	return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
};
exports.add = (options, obj) => {

	if (exports.isObj(obj) ){
		(options.modules) ?
			exports.forObj(obj, (nm, el) => {
				(options.modules[nm]) ? extend(options.modules[nm], el) : options.modules[nm] = el;
			}) :
			options.modules = obj;
	}

};
exports.forObj = (obj, fnIter, fnSort) => {

	if(!exports.isObj(obj) || !exports.isFn(fnIter)) return;

	var keys = Object.keys(obj);

	if (exports.isFn(fnSort)) keys = keys.sort(fnSort);

	for (var i = 0; i < keys.length; ++i) {
		fnIter(keys[i], obj[keys[i]]);
	}keys
};
exports.arrayTest = (arr1, arr2) => arr1.filter((i) => ~arr2.indexOf(i) );
exports.objSortNum = (a, b) => a - b;
exports.isEmptyObj = (obj) => !exports.isObj(obj) || !obj || !Object.keys(obj).length;
exports.baseUrl = (attach) => cacheOptions.baseUrl + '/' + (attach || '' );
exports.isObj = (o) => typeof o === 'object';
exports.isFn = (fn) => typeof fn === 'function';
exports.ext =  (obj, add) => {
	var j = (obj, op) => {
		exports.forObj(op, (k) => {
			(exports.isObj(op[k])) ?
				(
					(!obj[k]) ? obj[k] = op[k] : j(obj[k], op[k])
				):
				obj[k] = op[k];
		});
	};

	j(obj || {}, add || {});

	return obj;
};
exports.MINUTE = 60  * 1000;
exports.HOUR   = 60  * exports.MINUTE;
exports.DAY    = 24  * exports.HOUR;
exports.WEEK   = 7   * exports.DAY;
exports.MONTH  = 30  * exports.DAY;
exports.YEAR   = 365 * exports.DAY;
exports.crypt  = (text, salt, type, secrect) => {
	type = type || 'md5';
	crypt = type === 'sha512' ?
		crypto.createHmac('sha512', secrect || 'r4ya6u7i8eu254t') :
		crypto.createHash(type);

	crypt.update(String(text));

	if (salt) {
		crypt.update(salt);
	}

	return crypt.digest('hex');
};
exports.sha512 = (text, secret, salt) => exports.crypt(text, salt, 'sha512', secret);
exports.md5 = exports.crypt;
