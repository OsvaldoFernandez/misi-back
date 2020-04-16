var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var _ = require('lodash');
const models = require('../models');
const Chromosome = models.Chromosome;
const Project = models.Project;

router.get('/', function(req, res, next) {
  Chromosome.findAll().then(chromosomes => {
    res.end(JSON.stringify(chromosomes, null, 4));
  });
});

// GET CHROMSOME BY TRACKING ID
router.get('/:trackingId', function(req, res, next) {
  Chromosome.findAll({ where: { trackingId: req.params.trackingId }, include: ['palette']}).then(chromosomes => {
    res.end(JSON.stringify(chromosomes[0], null, 4));
  });
});

// ASK FOR A CHROMOSOME TO BE ASSIGNED TO MY FRONTEND
router.get('/request', async function(req, res, next) {
  Chromosome.findAll().then(chromosomes => {
    res.end(JSON.stringify(chromosomes, null, 4));
  });

  const project = (await Project.findAll({where: {id: req.query.project_id }, include: ['chromosomes']}))[0];
  if (!project) {
    next(createError(404));
  };

  const result = _.minBy(project.chromosomes, 'timesRequested');
  console.log(project.chromosomes);
  await result.update({ timesRequested: result.timesRequested + 1 });
  res.send(JSON.stringify(result));
});

module.exports = router;
