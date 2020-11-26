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
var User = require("../models/user");
var Tools = require("../server/tools.js");
var sidebar = require("../helpers/sidebar");
var PropertiesReader = require("properties-reader");
var properties = PropertiesReader("./server/properties.file"),
  lamaHeader = properties.get("main.lamaTitle"),
  lamaVersion = properties.get("main.version"),
  lamaTwitter = properties.get("main.twitter"),
  lamaFacebook = properties.get("main.facebook"),
  UserModel = require("../models/user");

function isEmpty(value) {
  return (
    (typeof value == "string" && !value.trim()) ||
    typeof value == "undefined" ||
    value === null
  );
}

module.exports = {
  index: function(req, res) {
    var viewModel = { user: {}, lama: {} };
    if (req.isAuthenticated() && req.user.local.admin) {
      viewModel = {
        user: {},
        users: {},
        stats: {
          stat: true
        },
        layout: "user",
        lama: {}
      };

      User.find({}, function(err, users) {
        if (err) {
          throw err;
        }
        if (req.user.local.admin) {
          viewModel.users = users;
          if (!isEmpty(req.user)) {
            var objUser = JSON.parse(JSON.stringify(req.user));
            UserModel.findOne(
              {
                "local.email": objUser.local.email
              },
              function(err, user) {
                if (err) {
                  throw err;
                }
                viewModel.user = user;
              }
            ).lean();
          }
          Tools.getSettings(viewModel, res, "admin");
        } else {
          Tools.getSettings(viewModel, res, "home");
        }
      }).lean();
    } else {
      res.redirect("/login");
    }
  }
};
