var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const randomizer = require('../interactors/randomizer');
const models = require('../models');
const Chromosome = models.Chromosome;
const Project = models.Project;

const createPalette = async (project) => {

  //const palettes = await Palette.findAll({where: {projectId: project.id }});
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
  console.log('INICIA');
  await Project.sync();
  const project = (await Project.findAll({where: {id: req.query.project_id }, include: ['palettes']}))[0];
  console.log('PROJECT');
  console.log(project);
  if (!project) {
    next(createError(404));
  }

  Chromosome.sync().then(async () => {
    await Chromosome.create({ projectId: project.id, palette: createPalette(project), elements: randomizer(project) });

    const chromosomes = await Chromosome.findAll({where: {projectId: project.id }});
    res.send(JSON.stringify({count: chromosomes.length }));
  });
});

module.exports = router;
