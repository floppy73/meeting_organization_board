'use strict';
const express = require('express');
const router = express.Router();

router.get('/terms', function(req, res, next) {
    res.render('terms', {
        title: 'SyncMeet - 利用規約'
    });
});

router.get('/guideline', function(req, res, next) {
    res.render('guideline', {
        title: 'SyncMeet - ガイドライン'
    });
});

router.get('/usage', function(req, res, next) {
    res.render('usage', {
        title: 'SyncMeet - 使い方'
    });
});

module.exports = router;
