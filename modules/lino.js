'use strict';

const formatLINO = lino => {
	let diamonds = 0, ice_creams = 0, lemons = 0, ninjaghinis = 0, ninjets = 0;
	lino /= 100000;
	const init_lino = lino;
	ninjets = Math.floor(lino / 10000);
	lino -= ninjets * 10000;
	ninjaghinis = Math.floor(lino / 1000);
	lino -= ninjaghinis * 1000;
	diamonds = Math.floor(lino / 100);
	lino -= diamonds * 100;
	ice_creams = Math.floor(lino / 10);
	lino -= ice_creams * 10;
	lemons = Math.floor(lino / 1);
	lino -= lemons * 1;
	return (ninjets > 0 ? ninjets + (ninjets === 1 ? ' ninjet' : ' ninjets') : '') +
		(ninjaghinis > 0 ? (ninjets ? lemons + ice_creams + diamonds + ninjaghinis ? ', ' : ' and ' : '') +
			ninjaghinis + (ninjaghinis === 1 ? ' ninjaghini' : ' ninjaghinis') : '') +
		(diamonds > 0 ? (ninjaghinis ? lemons + ice_creams + diamonds ? ', ' : ' and ' : '') +
			diamonds + (diamonds === 1 ? ' diamond' : ' diamonds') : '') +
		(ice_creams > 0 ? (diamonds ? lemons + ice_creams ? ', ' : ' and ' : '') + ice_creams +
			(ice_creams === 1 ? ' ice cream' : ' ice creams') : '') +
		(lemons > 0 ? (ice_creams ? ', and ' : '') + lemons +
			(lemons === 1 ? 'lemon ' : 'lemons ') : init_lino < 1 ? ` LINO: ${init_lino}` : '');
};

module.exports = {
	responses: [
		{ match: /^!lino$/i,
			response: bot => new Promise((resolve, reject) => {
				bot.api.getLivestreamProfileWallet(bot.api.displayname).then(w => w.wallet.balance).then(formatLINO).then(l => {
					resolve(`${bot.api.displayname} has ${l}.`);
				}).catch(err => reject(err));
			})
		},
		{ match: /^!mylino$/i,
			response: (bot, msg) => new Promise((resolve, reject) => {
				bot.api.getLivestreamProfileWallet(msg.sender.displayname).then(w => w.wallet.balance).then(formatLINO).then(l => {
					resolve(`@${msg.sender.displayname}, you have ${l}.`);
				}).catch(err => reject(err));
			})
		},
	]
};
