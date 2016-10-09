/**
 * Created by igor on 26.07.16.
 */
"use strict";

module.exports = function(grunt) {

	let arDefault = ['uglify', 'cssmin', 'htmlmin'];

	grunt.initConfig({

		uglify: {
			options: {
				mangle: false
			},
			js: {
				files: {
					'./lib/prod/cb-public/js/main.min.js': [
						'./lib/cb-public/js/jquery-2.1.1.min.js',
						'./lib/cb-public/js/common.js'
					],
					'./lib/prod/cb-public/js/ie.min.js': [
						'./lib/cb-public/js/css3-mediaqueries.js',
						'./lib/cb-public/js/html5shiv.js'
					],
					'./lib/prod/cb-public/js/auth.min.js': [
						'./lib/cb-public/js/jquery-2.1.1.min.js',
						'./lib/cb-public/js/jquery.checkbox.js',
						'./lib/cb-public/js/common.js'
					],
					'./lib/prod/cb-public/js/html5shiv.min.js': [ './lib/cb-public/js/html5shiv.js'	]
				}
			}
		},

		cssmin: {
			main: {
				files: {
					'./lib/prod/cb-public/css/auth.min.css': [
						'./lib/cb-public/css/form.css',
						'./lib/cb-public/css/radio-checkbox.css',
						'./lib/cb-public/css/font-awesome.min.css',
						'./lib/cb-public/css/fonts.css',
						'./lib/cb-public/css/style.css',
						'./lib/cb-public/css/auth.css'
					],
					'./lib/prod/cb-public/css/main.min.css': [
						'./lib/cb-public/css/default.css',
						'./lib/cb-public/css/icons.min.css',
						'./lib/cb-public/css/form.css',
						'./lib/cb-public/css/tables.css',
						'./lib/cb-public/css/sidebar.css',
						'./lib/cb-public/css/font-awesome.min.css',
						'./lib/cb-public/css/window.css',
						'./lib/cb-public/css/tabs.css',
						'./lib/cb-public/css/fonts.css',
						'./lib/cb-public/css/style.css'
					]
				}
			}
		},
		htmlmin: {                                     // Task
			dist: {                                      // Target
				options: {                                 // Target options
					removeComments: false,
					collapseWhitespace: true
				},
				files: {                                   // Dictionary of files
					'./lib/prod/views/access-denied.html': './lib/views/access-denied.html',
					'./lib/prod/views/auth-content.html': './lib/views/auth-content.html',
					'./lib/prod/views/home.html': './lib/views/home.html',
					'./lib/prod/views/auth.html': './lib/views/auth.html',
					'./lib/prod/views/404.html': './lib/views/404.html'
				}
			}
		},
		default : arDefault
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.registerTask('default', arDefault);
};



