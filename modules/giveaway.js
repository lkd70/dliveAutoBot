'use strict';

module.exports = {
	responses: [
		{ match: /^!giveaway$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (msg.roomRole === 'Owner') {
					if (!('giveaway' in bot.api.data)) bot.api.data.giveaway = false;
					if (bot.api.data.giveaway) {
						resolve('A giveaway is already active. To choose a winner, type !draw, to reset the entries, type:' +
						+' !reset, Or to cancel the giveaway, type: !cancel');
					} else {
						bot.api.data.giveaway = true;
						resolve('Starting giveaway! To enter, type !enter', bot.api.data);
					}
				}
			})
		},
		{ match: /^!cancel$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (msg.roomRole === 'Owner') {
					if (!('giveaway' in bot.api.data)) bot.api.data.giveaway = false;
					if (bot.api.data.giveaway) {
						bot.api.data.giveaway = false;
						bot.api.data.entry = [];
						resolve('Giveaway cancelled', bot.api.data);
					} else {
						resolve('There\'s no giveaway active to cancel...');
					}
				}
			})
		},
		{ match: /^!enter$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (!bot.api.data.entry) bot.api.data.entry = [];
				if (!('giveaway' in bot.api.data)) bot.api.data.giveaway = false;
				if (bot.api.data.giveaway) {
					if (bot.api.data.entry.includes(msg.sender.displayname)) {
						resolve('You\'re already in the giveaway @{sender.displayname}');
					} else {
						bot.api.data.entry.push(msg.sender.displayname);
						resolve('You\'ve been entered in to the giveaway @{sender.displayname}', bot.api.data);
					}
				} else {
					resolve('No giveaway is active.');
				}
			})
		},
		{ match: /^!draw$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (msg.roomRole === 'Owner') {
					if (!('giveaway' in bot.api.data)) bot.api.data.giveaway = false;
					if (!bot.api.data.entry) bot.api.data.entry = [];
					if (bot.api.data.giveaway) {
						if (bot.api.data.entry.length > 0) {
							bot.api.data.giveaway = false;
							const winner = bot.api.data.entry[Math.floor(Math.random() * bot.api.data.entry.length)];
							bot.api.data.entry = [];
							resolve(`The winner is... @${winner}! 🎉🎉🎉`, bot.api.data);
						} else {
							resolve('Not enough entries yet to draw a winner...');
						}
					} else {
						resolve('No giveaway is active...');
					}
				}
			})
		},
		{ match: /^!reset$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (msg.roomRole === 'Owner') {
					if (!('giveaway' in bot.api.data)) bot.api.data.giveaway = false;
					if (bot.api.data.giveaway) {
						bot.api.data.entry = [];
						resolve('Giveaway entries reset', bot.api.data);
					} else {
						resolve('There\'s no giveaway active to reset...');
					}
				}
			})
		},
		{ match: /^!entries$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (msg.roomRole === 'Owner') {
					if (!('entry' in bot.api.data)) bot.api.data.entry = [];
					if (!('giveaway' in bot.api.data)) bot.api.data.giveaway = false;
					if (bot.api.data.giveaway) {
						resolve(`Giveaway entries: ${bot.api.data.entry.length}`);
					} else {
						resolve('There\'s no giveaway active...');
					}
				}
			})
		}
	]
};
