
var list = {
	404 : {
		title: 'Page not found',
		method: (req, res) => res.status(404).render('404'),
		showTitle: true,
		showInMenu: false
	}
};

module.exports = (user) => list;
