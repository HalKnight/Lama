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
var sidebar = require('../helpers/sidebar'),
	ArticleModel = require('../models').Article;
var Tools = require('../server/tools.js');
var scripts = [ {
	script : '/public/js/editScripts.js'
} ];
var PropertiesReader = require('properties-reader');
var properties = new PropertiesReader('./server/properties.file'),
	lamaHeader = properties.get('main.lamaTitle'),
	lamaVersion = properties.get('main.version'),
	lamaTwitter = properties.get('main.twitter'),
	lamaFacebook = properties.get('main.facebook');

module.exports = {
	index : function(req, res) {
		var viewModel;
		if (req.isAuthenticated()) {
			viewModel = {
				article : {},
				user : {},
				stats : {
					stat : true
				},
				layout : 'user',
				scripts : scripts,
				lama : {}
			};
		} else {
			viewModel = {
				article : {},
				lama : {}
			};
		}

		ArticleModel.find({}, {}, {
			sort : {
				timestamp : -1
			}
		}, function(err, articles) {
			if (err) {
				throw err;
			}

			viewModel.articles = articles;
			viewModel.user = req.user;
			sidebar(viewModel, function(viewModel) {
				if (req.isAuthenticated()) {
					Tools.getSettings(viewModel, res, 'newArticle');
				} else {
					res.redirect('/');
				}
			});
		});

	},

	edit : function(req, res) {
		var viewModel;
		if (req.isAuthenticated()) {
			viewModel = {
				article : {},
				user : {},
				stats : {
					stat : true
				},
				layout : 'user',
				scripts : scripts,
				lama:{}
			};
		} else {
			viewModel = {
				article : {},
				lama:{}
			};
		}

		ArticleModel.findOne({
			articleID : {
				$regex : req.params.article_id
			}
		}, function(err, article) {
			if (err) {
				throw err;
			}

			if (req.user.local.email === article.userID || req.user.local.admin) {
				viewModel.article = article;
				viewModel.user = req.user;
				sidebar(viewModel, function(viewModel) {
					if (req.isAuthenticated()) {
						Tools.getSettings(viewModel, res, 'newArticle');
					} else {
						res.redirect('/');
					}
				});
			} else {
				res.redirect('/login');
			}
		});

	}
};