'use strict';

module.exports = {
	responses: [
		// This example shows that we can send back data to the resolve() method and it'll add that data to the "bot.data" object on the bot.
		// This is a useful way to store session data.
		{ match: /^!lurk$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (!('lurkers' in bot.api.data)) bot.api.data.lurkers = [];
				if (bot.api.data.lurkers.map(u => u[0]).includes(msg.sender.displayname)) {
					resolve('@{sender.displayname} You\'re already lurking! Go lurk damn it', bot.api.data);
				} else {
					bot.api.data.lurkers.push([ msg.sender.displayname, Date.now() ]);
					resolve('Enjoy your lurk @{sender.displayname}');
				}
			})
		},
		{ match: /^:emote\/.*\/3741625260081e3_300300:$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (!('lurkers' in bot.api.data)) bot.api.data.lurkers = [];
				if (bot.api.data.lurkers.map(u => u[0]).includes(msg.sender.displayname)) {
					resolve('@{sender.displayname} You\'re already lurking! Go lurk damn it', bot.api.data);
				} else {
					bot.api.data.lurkers.push([ msg.sender.displayname, Date.now() ]);
					resolve('Enjoy your lurk @{sender.displayname}');
				}
			})
		},
		{ match: /^!unlurk$/i,
			response: (bot, msg) => new Promise(resolve => {
				if (!('lurkers' in bot.api.data)) bot.api.data.lurkers = [];
				if (bot.api.data.lurkers.map(u => u[0]).includes(msg.sender.displayname)) {
					bot.api.data.filters = bot.api.data.lurkers.filter(u => u[0] !== msg.sender.displayname);
					resolve('@{sender.displayname} has returned!', bot.api.data);
				} else {
					resolve('@{sender.displayname}, You were gone?');
				}
			})
		}
	],
	listeners: [
		[
			'ChatText',
			(bot, res) => new Promise(resolve => {
				if (!('lurkers' in bot.api.data)) bot.api.data.lurkers = [];
				if (bot.api.data.lurkers.map(u => u[0]).includes(res.sender.displayname)) {
					bot.api.data = bot.api.data.lurkers.filter(u => u[0] !== res.sender.displayname);
					resolve('Welcome back @{sender.displayname}!', bot.api.data);
				}
			})
		],
		[
			'ChatOffline',
			bot => new Promise(resolve => {
				bot.api.data.lurkers = [];
				resolve(null, bot.api.data);
			})
		]
	]
};
