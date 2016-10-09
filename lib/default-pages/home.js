/**
 * Created by igor on 03.10.16.
 */

var list = {
	home : {
		title : 'Main page',
		method: (req, res) => res.render('home'),
		showTitle: true,
		showInMenu: false
	}
};

module.exports = (user) => list;
