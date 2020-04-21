var express = require('express');
var router = express.Router();
const models = require('../models');
const Palette = models.Palette;

router.get('/', function(req, res, next) {
  Palette.findAll().then(palettes => {
    res.end(JSON.stringify(palettes, null, 4));
  });
});

module.exports = router;
