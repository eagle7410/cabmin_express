# Cabmin
Simple control panel for [Node.js](http://nodejs.org) based on express
![Cabmin screenshot](http://msrv.su/files/screen.png)
![Cabmin screenshot 2](http://msrv.su/files/screen2.png) 

    

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

Developer is [Igor Stcherbina](https://github.com/eagle7410)
   


## License
   
MIT License
