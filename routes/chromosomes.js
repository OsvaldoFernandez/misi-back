var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const randomizer = require('../interactors/randomizer');
const models = require('../models');
const Chromosome = models.Chromosome;
const Project = models.Project;

const randomPalette = (project) => {
  return project.palettes[Math.floor(Math.random() * project.palettes.length)]; //choosing random palette
};


router.get('/', function(req, res, next) {
  Chromosome.findAll().then(chromosomes => {
    res.end(JSON.stringify(chromosomes, null, 4));
  });
});

router.post('/', function(req, res, next) {
  Chromosome.sync().then(() => {
    Chromosome.create({ tracking_id: req.query.tracking_id, elements: req.query.elements }).then(chromo => {
      res.end(JSON.stringify(chromo, null, 4));
    });
  });
});

router.post('/bulk_create', async function(req, res, next) {
  await Project.sync();
  const project = (await Project.findAll({where: {id: req.query.project_id }, include: ['palettes']}))[0];
  if (!project) {
    next(createError(404));
  }

  Chromosome.sync().then(async () => {
    const newChro = await Chromosome.create({ projectId: project.id, elements: randomizer(project) });
    await randomPalette(project).setChromosome(newChro);

    const chromosomes = await Chromosome.findAll({where: {projectId: project.id }});
    res.send(JSON.stringify({count: chromosomes.length }));
  });
});

module.exports = router;
