/**
 * Created by igor on 09.10.16.
 */
"use strict";


require('minify-js').files([{
	file : './lib/default-pages/404.js',
	dist : './lib/prod/default-pages/404.js'
},{
	file : './lib/default-pages/access-denied.js',
	dist : './lib/prod/default-pages/access-denied.js'
},{
	file : './lib/default-pages/home.js',
	dist : './lib/prod/default-pages/home.js'
},{
	file : './lib/default-pages/logout.js',
	dist : './lib/prod/default-pages/logout.js'
},{
	file : './lib/controllers/utils.js',
	dist : './lib/prod/controllers/utils.js'
},{
	file : './lib/controllers/auth.js',
	dist : './lib/prod/controllers/auth.js'
},{
	file : './lib/index.js',
	dist : './lib/prod/index.js'
}], (e ,compess) => {

	if (e) {
		return console.log('ERR: ', e);
	}

	compess.run((e) => {
		console.log('All ready ' + (e ? 'Bad' : 'Succees'));
	})
});
