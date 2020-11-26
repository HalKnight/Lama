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
var fs = require("fs"),
  path = require("path"),
  sidebar = require("../helpers/sidebar"),
  Models = require("../models"),
  UserModel = require("../models/user"),
  md5 = require("MD5");
var Tools = require("../server/tools.js");
var PropertiesReader = require("properties-reader");
var properties = PropertiesReader("./server/properties.file"),
  lamaHeader = properties.get("main.lamaTitle"),
  lamaVersion = properties.get("main.version"),
  lamaTwitter = properties.get("main.twitter"),
  lamaFacebook = properties.get("main.facebook");
var list = require("badwords-list"),
  arrayFilter = list.array;
var Filter = require("bad-words"),
  filter = new Filter();
filter.addWords(...arrayFilter);
var scripts = [
  {
    script: "/public/js/editScripts.js"
  }
];

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
        article: {},
        user: {},
        comments: [],
        layout: "user",
        scripts: scripts,
        lama: {}
      };
    } else {
      viewModel = {
        article: {},
        comments: [],
        lama: {}
      };
    }

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

    Models.Article.findOne(
      {
        articleID: {
          $regex: req.params.article_id
        }
      },
      function(err, article) {
        if (err) {
          throw err;
        }
        if (article) {
          article.views = article.views + 1;
          viewModel.article = article;
          var hydratedArticle = Models.Article.hydrate(article);
          hydratedArticle.markModified("views");
          hydratedArticle.save(function(err, article) {
            if (err) {
              throw err;
            }
          });

          viewModel.article.timestamp = article.timestamp =
            article.timestamp.getMonth() +
            1 +
            "/" +
            article.timestamp.getDate() +
            "/" +
            article.timestamp.getFullYear();

          Models.Comment.find(
            {
              article_id: article.articleID
            },
            {},
            {
              sort: {
                timestamp: 1
              }
            },
            function(err, comments) {
              viewModel.comments = comments;
              //viewModel.user = JSON.stringify(req.user);
              sidebar(viewModel, function(viewModel) {
                if (
                  (req.isAuthenticated() &&
                    article.userID == req.user.local.email) ||
                  (req.isAuthenticated() && req.user.local.admin)
                ) {
                  Tools.getSettings(viewModel, res, "article");
                } else {
                  Tools.getSettings(viewModel, res, "articlepublic");
                }
              });
            }
          ).lean();
        } else {
          res.redirect("/");
        }
      }
    ).lean();
  },
  create: function(req, res) {
    var savePost = function() {
      var possible = "abcdefghijklmnopqrstuvwxyz0123456789",
        postUrl = "";

      for (var i = 0; i < 6; i += 1) {
        postUrl += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      Models.Article.findOneAndUpdate(
        {
          articleID: req.body.editBlogID
        },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            blogbody: req.body.blogbody
          }
        },
        function(err, exArticle) {
          if (err) {
            throw err;
          }
          if (exArticle) {
            res.redirect("/articles/" + exArticle.articleID);
          } else {
            Models.Article.find(
              {
                articleID: postUrl
              },
              function(err, articles) {
                if (articles.length > 0) {
                  savePost();
                } else {
                  if (req.body.blogbody == undefined) {
                    if (err) throw err;
                    res.redirect("/home");
                  } else {
                    if (err) {
                      throw err;
                    }

                    var newPost = new Models.Article({
                      title: req.body.title,
                      articleID: postUrl,
                      description: req.body.description,
                      blogbody: req.body.blogbody,
                      userID: req.user.local.email,
                      userName: req.user.local.name
                    });
                    newPost.save(function(err, article) {
                      res.redirect("/articles/" + article.articleID);
                    });
                  }
                }
              }
            );
          }
        }
      );
    };

    savePost();
  },
  like: function(req, res) {
    Models.Article.findOne(
      {
        articleID: {
          $regex: req.params.article_id
        }
      },
      function(err, article) {
        if (!err && article) {
          article.likes = article.likes + 1;
          article.save(function(err) {
            if (err) {
              res.json(err);
            } else {
              res.json({
                likes: article.likes
              });
            }
          });
        }
      }
    );
  },
  comment: function(req, res) {
    Models.Article.findOne(
      {
        articleID: {
          $regex: req.params.article_id
        }
      },
      function(err, article) {
        if (!err && article) {
          function isEmpty(value) {
            return (
              (typeof value == "string" && !value.trim()) ||
              typeof value == "undefined" ||
              value === null
            );
          }
          var newComment = new Models.Comment(req.body);
          if (!isEmpty(req.body.name)) {
            newComment.name = filter.clean(req.body.name);
          }

          if (!isEmpty(req.body.email)) {
            newComment.email = filter.clean(req.body.email);
          }
          if (!isEmpty(req.body.comment)) {
            newComment.comment = filter.clean(req.body.comment);
          }
          newComment.gravatar = md5(newComment.email);
          newComment.article_id = article.articleID;
          newComment.save(function(err, comment) {
            if (err) {
              throw err;
            }

            res.redirect(
              "/articles/" + article.articleID + "#" + comment.article_id
            );
          });
        } else {
          res.redirect("/");
        }
      }
    );
  },
  remove: function(req, res) {
    Models.Article.findOne(
      {
        articleID: {
          $regex: req.params.article_id
        }
      },
      function(err, article) {
        if (err) {
          throw err;
        }

        if (article) {
          Models.Comment.remove(
            {
              article_id: article._id
            },
            function(err) {
              article.remove(function(err) {
                if (!err) {
                  res.json(true);
                } else {
                  res.json(false);
                }
              });
            }
          );
        } else {
          res.redirect("back");
        }
      }
    );
  },

  removeComment: function(req, res) {
    Models.Comment.findOne(
      {
        timestamp: {
          $gte: req.params.article_id
        }
      },
      function(err, comment) {
        if (err) {
          throw err;
        }

        if (comment) {
          Models.Comment.remove(
            {
              timestamp: comment._id
            },
            function(err) {
              comment.remove(function(err) {
                if (!err) {
                  res.json(true);
                } else {
                  res.json(false);
                }
              });
            }
          );
        } else {
          res.redirect("back");
        }
      }
    );
  }
};
