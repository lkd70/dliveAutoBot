'use strict';

const express = require('express');
const logger = require('morgan');

const defaultRoute = express.Router();
const apiRouter = require('./routes/api');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/v1', apiRouter);
app.use('/*', defaultRoute.get('/*', (req, res) => res.redirect('/v1' + req.originalUrl)));

module.exports = app;


