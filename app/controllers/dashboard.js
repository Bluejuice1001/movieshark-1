/*jslint node: true */

'use strict';

var async = require('async');
var request = require('request');
var provider = require('../services/provider');

exports.index = function (req, res, next) {
  var current = req.params.page || 1;
  async.parallel({
    movies: function (cb) {
      var uri = provider.movie('list_movies.json');
      request
        .get({
            uri: uri,
            qs: {
                q: current
            }
        }, function (err, response, body) {
            if (err)
                return cb(err);

            var data = body ? JSON.parse(body).data.movies : [];

            return cb(null, data);
        });
    },
    series: function (cb) {
      var uri = provider.serie('shows/' + current);
      request
        .get({
            uri: uri
        }, function (err, response, body) {
            if (err)
                return cb(err);

            var data = body ? JSON.parse(body) : [];

            return cb(null, data);
        });
    },
    pagination: function (cb) {
      request
        .get({
            uri: provider.serie('shows')
        }, function (err, response, body) {
            if (err)
                return cb(err);

            return cb(null, JSON.parse(body));
        });
    }
  }, function (err, results) {
    if (err)
        return next(err);

    return res.render('dashboard/index', {
        movies: results.movies,
        series: results.series,
        pagination: results.pagination,
        current: current
    });
  });
};