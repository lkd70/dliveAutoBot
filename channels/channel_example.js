'use strict';

// The channel file must be named after the DLive channels displayname EXACTLY.

// You can define local functions to be used within the module.
const formatSeconds = (sec, and = true) => {
	sec = Number(sec);
	const d = Math.floor(sec / 86400);
	const h = Math.floor(sec % 86400 / 3600);
	const m = Math.floor(sec % 86400 % 3600 / 60);
	const s = Math.floor(sec % 86400 % 3600 % 60);

	return (d > 0 ? h + (h === 1 ? ' day' : ' days') : '') +
			(h > 0 ? (d ? ', ' : '') + h + (h === 1 ? ' hour' : ' hours') : '') +
			(m > 0 ? (h ? ', ' : '') + m + (m === 1 ? ' minute' : ' minutes') : '') +
			(s > 0 ? (m ? ', ' + (and ? 'and ' : '') : '') + s + (s === 1 ? ' second' : ' seconds') : '');
};
// End of local functions

// This is the object that will be exported to the bot.
// All response/message strings have access to the message object. It can be referenced within curley braces "{}".
// Example: For the message.sender.displayname string, you'd do: {sender.displayname}

module.exports = {
	active: false,
	// Modules can be imported here. Modules are exported 'responses' objects.
	modules: [
		'admin',
		'giveaway',
		'lino',
		'lurk',
		'stats',
	],
	cooldown: {
		ChatGift: 5 // cooldown for chat gift responses in seconds
	},
	responses: [
		// Responses will respond to regex matches in the chat.
		// You can respond with a string, an array of strings (one will be picked at random) or a promise containing a string
		// (which is resolved to the send function)
		// If a promise is used, you can crate an error with in reject() which will be caught and thrown by the bot.
		// Note: When providing your 'match' regex, don't add the global (g) flag, it will skip a message each time in that case.
		{ match: /!ping/i, response: 'PONG!' },
		{ match: /!uptime$/i,
			response: bot => new Promise((resolve) => {
				if (bot.START_TIME > 0) {
					resolve(formatSeconds((Date.now() - bot.START_TIME) / 1000));
				} else {
					resolve('Sorry, {sender.displayname} is not live (Or this bot was not started before the stream was...)');
				}
			})
		},
		{ match: /!ding/i, response: ':emote/mine/dlive-16407341/385acd9c2005020_300300:' },
		{ match: /:emote\/.*\/385acd9c2005020_300300:/i,
			response: [
				'RIP daddy ding ding!',
				'F </3',
				'RIP Ding Ding 2019-2019'
			]
		},
		{ match: /!roll/i,
			response: [
				'What do you think I am? A ball?',
				'What do you think I am? Rick Astley?',
				'We\'re no strangers to loooove, you know the rules and so do I!',
				'ROCK AND ROLL!',
				'The wheels on the bus go round and round',
				'Keep rollin\' rollin\' rollin\' rollin\' WAAAAT?',
				'If you spent less money on lemons and more money on dice you\'d not need to ask',
				'We\'re rolling! rolling! Rolling on the river!'
			]
		},
		{ match: /!viewers/i,
			response: bot => new Promise((resolve, reject) => {
				bot.getLivestreamPage(bot.displayname).then(res => {
					if (res.livestream === null) {
						resolve(`${bot.displayname} has 0 viewers, probably becuase they're not live...`);
					} else {
						resolve(`${bot.displayname} has ${res.livestream.watchingCount} viewers!`);
					}
				}).catch(err => reject(err));
			})
		},
		{ match: /!game/i,
			response: bot => new Promise((resolve, reject) => {
				bot.getLivestreamPage(bot.displayname).then(res => {
					if (res.livestream === null) {
						resolve(`${bot.displayname} isn't live right now.`);
					} else {
						resolve(`${bot.displayname} is streaming ${res.livestream.category.title}.`);
					}
				}).catch(err => reject(err));
			})
		},
		{ match: /!commands/i, response: 'Commands are as follows: !lurk, !discord, !unlurk, !hydrate' },
		{ match: /!discord/i, response: 'I should probably make a Discord server...' },
		{ match: /!hydrate/i, response: 'Don\'t forget to drink some water!' },

	],
	// Leaving these blank will disable them
	on: {
		lemon: 'mmmm lemons',
		ice_cream: 'mmmmm sweet stuff',
		diamond: 'Gib me diamond',
		ninjaghini: 'Wew, cheers {sender.displayname}',
		ninjet: 'Thanks for the ninje... What? What is wrong with you {sender.displayname}?',
		follow: 'Welcome {sender.displayname}!',
		ban: 'Buhbye @{sender.displayname}!',
		sub: 'Welcome to the sub club @{sender.displayname}!',
		host: 'Welcome everyone!',

	},
	// These are messages that'll be triggered every 'minutes'.
	every: [
		{ minutes: 59, message: 'Don\'t forget to drink water!' },
	],
	// These are custom event listeners. Mostly intended for modules.
	listeners: [
	]
};
