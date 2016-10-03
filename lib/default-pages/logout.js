
logout = (req, res, next) => {
	res.clearCookie('login', {path: req.options.baseUrl});
	res.clearCookie('hash', {path: req.options.baseUrl});
	res.redirect(require('../controllers/utils').baseUrl('auth'));
};


var list = {
	"logout": {
		title: 'Full logout',
		method: logout,
		showInMenu: true,
		dropmenu : true
	}
};
module.exports = (user) => list;

