var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const models = require('../models');
const Project = models.Project;

router.get('/', function(req, res, next) {
  Project.sync().then(() => {
    Project.findAll({include: ['palettes', 'chromosomes']}).then(projects => {
      res.end(JSON.stringify(projects, null, 4));
    });
  });
});

module.exports = router;
