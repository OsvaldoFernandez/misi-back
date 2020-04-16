var express = require('express');
var router = express.Router();
const models = require('../models');
const Project = models.Project;
const Palette = models.Palette;

router.post('/bulk_create', async function(req, res, next) {

  await Project.sync();
  if ((await Project.count()) === 0 ) {
    await Project.create({name: 'exampleProject'});
  }
  const project = (await Project.findAll())[0];

  Palette.sync().then(async () => {
    JSON.parse(req.body.palettes).forEach(async (palette) => {
      await Palette.create({ projectId: project.id, baseColor: palette.baseColor, colors: palette.colors });
    });

    const palettes = await Palette.findAll({where: {projectId: project.id }});
    res.send(JSON.stringify({count: palettes.length }));
  });
});

module.exports = router;
