'use strict';

const DLive = require('dlivetv-api');
const DataStore = require('nedb');
const global_config = require('../config');
const format = require('string-format');
format.extend(String.prototype, {});

module.exports = class {
	constructor(init_channel_config, channel_name) {
		this.DisplayName = channel_name;
		this.init_channel_config = init_channel_config;
		this.active = false;
		this.START_TIME = undefined;
		this.COOLDOWN = false;
		this.name = null;

		// eslint-disable-next-line global-require
		this.debug = require('debug')('dliveautobot:bots:' + this.DisplayName);

		// Create DLive bot instence.
		if (this.init_channel_config.active) this.start();
	}

	send(message) {
		if ('sendMessage' in this.api) this.api.sendMessage(message).catch(() => setTimeout(this.send, 1000, message));
	}


	start(announce = '', error = '') {
		this.stop();
		this.api = new DLive(process.env.KEY | global_config.Dlive.key, this.DisplayName);
		this.getBotName();
		this.api.data = {};
		this.api.data.db = new DataStore({
			filename: `./store/bot_${this.DisplayName}.db`
		});
		this.api.data.db.persistence.setAutocompactionInterval(100000);
		this.active = true;
		this.START_TIME = Date.now();
		this.create_config();
		this.load();
		this.debug(`Started bot at ${this.START_TIME}`);
		if (announce !== '' && this.active === true) this.send(announce);
		if (announce !== '' && error !== '' && this.active === false) this.send(error);
		return 1;

	}

	getAllStreamData() {
		return new Promise((resolve, reject) => this.api.data.db.find({}, (err, docs) => {
			if (err) {
				reject(new Error('An error occurred ' + err));
			} else {
				resolve(docs);
			}
		}));
	}

	getCurrentStreamData() {
		return new Promise((resolve, reject) => this.api.getLivestreamPage(this.api.displayname).then(ls => {
			if (ls.livestream) {
				this.api.data.db.findOne({
					stream: ls.livestream.id
				}, (err, doc) => {
					if (err) {
						reject(new Error('An error occurred: ' + err));
					} else if (doc === null) {
						this.api.data.id = ls.livestream.id;
						this.api.data.db.insert({
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
						}, (error, newDoc) => {
							if (!error) {
								resolve(newDoc);
							}
						});
					} else {
						resolve(doc);
					}
				});
			} else {
				reject(new Error('Could not load current stream data'));
			}
		}));
	}

	getBotName() {
		this.api.getMeDisplayName().then(d => this.api.name = d).catch(() => {
			setTimeout(() => this.getBotName(), 1000);
		});
	}

	stop() {
		this.active = false;
		if (this.api && 'removeAllListeners' in this.api) this.api.removeAllListeners();
		delete this.api;
		this.api = {};
		this.api.name = null;
		this.api.data = {
			db: {
				update: () => ''
			}
		};
		this.channel_config = {
			...this.init_channel_config
		};
		this.debug('Stopped bot');
		return 1;
	}

	create_config() {
		// Create arrays if they don't exist to avoid undefined errors
		if (!('channel_config' in this)) {
			this.channel_config = {
				...this.init_channel_config
			};
		}
		if (!('DisplayName' in this.channel_config)) this.channel_config.DisplayName = this.DisplayName;
		if (!('active' in this.channel_config)) this.channel_config.active = false;
		if (!('cooldown' in this.channel_config)) this.channel_config.cooldown = [];
		if (!('every' in this.channel_config)) this.channel_config.every = [];
		if (!('initialize' in this.channel_config)) this.channel_config.initialize = [];
		if (!('listeners' in this.channel_config)) this.channel_config.listeners = [];
		if (!('modules' in this.channel_config)) this.channel_config.modules = [];
		if (!('on' in this.channel_config)) this.channel_config.on = [];
		if (!('responses' in this.channel_config)) this.channel_config.responses = [];

		// Import modules
		this.channel_config.modules.forEach(mod => {
			// eslint-disable-next-line global-require
			const m = require(`../modules/${mod}.js`);
			if (!('every' in m)) m.every = [];
			if (!('initialize' in m)) m.initialize = [];
			if (!('listeners' in m)) m.listeners = [];
			if (!('responses' in m)) m.responses = [];
			this.channel_config.responses = [ ...this.channel_config.responses, ...m.responses ];
			this.channel_config.listeners = [ ...this.channel_config.listeners, ...m.listeners ];
			this.channel_config.initialize = [ ...this.channel_config.initialize, ...m.initialize ];
		});
	}

	load() {
		this.api.data.db.loadDatabase();
		if ('initialize' in this.channel_config) {
			this.channel_config.initialize.forEach(init => {
				if (typeof init === 'function') {
					init(this.api).then((ret, data = null) => {
						if (data) this.api.data = data;
						if (ret) this.send(ret);
					}).catch(e => {
						throw new Error(e);
					});
				}
			});
		}

		if (this.channel_config.every.length) {
			this.channel_config.every.forEach(con => {
				setInterval(() => {
					this.getCurrentStreamData().then(() => {
						this.send(con.message, this.api);
					});
				}, con.minutes * 60000);
			});
		}

		if (this.channel_config.listeners.length) {
			this.channel_config.listeners.forEach(listener => {
				this.api.on(listener[0], res => {
					listener[1](this, res).then((ret, data = null) => {
						if (data !== null) this.api.data = data;
						if (ret !== null) this.send(ret.format(res));
					}).catch(err => {
						throw new Error(`An error occurred in listener ${this.channel_config.listeners.indexOf(listener)}. Error: ${err}`);
					});
				});
			});
		}

		if (this.channel_config.responses.length) {
			this.api.on('ChatText', res => {
				const msg = res.content;
				if (res.sender.displayname === this.api.name) return;
				for (let i = 0; i < this.channel_config.responses.length; i++) {
					const resp = this.channel_config.responses[i];
					if (resp.match.test(msg)) {
						let {
							response
						} = resp;
						if (Array.isArray(response)) {
							response = response[Math.floor(Math.random() * response.length)];
							this.send(response.format(res));
						} else if (typeof response === 'function') {
							resp.response(this, res).then((resp_res, data = null) => {
								if (data !== null) this.api.data = data;
								this.send(resp_res.format(res));
							}).catch(err => {
								throw new Error(`An error occurred in ${resp.match} function. Error: ${err}`);
							});
						} else {
							this.send(response.format(res));
						}
						break;
					}
				}
			});
		}

		this.api.on('ChatLive', () => {
			this.api.getLivestreamPage().then(ls => {
				if (typeof ls.livestream !== 'undefined') this.api.START_TIME = Date.now();
			});
		});

		this.api.on('ChatOffline', () => this.api.START_TIME = Date.now());

		if (this.channel_config.on.lemon + this.channel_config.on.ice_cream + this.channel_config.on.diamond + this.channel_config.on.ninjaghini + this.channel_config.on.ninjet !== '') {
			this.api.on('ChatGift', res => {
				if (res.sender.displayname === this.api.name) return;
				setTimeout(() => this.api.COOLDOWN = false, this.channel_config.cooldown.ChatGift * 1000);
				if (this.api.COOLDOWN === false && res.gift === 'LEMON' && this.channel_config.on.lemon !== '') this.send(this.channel_config.on.lemon.format(res));
				if (this.api.COOLDOWN === false && res.gift === 'ICE_CREAM' && this.channel_config.on.ice_cream !== '') this.send(this.channel_config.on.ice_cream.format(res));
				if (this.api.COOLDOWN === false && res.gift === 'DIAMOND' && this.channel_config.on.diamond !== '') this.send(this.channel_config.on.diamond.format(res));
				if (this.api.COOLDOWN === false && res.gift === 'NINJAGHINI' && this.channel_config.on.ninjaghini !== '') this.send(this.channel_config.on.ninjaghini.format(res));
				if (this.api.COOLDOWN === false && res.gift === 'NINJET' && this.channel_config.on.ninjet !== '') this.send(this.channel_config.on.ninjet.format(res));
				this.api.COOLDOWN = true;
			});
		}

		if (this.channel_config.on.follow !== '') {
			this.api.on('ChatFollow', res => {
				if (res.sender.displayname === this.api.name) return;
				this.send(this.channel_config.on.follow.format(res));
			});
		}

		if (this.channel_config.on.ban !== '') {
			this.api.on('ChatBan', res => {
				if (res.sender.displayname === this.api.name) return;
				this.send(this.channel_config.on.ban.format(res));
			});
		}

		if (this.channel_config.on.sub !== '') {
			this.api.on('ChatSubscription', res => {
				if (res.sender.displayname === this.api.name) return;
				this.send(this.channel_config.on.sub.format(res));
			});
		}

		if (this.channel_config.on.host !== '') {
			this.api.on('ChatHost', res => {
				if (res.sender.displayname === this.api.name) return;
				this.send(this.channel_config.on.host.format(res));
			});
		}
	}

};
