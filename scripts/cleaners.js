// located in 'routes' folder
// PATH=$PATH:`ls -td /opt/elasticbeanstalk/node-install/node-* | head -1`/bin
// NODE_ENV=env node

const models = require('../src/models');
const Chromosome = models.Chromosome;
const Palette = models.Palette;

Chromosome.sync({force: true}).then((resp) => {
  Palette.findAll().then((palettes) => {
    palettes.forEach((palette) => {
      palette.chromosomeId = null;
      palette.save();
    })
  })
});
