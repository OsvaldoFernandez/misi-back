var express = require('express');
var router = express.Router();
var createError = require('http-errors');
const models = require('../models');
const Project = models.Project;
const Palette = models.Palette;
const Chromosome = models.Chromosome;
const analytics = require('../interactors/analytics');
const palettesParser = require('../interactors/palettesParser');
const randomizer = require('../interactors/randomizer');

router.get('/:id', function(req, res, next) {
  Project.sync().then(() => {
    Project.findAll({where: { id: req.params.id }}).then(projects => {
      res.end(JSON.stringify(projects[0], null, 4));
    });
  });
});

router.get('/', function(req, res, next) {
  Project.sync().then(() => {
    Project.findAll({include: ['palettes', 'chromosomes']}).then(projects => {
      res.end(JSON.stringify(projects, null, 4));
    });
  });
});

// CREATE PROJECT
router.post('/', async function(req, res, next) {
  Project.sync().then(async () => {
    const newProj = await Project.create({ name: req.body.name, elements: req.body.elements });
    res.end(JSON.stringify(newProj, null, 4));
  });
});

// LINK PROJECT WITH THE TRACKING IDs
router.post('/:id/tracking_ids', async function(req, res, next) {
  const trackingIds = await analytics.trackingIds();
  Project.sync().then(async () => {
    const project = (await Project.findAll({where: { id: req.params.id }}))[0];
    project.trackingIds = trackingIds;
    await project.save();
    res.end(JSON.stringify(project, null, 4));
  });
});

// LINK PROJECT WITH PALETTESs
router.post('/:id/baseColors', async function(req, res, next) {
  const baseColors = req.body.baseColors;
  Project.sync().then(async () => {
    const project = (await Project.findAll({where: { id: req.params.id }}))[0];
    project.baseColors = baseColors;
    await project.save();

    palettesParser.getFilteredPalettes(project.baseColors).then((palettes) => {
      palettes.forEach(async (palette) => {
        await Palette.create({ projectId: project.id, baseColor: palette.baseColor, colors: palette.colors });
      });
      res.end(JSON.stringify(project, null, 4));
    });
  });
});

// INITIAL GENERATION
router.post('/:id/init', async function(req, res, next) {
  const project = (await Project.findAll({where: { id: req.params.id }, include: ['palettes', 'chromosomes']}))[0];

  // CREATE BASE CHROMOSOME AND PALETTE
  //const baseChromosome = await (Chromosome.create({trackingId: project.trackingIds[0], elements: project.elements, projectId: project.id }));
  //await Palette.create({baseColor: project.baseColors[0], colors: project.baseColors, projectId: project.id, chromosomeId: baseChromosome.id });

  // CREATE THE REST OF THE FIRST GENERATION
  await project.freeTrackingIds().forEach(async (trackingId) => {
    const availablePalettes = project.palettes.filter((palette) => (palette.offlineAptitude(project) > 0 && !palette.chromosomeId));
    const randomPalette = availablePalettes[Math.floor(Math.random() * availablePalettes.length)];

    const chromosome = await Chromosome.create({ projectId: project.id, elements: randomizer(project), trackingId: trackingId });
    randomPalette.chromosomeId = chromosome.id;
    await randomPalette.save();
  });

  res.end(JSON.stringify(project, null, 4));
});


module.exports = router;
