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
var home = require("../controllers/home"),
  article = require("../controllers/article"),
  newArticle = require("../controllers/newArticle"),
  admin = require("../controllers/admin"),
  editProfile = require("../controllers/editProfile"),
  settings = require("../controllers/settings"),
  passport = require("passport"),
  fs = require("fs"),
  path = require("path"),
  User = require("../models/user"),
  Settings = require("../models/settings"),
  md5 = require("MD5"),
  flash = require("connect-flash");
var Tools = require("../server/tools.js");
var storage = require("node-persist");
var PropertiesReader = require("properties-reader");
var properties = PropertiesReader("./server/properties.file"),
  settingsID = properties.get("admin.settingsID"),
  lamaHeader = properties.get("main.lamaTitle"),
  lamaVersion = properties.get("main.version"),
  lamaTwitter = properties.get("main.twitter"),
  lamaFacebook = properties.get("main.facebook");

module.exports.initialize = function(app, passport) {
  storage.initSync();

  app.get("/", function(req, res) {
    res.redirect("/home");
  });
  app.get("/home", home.index);
  app.get("/admin", isLoggedIn, admin.index);
  app.get("/settings", isLoggedIn, isAdmin, settings.index);
  app.get("/newArticle", isLoggedIn, newArticle.index);
  app.get("/newArticle/:article_id", isLoggedIn, newArticle.edit);
  app.get("/articles/:article_id", article.index);
  app.post("/articles", isLoggedIn, article.create);
  app.post("/articles/:article_id/like", article.like);
  app.post("/articles/:article_id/comment", article.comment);
  app.delete("/articles/:article_id", isLoggedIn, article.remove);
  app.get("/login", function(req, res) {
    var viewModel;
    viewModel = {
      layout: "auth",
      message: req.flash("error"),
      noSignup: false,
      lama: {}
    };
    Settings.findOne(
      {
        settings_id: settingsID
      },
      function(err, settings) {
        if (err) {
          throw err;
        }
        if (settings) {
          if (!settings.newUsers) {
            viewModel.noSignup = true;
          }
        }
        Tools.getSettings(viewModel, res, "login");
      }
    );
  });
  app.get("/signup", isSignup, function(req, res) {
    var viewModel;
    viewModel = {
      message: req.flash("error"),
      layout: "auth",
      lama: {}
    };
    Tools.getSettings(viewModel, res, "signup");
  });
  app.get("/editProfile", isLoggedIn, function(req, res) {
    var viewModel;
    viewModel = {
      user: req.user,
      layout: "user",
      stats: {
        stat: true
      },
      message: req.flash("error"),
      lama: {}
    };
    Tools.getSettings(viewModel, res, "editProfile");
  });
  app.get("/profile", isLoggedIn, function(req, res) {
    var viewModel;
    viewModel = {
      user: req.user,
      layout: "user",
      stats: {
        stat: true
      },
      lama: {}
    };
    Tools.getSettings(viewModel, res, "profile");
  });
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.get("/editProfileAdmin/:user_id", isLoggedIn, function(req, res) {
    var viewModel;
    res.clearCookie("cookie_userEmail");
    res.cookie("cookie_userEmail", req.params.user_id);
    storage.setItemSync(
      "edituser",
      "/editProfileAdmin/" + req.cookies.cookie_userEmail
    );
    if (req.isAuthenticated() && req.user.local.admin) {
      viewModel = {
        user: {},
        userAdmin: {},
        message: req.flash("error"),
        stats: {
          stat: true
        },
        admin: {
          edit: true
        },
        layout: "user",
        lama: {}
      };
      User.findOne(
        {
          "local.email": {
            $regex: req.params.user_id
          }
        },
        function(err, user) {
          if (err) {
            throw err;
          }
          if (user) {
            viewModel.user = req.user;
            viewModel.userAdmin = user;
            Tools.getSettings(viewModel, res, "editProfileAdmin");
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  });

  app.post("/settings", isLoggedIn, isAdmin, settings.edit);

  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/home",
      failureRedirect: "/signup",
      badRequestMessage: "Missing username or password.",
      failureFlash: true
    })
  );

  app.post(
    "/editProfile",
    passport.authenticate("local-edit", {
      successRedirect: "/profile",
      failureRedirect: "/editProfile",
      badRequestMessage: "Missing username or password.",
      failureFlash: true
    })
  );

  app.post(
    "/editProfileAdmin",
    passport.authenticate("local-edit-admin", {
      successRedirect: "/admin",
      failureRedirect: storage.getItemSync("edituser"),
      badRequestMessage: "Missing username or password.",
      failureFlash: true
    })
  );

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/home",
      failureRedirect: "/login",
      badRequestMessage: "Missing username or password.",
      failureFlash: true
    })
  );

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();

    res.redirect("/login");
  }

  function isAdmin(req, res, next) {
    if (req.user.local.admin) return next();

    res.redirect("/login");
  }

  function isSignup(req, res, next) {
    Settings.findOne(
      {
        settings_id: settingsID
      },
      function(err, settings) {
        if (err) {
          throw err;
        }
        if (settings) {
          if (settings.newUsers) {
            return next();
          } else {
            res.redirect("/login");
          }
        } else {
          return next();
        }
      }
    );
  }
};
