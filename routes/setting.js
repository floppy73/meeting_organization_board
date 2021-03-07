'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authenticationEnsurer = require('./authentication-ensurer');
const Tokens = require('csrf');
const tokens = new Tokens();

router.get('/', authenticationEnsurer, function(req, res, next) {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    req.session._csrf = secret;

    User.findOne({
        where: {
            userId: req.session.passport.user._json.id_str
        }
    }).then((user) =>{
        res.render('setting', {
            playerName: user.playerName,
            title: 'SyncMeet - 設定',
            csrfToken: token
        });
    })
});

router.post('/', authenticationEnsurer, function(req, res, next) {
    const secret = req.session._csrf;
    const token = req.body._csrf;

    if (tokens.verify(secret, token) === false) {
        throw new Error('Invalied Token');
    }

    User.findOne({
        where: { userId: req.session.passport.user._json.id_str }
    }).then((user) => {
        user.update({
            userId: user.userId,
            username: user.username,
            photoUrl: user.photoUrl,
            playerName: req.body.playerName
        })
    }).then(() => {
        delete req.session._csrf;
        res.redirect('/setting');
    })
});

module.exports = router;