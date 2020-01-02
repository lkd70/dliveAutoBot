'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ api: { version: 1 } }));

router.get('/bots', (req, res) => {
	const resp = { api: { version: 1 }, bots: [] };
	resp.bots = global.bots.filter(b => req.query.active === undefined ? 1
		: b.active === [ 'true', '1', '' ].includes(req.query.active.toLowerCase())).map(bot => ({
		name: bot.DisplayName,
		active: bot.active
	}));

	res.json(resp);
});

router.get('/store/:name', (req, res) => {
	const resp = { api: { version: 1 } };
	global.bots.filter(b => req.params.name === b.DisplayName).map(bot => bot.getAllStreamData().then(data => {
		resp.store = data;
		res.json(resp);
	}));
});

router.get('/bot/:name', (req, res) => {
	const resp = { api: { version: 1 }, bots: [] };
	resp.bots = global.bots.filter(b => req.params.name === b.DisplayName).map(bot => ({
		name: bot.DisplayName,
		active: bot.active
	}));

	res.json(resp);
});

router.get('/start/:name', (req, res) => {
	const resp = { api: { version: 1 }, success: false };
	global.bots.filter(b => req.params.name === b.DisplayName).forEach(bot => {
		resp.success = bot.start();
	});
	res.json(resp);
});

router.get('/stop/:name', (req, res) => {
	const resp = { api: { version: 1 }, success: false };
	global.bots.filter(b => req.params.name === b.DisplayName).forEach(bot => {
		resp.success = bot.stop();
	});
	res.json(resp);
});

module.exports = router;
