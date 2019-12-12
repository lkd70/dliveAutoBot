'use strict';

const cleverbot = require('cleverbot-free');

module.exports = {
	listeners: [
		[
			'ChatText',
			(bot, res) => new Promise(resolve => {
				if (res.content.includes(bot.api.name)) {
					const msg = res.content.replace('@' + bot.api.name, '').replace(bot.api.name, '');
					if (msg.length > 1) {
						bot.getCurrentStreamData().then(data => {
							if (data) {
								cleverbot(msg, data.cleverbot_context ? data.cleverbot_context : []).then(resp => {
									bot.api.data.db.update(
										{ stream: bot.api.data.id },
										{ $push: { cleverbot_context: msg } },
										{}
									);
									resolve(resp);
								});
							}
						});
					}
				}
			})
		]
	]
};
