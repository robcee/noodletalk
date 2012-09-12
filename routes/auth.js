'use strict';

var auth = require('../lib/authenticate');
var messageMaker = require('../lib/message-maker');
var noodleRedis = require('../lib/noodle-redis');

module.exports = function(client, nconf, app, io, isLoggedIn) {
  // Login
  app.post('/login', function(req, res) {
    auth.verify(req, nconf, function(err, email) {
      if (err || !email) {
        res.status(500);
        res.json({ 'error': err });

      } else {
        var channel = escape(req.params.channel);

        req.session.email = email;
        req.session.userFont = Math.floor(Math.random() * 9);
        req.session.nickname = {};
        req.session.nickname[channel] = auth.generateRandomNick();

        auth.getUserHash(req, req.session.nickname[channel], channel, true, function(errHash, userHash) {
          req.session.emailHash = userHash.emailHash;
          messageMaker.getMessage(client, channel, req, io, 'joined', function(errMsg, message) {
            if (errMsg) {
              res.status(500);
              res.json({ 'error': errMsg });

            } else {
              noodleRedis.getUserlist(client, channel, function(errUser, userList) {
                if (errUser) {
                  res.status(500);
                  res.json({ 'error': errUser });

                } else {
                  io.sockets.in(channel).emit('userlist', userList);
                  io.sockets.in(channel).emit('message', message);
                  res.json({
                    'email': req.session.email,
                    'channel': channel,
                    'font': req.session.userFont
                  });
                }
              });
            }
          });
        });
      }
    });
  });

  // Logout
  app.get('/logout', isLoggedIn, function(req, res) {
    req.session.reset();
    res.json({
      'message': 'logged out'
    });
  });
};
