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
var sidebar = require("../helpers/sidebar"),
  ArticleModel = require("../models").Article,
  UserModel = require("../models/user"),
  Tools = require("../server/tools.js"),
  SettingsModel = require("../models/settings"),
  PropertiesReader = require("properties-reader"),
  properties = PropertiesReader("./server/properties.file"),
  lamaHeader = properties.get("main.lamaTitle"),
  lamaVersion = properties.get("main.version"),
  settingsID = properties.get("admin.settingsID"),
  lamaTwitter = properties.get("main.twitter"),
  lamaFacebook = properties.get("main.facebook"),
  async = require("async");

function isEmpty(value) {
  return (
    (typeof value == "string" && !value.trim()) ||
    typeof value == "undefined" ||
    value === null
  );
}

module.exports = {
  index: function(req, res) {
    var viewModel;
    if (req.isAuthenticated()) {
      viewModel = {
        articles: {},
        user: {},
        layout: "user",
        lama: {}
      };
    } else {
      viewModel = {
        articles: {},
        lama: {}
      };
    }

    ArticleModel.find(
      {},
      {},
      {
        sort: {
          timestamp: -1
        }
      },
      function(err, articles) {
        if (err) {
          throw err;
        }

        articles.forEach(element => {
          element.timestamp =
            element.timestamp.getMonth() +
            1 +
            "/" +
            element.timestamp.getDate() +
            "/" +
            element.timestamp.getFullYear();
        });

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

        viewModel.articles = articles;
        // viewModel.user = req.user;
        sidebar(viewModel, function(viewModel) {
          Tools.getSettings(viewModel, res, "home");
        });
      }
    ).lean();
  },

  author: function(req, res) {
    var viewModel;
    if (req.isAuthenticated()) {
      viewModel = {
        article: {},
        user: {},
        layout: "user",
        lama: {}
      };
    } else {
      viewModel = {
        article: {},
        lama: {}
      };
    }
    var name = req.params.article_id;
    ArticleModel.find(
      {
        userName: new RegExp(req.params.article_id, "i")
      },
      {},
      {
        sort: {
          timestamp: -1
        }
      },
      function(err, articles) {
        if (err) {
          throw err;
        }

        viewModel.articles = articles;
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

        var myObject = articles;
        var count = Object.keys(myObject).length;
        if (count) {
        }
        sidebar(viewModel, function(viewModel) {
          Tools.getSettings(viewModel, res, "home");
        });
      }
    ).lean();
  }
};
