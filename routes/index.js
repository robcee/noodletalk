'use strict';

var auth = require('../lib/authenticate');
var gravatar = require('gravatar');
var noodleRedis = require('../lib/noodle-redis');
var crypto = require('crypto');

module.exports = function(client, noodle, nconf, app, io) {
  app.get('/', function (req, res) {
    res.redirect('/about/noodletalk');
  });

  app.get('/about/:channel?', function(req, res) {
    var avatar = '';
    var nickname = '';
    var channel = escape(req.params.channel.replace(/\s/, ''));

    if (!req.params.channel || !channel) {
      res.redirect('/about/noodletalk');
    }

    if (req.session.email) {
      avatar = gravatar.url(req.session.email, {}, true);
      if (!req.session.nickname[channel]) {
        req.session.nickname[channel] = auth.generateRandomNick();
      }
      nickname = req.session.nickname[channel];
    }

    noodleRedis.getUserlist(client, channel, function(err, userList) {
      io.sockets.in(channel).emit('userlist', userList);
      res.render('index', {
        title: 'Noodle Talk',
        channel: channel,
        nickname: nickname,
        avatar: avatar
      });
    });
  });

  // Change the random font
  app.get('/font', function(req, res) {
    req.session.userFont = Math.floor(Math.random() * 9);
    io.sockets.emit('font', req.session.userFont);
    res.json({
      'font': req.session.userFont
    });
  });

  // Request the current version number
  app.get('/version', function(req, res) {
    res.json({
      'version': noodle.version
    });
  });
};
