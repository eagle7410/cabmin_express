var list =  {
	"access-denied": {
		title: 'Access to this page is forbidden!',
		method: (req, res) => res.status(404).render('access-denied'),
		showTitle: false,
		showInMenu: false
	}
};

module.exports = (user) => list;
