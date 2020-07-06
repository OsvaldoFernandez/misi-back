const models = require('../models');
const Project = models.Project;
const Chromosome = models.Chromosome;
const Palette = models.Palette;
const db = models.sequelize;

beforeAll(async () => {
  await Project.sync({ force : true });
  await Palette.sync({ force : true });
});

test('Project creation', async () => {
  const count = await Project.count();
  await Project.create({ name: "My super Project" });
  expect(await Project.count()).toBe(count + 1);
});

test('Palettes creation', async () => {
  const project = await Project.create({ name: "My super Project" });

  const count = await Palette.count();
  const palettes = await Palette.bulkCreate([
    { colors: ["#AAA", "#BBB"], projectId: project.id },
    { colors: ["#CCC", "#DDD"], projectId: project.id },
    { colors: ["#EEE", "#FFF"], projectId: project.id }
  ]);

  expect(await Palette.count()).toBe(count + 3);

  const paletteProject =
    (await (Palette.findAll({ where: {id: palettes[0].id }, include: ['project']})))[0].project;
  expect(paletteProject.name).toBe(project.name);
});

afterAll(function () {
  db.close();
});
