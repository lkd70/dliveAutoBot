DLive dliveAutoBot
==================

![License](https://img.shields.io/github/license/LKD70/dliveAutoBot)

<p align="center">
	<img width="300" height="300" src="https://raw.githubusercontent.com/lkd70/dlive-images/master/dlive_discord_ninja_api_300_300.png">
</p>

What is this
-------------

This is a small bot based on the [Dlivetv-api](https://github.com/lkd70/dlivetv-api)

This bot features a JSON configuration structure.
The bot has the ability to store data in JSON files using nedb.
As well as this, the bot features a simple RESTful API to both check and control the instances of bots.

Installation
------------

Installation is as simple as cloning the repo and running `npm i`

configuration
-------------

Some configuration is mandatory. All of this is contained in `config.js`.
In order to setup this config file, clone the example and edit it:
1. `> cp config.example.js config.js`
2. `> micro config.js`
(change `micro` to your preferred editor)

channel configuration
---------------------

Channel configurations are required in order to add a new bot instance.
All channel configurations are stored in `./channels`.
Although they're all automatically loaded,
they're not active by default unless the ${channel}.active property is set to `true`.

To create a new channel configuration, like with the main config file,
you simply clone the example file: `./channel_example.js` and edit it to your needs:

> **NOTE**: The channel file name MUST match the displayname of your channel!

1. `> cp ./channel/channel_example.js ./channel/Your_Channels_Dlive_DisplayName.js`
2. `micro ./channel/Your_Channels_Dlive_DisplayName.js`
(change `micro` to your preferred editor)

API basic usage
---------------

The bot API supplies a couple of endpoints at the moment in order to
both monitor and control the functionality of bots. All API calls are prefixed by the `v1`
path for now. Going to `/` will redirect you to the most recent api version (Currently `v1`)

### route: `/v1`

Returns basic information about the API.
Example response:

```json
{
  "api": {
    "version": 1
  }
}
```

### route: `/v1/bots`

Returns a summary of all channels.
Example response:

```json
{
  "api": {
    "version": 1
  },
  "bots": [
    {
      "name": "channel_example",
      "active": false
    },
    {
      "name": "LostInTheWastes",
      "active": true
    }
  ]
}
```

### route: `/v1/bot/:name`

Returns a summary of the channel given as `:name`.
Example URL: `/v1/bot/LostInTheWastes`.
Example response:

```json
{
  "api": {
    "version": 1
  },
  "bots": [
    {
      "name": "LostInTheWastes",
      "active": true
    }
  ]
}
```

### route: `/v1/start/:name`

Starts the bot given in :name and returns the result.
Example URL: `/v1/start/LostInTheWastes`.
Example response:

```json
{
  "api": {
    "version": 1
  },
  "success": 1
}
```

### route: `/v1/stop/:name`
Stops the bot given in :name and returns the result.
Example URL: `/v1/stop/LostInTheWastes`.
Example response:

```json
{
  "api": {
    "version": 1
  },
  "success": 1
}
```
