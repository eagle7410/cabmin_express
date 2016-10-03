/**
 * Created by igor on 01.10.16.
 */

var list = {
	helloy : {
		method : (req, res) => {
			res.render('helloy');
		},
		title : 'Helloy',
		showInMenu : true,
		dropmenu : false
	},
	helloy2 : {
		method : (req, res) => {
			res.render('helloy/index');
		},
		title : 'Helloy2',
		showInMenu : true,
		dropmenu : false
	},
	helloy3 : {
		method : (req, res) => {
			res.render('helloy/helloy/index', {login : req.cookies.login});
		},
		title : 'Helloy3',
		groups : 'dev',
		showInMenu : true,
		dropmenu : false
	},
	advertisers: {
		title: 'Рекламодатели',
		showTitle: true,
		showInMenu: true,
		submenu : 'Рекламодатели',
		subOrder : 1,
		method: (req, res) => {
			~['active', 'deactive', 'other'].indexOf(req.query.tab) ?
				res.render('adv/' + (req.query.tab || 'active') + '/index') :
				res.redirect('advertisers?tab=active');
		},
		order: 1,
		tabs: {
			'active': {
				title: 'Активные',
				note: 'Активные рекламодатели',
				locked: false
			},
			'deactive': {
				title: 'На модерации',
				note: 'Рекламодатели на модерации',
				locked: false
			},
			'other': {
				title: 'Отклоненные',
				note: 'Отклоненные рекламодатели',
				locked: false
			}
		}
	}
};

module.exports = () =>  list;

