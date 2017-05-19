# Cabmin
Simple control panel for [Node.js](http://nodejs.org) based on express
![Cabmin screenshot](http://msrv.su/files/screen.png)
![Cabmin screenshot 2](http://msrv.su/files/screen2.png) 
Used swig and cahe him.
    

## How To Install   
```bash
npm install cabmin_express --save
```

## Getting Started

```js
var express = require('express');
var app = express();
var cabmin = require('cabmin_express');

cabmin.init(express, app, {
	require : { logger : true },
	users : {tds : { password : 'pass', groups: 'dev' } }
}, function (e) {

	if (e) {
		return console.log('ERR:', e);
	}

	var port = process.env.port || 3000;
	app.listen(port, function () {
		console.log(`Example app listening on port ${port}!`);
	});
});

```

## Create section in cabmin
 
**/controllers/news.js**   
   
```js
module.exports = function(user) { 
    return {
        "news": {
            title: 'News panel',
            method: function(req, res, next) {
                res.render('newsTPL', {data:'This is backend', test:'Check Me'});
                next();
            }
        }
    };
};
```
   
**/views/newsTPL.html**

```html
<div class="wow">
    <img src="http://msrv.su/files/test.png" />
    <h3>{{ data }}</h3>
    <input type="checkbox" id="c" checked /> {{ test }}
</div>
```
   
**Result:**
![Cabmin screenshot](http://msrv.su/files/totem.png)

## Groups section in cabmin
For groupings sections, use the following options in the controllers: submenu, subOrder.  
When submenu is name group, subOrder is order in menu.

**/controllers/admins.js**  
   
```js
module.exports = function(user) {
    return {
        "admin": {
            title: 'Administration',
            submenu : 'Users',
            order: 2,
            method: function(req, res, next) {
                res.render('adminTPL', {});
                next();
            }
        }
    };
};
```

**/views/adminTPL.html**

```html
<h3>Here, about the administration</h3>
```

**/controllers/users.js**  
   
```js
module.exports = function(user) {
    return {
        "users": {
            title: 'Users',
            submenu : 'Users',
            order: 1,
            method: function(req, res, next) {
                res.render('userTPL', {});
                next();
            }
        }
    };
};
```

**/views/userTPL.html**

```html
<h3>Here, about the users</h3>
```

**Result:**
![Cabmin screenshot](https://raw.githubusercontent.com/mirrr/cabmin/master/cb-public/img/submenu.jpg)

## Examples
Coming soon...
   
   
## People

Author and developer is [Igor Stcherbina](https://github.com/eagle7410), and co-author [Oleksiy Chechel](https://github.com/mirrr).
   
## License
   
MIT License


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
