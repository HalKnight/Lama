
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

var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var User = require('../models/user');
var Article = require('../models/article');
var isAdmin = false;

module.exports = function(passport) {

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================

	passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
		function(req, email, password, done, name) {

			process.nextTick(function() {

				User.findOne({
					'local.admin' : true
				}, function(err, user) {
					if (err)
						return done(err);

					if (user) {
						isAdmin = false;
					} else {
						isAdmin = true;
					}
				});

				User.findOne({
					'local.email' : email
				}, function(err, user) {
					if (err)
						return done(err);

					if (user) {
						return done(null, false, {
							message : 'That email is already taken.'
						});
					} else {

						var newUser = new User();

						newUser.local.email = email;
						newUser.local.password = newUser.generateHash(password);
						newUser.local.name = req.param('name');
						newUser.local.admin = isAdmin;

						try {
							newUser.save(function(err) {
								if (err) {

									throw err;
								} else {
									return done(null, newUser);
								}
							});
						} catch (err) {}
					}

				});

			});

		}));

		// =========================================================================
		// LOCAL EDIT ============================================================
		// =========================================================================

	passport.use('local-edit', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
		function(req, email, password, done, name) {
			var cont = true;

			process.nextTick(function() {

				User.findOne({
					'local.email' : email
				}, function(err, user) {
					if (err)
						return done(err);

					if (user) {
						if (user.local.email != req.user.local.email) {
							cont = false;
							return done(null, false, {
								message : 'That email is already taken.'
							});
						} else {

							Article.find({
							}, function(err, article) {
								if (err)
									return done(err);

								article.forEach(function(u) {
									if (u.userID == req.user.local.email) {
										Article.findOne({
											'articleID' : u.articleID
										}, function(err, curArticle) {
											if (err)
												return done(err);
											curArticle.userID = email;
											curArticle.userName = req.param('name');
											try {
												curArticle.save(function(err) {
													if (err) {

														throw err;
													} else {
														return done(null, curArticle);
													}
												});
											} catch (err) {}

										});
									}
								});
							});

							user.local.email = email;
							user.local.password = user.generateHash(password);
							user.local.name = req.param('name');
							try {
								user.save(function(err) {
									if (err) {

										throw err;
									} else {
										return done(null, user);
									}
								});
							} catch (err) {}
						}

					} else {
						Article.find({
						}, function(err, article) {
							if (err)
								return done(err);

							article.forEach(function(u) {
								if (u.userID == req.user.local.email) {
									Article.findOne({
										'articleID' : u.articleID
									}, function(err, curArticle) {
										if (err)
											return done(err);
										curArticle.userID = email;
										curArticle.userName = req.param('name');
										try {
											curArticle.save(function(err) {
												if (err) {

													throw err;
												} else {
													return done(null, curArticle);
												}
											});
										} catch (err) {}

									});
								}
							});
						});

						User.findOne({
							'local.email' : req.user.local.email
						}, function(err, user) {
							if (err)
								return done(err);
							if (user) {
								user.local.email = email;
								user.local.password = user.generateHash(password);
								user.local.name = req.param('name');
								try {
									user.save(function(err) {
										if (err) {

											throw err;
										} else {
											return done(null, user);
										}
									});
								} catch (err) {}
							}
						});
					}

				});

			});

		}));

		// =========================================================================
		// LOCAL EDIT_ADMIN ============================================================
		// =========================================================================

	passport.use('local-edit-admin', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
		function(req, email, password, done, name, admin) {
			var cont = true;
			process.nextTick(function() {
				var admin = new User();
				User.findOne({
					'local.email' : req.user.local.email
				}, function(err, userAdmin) {
					if (err)
						return done(err, admin);
					if (userAdmin) {
						admin = userAdmin;
					}
				});

				User.findOne({
					'local.email' : email
				}, function(err, user) {
					if (err)
						return done(err, admin);

					if (user) {
						if (user.local.email != req.cookies.cookie_userEmail) {
							cont = false;
							return done(null, false, {
								message : 'That email is already taken.'
							});
						} else {

							Article.find({
							}, function(err, article) {
								if (err)
									return done(err, admin);

								article.forEach(function(u) {
									if (u.userID == req.cookies.cookie_userEmail) {
										Article.findOne({
											'articleID' : u.articleID
										}, function(err, curArticle) {
											if (err)
												return done(err, admin);
											curArticle.userID = email;
											curArticle.userName = req.param('name');
											try {
												curArticle.save(function(err) {
													if (err) {

														throw err;
													} else {
														return done(null, curArticle);
													}
												});
											} catch (err) {}

										});
									}
								});
							});

							user.local.email = email;
							user.local.password = user.generateHash(password);
							user.local.name = req.param('name');
							user.local.admin = req.param('admin');
							try {
								user.save(function(err) {
									if (err) {

										throw err;
									} else {
										return done(null, admin);
									}
								});
							} catch (err) {}
						}

					} else {
						Article.find({
						}, function(err, article) {
							if (err)
								return done(err, admin);

							article.forEach(function(u) {
								if (u.userID == req.cookies.cookie_userEmail) {
									Article.findOne({
										'articleID' : u.articleID
									}, function(err, curArticle) {
										if (err)
											return done(err, admin);
										curArticle.userID = email;
										curArticle.userName = req.param('name');
										try {
											curArticle.save(function(err) {
												if (err) {

													throw err;
												} else {
													return done(null, curArticle);
												}
											});
										} catch (err) {}

									});
								}
							});
						});

						User.findOne({
							'local.email' : req.cookies.cookie_userEmail
						}, function(err, user) {
							if (err)
								return done(err, admin);

							if (user) {
								user.local.email = email;
								user.local.password = user.generateHash(password);
								user.local.name = req.param('name');
								user.local.admin = req.param('admin');
								try {
									user.save(function(err) {
										if (err) {

											throw err;
										} else {
											return done(null, admin);
										}
									});
								} catch (err) {}
							}
						});
					}

				});

			});

		}));

		// =========================================================================
		// LOCAL LOGIN =============================================================
		// =========================================================================

	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true
	},
		function(req, email, password, done) { 

			User.findOne({
				'local.email' : email
			}, function(err, user) {
				if (err)
					return done(err);

				if (!user) {
					return done(null, false, {
						message : 'No user found.'
					});
				}
				if (!user.validPassword(password))
					return done(null, false, {
						message : 'Oops! Wrong password.'
					});
				return done(null, user);
			});

		}));

};