/*
MIT License

Copyright (c) [2017] [Hal Knight]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var path = require('path'),
	routes = require('./routes'),
	exphbs = require('express-handlebars'),
	express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	morgan = require('morgan'),
	methodOverride = require('method-override'),
	errorHandler = require('errorhandler'),
	moment = require('moment'),
	multer = require('multer'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	flash = require('connect-flash');


module.exports = function(app) {
	app.engine('handlebars', exphbs.create({
		defaultLayout : 'main',
		layoutsDir : app.get('views') + '/layouts',
		partialsDir : [ app.get('views') + '/partials' ],
		helpers : {
			timeago : function(timestamp) {
				return moment(timestamp).startOf('minute').fromNow();
			},
			eq : function(value1, value2) {
				if (value1 == value2) {
					return true;
				} else {
					return false;
				}
			}
		}
	}).engine);

	app.set('view engine', 'handlebars');

	app.use(morgan('dev'));
	app.use(bodyParser.urlencoded({
		extended : false
	}));
	app.use(bodyParser.json());
	app.use(multer({
		dest : path.join(__dirname, 'public/upload/temp')
	}));
	app.use(methodOverride());
	app.use(cookieParser('BNuBEP5S9n7E2s5juGzTuhdCscHJ184jqTsaKinE'));

	app.use('/public/', express.static(path.join(__dirname, '../public')));

	app.use(session({
		secret : 'Fel1hgeQi6psGzM9kDpdyayWsOrCzMEVdYy9MGmK',
		saveUninitialized : true,
		resave : true
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
	app.use(function(req, res, next) {
		res.locals.success_messages = req.flash('success_messages');
		res.locals.error_messages = req.flash('error_messages');
		next();
	});

	routes.initialize(app, passport);

	if ('development' === app.get('env')) {
		app.use(errorHandler());
	}

	return app;
};