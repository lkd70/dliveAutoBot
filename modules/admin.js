'use strict';


module.exports = {
	responses: [
		{
			match: /^!restart$/i,
			response: (bot, msg) => new Promise(() => {
				if (msg.roomRole === 'Owner') {
					bot.start('Bot has restarted', 'Failed to restart bot');
				} else {
					bot.send('This command is for the channel owner only.');
				}
			})
		}
	]
};
