'use strict';

module.exports = {
	listeners: [
		[
			'ChatGift', (bot, res) => new Promise(() => {
				bot.api.data.db.update(
					{ stream: bot.api.data.id },
					{
						$push: {
							donations: {
								name: res.sender.displayname,
								amount: res.amount,
								type: res.gift
							}
						}
					},
					{}
				);
			})
		],
		[
			'ChatText', (bot, res) => new Promise(() => {
				bot.api.data.db.update(
					{ stream: bot.api.data.id },
					{
						$addToSet: { chatters: res.sender.displayname },
						$inc: { messages: 1 }
					},
					{}
				);
			})
		],
		[
			'ChatHost', (bot, res) => new Promise(() => {
				bot.api.data.db.update(
					{ stream: bot.api.data.id },
					{
						$addToSet: {
							hosts: {
								displayname: res.sender.displayname,
								username: res.sender.username,
								viewers: res.viewer
							}
						},
						$inc: { messages: 1 }
					},
					{}
				);
			})
		],
		[
			'ChatFollow', (bot, res) => new Promise(() => {
				bot.api.data.db.update(
					{ stream: bot.api.data.id },
					{
						$addToSet: { followers: res.sender.displayname },
						$inc: { messages: 1 }
					},
					{}
				);
			})
		],
		[
			'ChatOffline', bot => new Promise(() => {
				if (bot.api.data.id) {
					bot.api.data.db.update(
						{ stream: bot.api.data.id },
						{ $set: { end: Date.now() } },
						{}
					);
				} else {
					bot.api.data.id = null;
				}
			})
		],
		[
			'ChatLive', bot => new Promise(() => {
				bot.api.getLivestreamPage().then(ls => {
					if ('livestream' in ls) {
						bot.api.data.id = ls.livestream.id;
						bot.api.data.db.insert({
							stream: ls.livestream.id,
							title: ls.livestream.title,
							category: ls.livestream.category.title,
							messages: 0,
							duration: 0,
							start: Date.now(),
							end: 0,
							chatters: [],
							donations: [],
							hosts: [],
							followers: []
						});
					}
				});
			})
		]
	],
	responses: [
		{
			match: /^!stats(?: \w+){0,}$/i,
			response: (bot, msg) => new Promise((resolve, reject) => bot.api.getCurrentStreamData().then(data => {
				const filters = msg.content.split(' ');
				filters.shift();
				if (filters.length) {
					let local_msg = 'Stats: ';
					if (filters.includes('m')) local_msg += `M:${data.messages} `;
					if (filters.includes('h')) local_msg += `H:[${data.donations.map(d => d.name).join(',')}] `;
					if (filters.includes('d')) local_msg += `D:[${data.donations.map(d => d.name).join(',')}] `;
					if (filters.includes('f')) local_msg += `F:[${data.followers.join(',')}] `;
					if (local_msg !== 'Stats: ') resolve(local_msg);
				} else {
					resolve([
						`Stats: M:${data.messages}`,
						`D:[${data.donations.map(d => d.name).join(',')}]`,
						`H:[${data.hosts.map(h => h.name).join(',')}]` ].join(' '));
				}
			}).catch(err => {
				reject(new Error('An error occurred: ' + err));
			}))
		}
	]
};
