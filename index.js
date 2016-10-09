/**
 * Created by igor on 01.10.16.
 */
"use strict";
module.exports = require(`./lib${process.env.NODE_ENV !== 'dev' ? '/prod': ''}/index`);


