var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('travel', { title: 'real-time simulation' });
});

module.exports = router;
