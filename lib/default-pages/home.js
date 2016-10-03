/**
 * Created by igor on 03.10.16.
 */

var list = {
	404 : {
		title : 'Main page',
		method: (req, res) => res.status(404).render('home'),
		showTitle: true,
		showInMenu: false
	}
};

module.exports = (user) => list;
