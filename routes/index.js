var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  let title = 'MISI BACKEND';
  res.render('index', { title: title });
});

module.exports = router;
