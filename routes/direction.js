var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('direction', { title: 'Direction Service' });
});

module.exports = router;
