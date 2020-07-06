var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var _ = require('lodash');
const models = require('../models');
const Chromosome = models.Chromosome;
const Project = models.Project;
const analytics = require('../interactors/analytics');

router.get('/', function(req, res, next) {
  Chromosome.findAll().then(chromosomes => {
    res.end(JSON.stringify(chromosomes, null, 4));
  });
});

// ASK FOR A CHROMOSOME TO BE ASSIGNED TO MY FRONTEND
router.get('/request', async function(req, res, next) {
  const project = (await Project.findAll({where: {id: req.query.project_id }}))[0];
  if (!project) {
    next(createError(404));
  };
  const chromosomes = await Chromosome.findAll({where: {projectId: project.id }, include: ['palette']});

  const result = _.minBy(chromosomes, 'timesRequested');
  await result.update({ timesRequested: result.timesRequested + 1 });
  res.send(JSON.stringify(result));
});

// GET CHROMSOME BY ID
router.get('/:id', function(req, res, next) {
  Chromosome.findAll({ where: { id: req.params.id }, include: ['palette']}).then(chromosomes => {
    res.end(JSON.stringify(chromosomes[0], null, 4));
  });
});

// GET RESULTS

router.post('/:id/results', function(req, res, next) {
  Chromosome.findAll({ where: { id: req.params.id }}).then(chromosomes => {
    const chromosome = chromosomes[0];
    analytics.getResults(chromosome).then((resp) => {
      res.end(JSON.stringify(resp, null, 4));
    });
  });
});

module.exports = router;
