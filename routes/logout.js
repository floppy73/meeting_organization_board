'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    console.log(req.session.passport)
    req.logout();
    res.redirect('/login');
});

module.exports = router;