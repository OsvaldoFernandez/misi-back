const models = require('../src/models');
const palettesParser = require('../src/interactors/palettesParser');
const Chromosome = models.Chromosome;
const Palette = models.Palette;
const Project = models.Project;
const _ = require('lodash');


const print = (method) => {
  method.then((resp) => {console.log(resp)});
};

const editChromoSections = (chromoID, sections) => {
  return getChromo(chromoID).then((chromo) => {
    chromo.elements = sections;
    chromo.save().then((resp) => { console.log(resp.elements)});
  })
};

const editChromoResults = (chromoID, results) => {
  return getChromo(chromoID).then((chromo) => {
    chromo.results = results;
    chromo.save().then((resp) => { console.log(resp) });
  })
};

const destroyPalettes = () => {
  return Palette.sync({force: true});
};

const getPalette = (id) => {
  return Palette.findAll({where: {id: id }}).then((palettes) => {
    console.log(palettes[0]);
    return palettes[0];
  });
};

const getPaletteByChromo = (chromoID) => {
  return Palette.findAll({where: {chromosomeId: chromoID }}).then((palettes) => {
    console.log(palettes[0]);
    return palettes[0];
  });
};

const getPaletteDistance = (id) => {
  return getPalette(id).then((palette) => {
    return palette.distance().then((distance) => { console.log(distance)});
  })
};

const getPaletteOfflineApt = (id) => {
  return getPalette(id).then((palette) => {
    return palette.offlineAptitude().then((points) => { console.log(points)});
  });
};

const addPalette = (colors) => {
  return Project.findAll().then((projs) => {
    return Palette.create({
      projectId: projs[0].id, colors: colors,
      baseColor: colors.filter((elem) => projs[0].baseColors.map(x => x.toUpperCase()).includes(elem.toUpperCase()))[0]
    })
  })
};

const addChromoToPalette = (id, chromoId) => {
  return getPalette(id).then((palette) => {
    palette.chromosomeId = chromoId;
    return palette.save();
  });
};

const getRouletteScores = (id) => {
  return Project.findAll({where: { id: id }}).then((projects) => {
    const project = projects[0];
    const currentGen = project.currentGeneration();
    return Chromosome.findAll({where: { projectId: project.id, generation: currentGen}}).then((chromos) => {
      return Promise.all(
        chromos.map((chromo) => chromo.onlineAptitude().then(
          (score) => { return { id: chromo.id, score: score } }
        )
      )).then((scores) => {
        const total = scores.reduce((acc, value) => acc + parseFloat(value.score), 0);
        const roulette = scores.map((value) => { return { id: value.id, score: value.score, perc: value.score / total, copies: 0 }});
        for (let i = 0; i < roulette.length; i++) {
          roulette[i].acc = (i > 0) ? roulette[i].perc + roulette[i-1].acc : roulette[i].perc;
        };
        for (let i = 0; i < roulette.length; i++) {
          const random = Math.random();
          roulette.filter((elem) => (random <= elem.acc) && (random > elem.acc - elem.perc))[0].copies++;
        };
        console.log(roulette);
        return roulette;
      });
    });
  });
};

const getRankingScores = (id) => {
  return Project.findAll({where: { id: id }, include: ['chromosomes']}).then((projects) => {
    const project = projects[0];
    const currentGen = project.currentGeneration();
    return Chromosome.findAll({where: { projectId: project.id, generation: currentGen}}).then((chromos) => {
      return Promise.all(
        chromos.map((chromo) => chromo.onlineAptitude().then(
          (score) => { return { id: chromo.id, score: score } }
        )
      )).then((scores) => {
        const results = _.sortBy(scores, ['score']).reverse().map((result, index) => {
          return {id: result.id, copies: Math.round(2 - 2 * (index) / (10 - 1))};
        });
        console.log(results)
        return results;
      });
    });
  });
};

const getChromoByGenes = (genes, projectId) => {
  const result = {};

  result.elements = [];
  Object.keys(genes).filter((elem) => elem.includes('perm')).forEach((key) => {
    result.elements.push(genes[key]);
  });

  result.colors = [];
  Object.keys(genes).filter((elem) => elem.includes('color') && elem.includes('_h')).forEach((key) => {
    const color = {};
    const index = key[6]
    color.h = genes[`color_${index}_h`];
    color.s = genes[`color_${index}_s`];
    color.l = genes[`color_${index}_l`];
    result.colors.push(palettesParser.hslToHex(color.h, color.s, color.l));
  });

  result.styling = {};
  Object.keys(genes).filter((elem) => elem.includes('styling')).forEach((key) => {
    result.styling[key.replace('styling_','')] = genes[key];
  });

  result.projectId = projectId;

  return result;
};


const crossover = (id) => {
  return getRankingScores(id).then((resp) => { // It could be roulette
    const selected = resp;
    const asIs = [];

    for (let i = 0; i < selected.length * 0.2; i++) {
      const candidate = selected.sort((b,c) => c.copies - b.copies)[0];
      asIs.push(candidate);
      candidate.copies --;
    };
    const crossover = [];
    for (let i = 0; i < selected.length - asIs.length; i++) {
      const candidate = selected.filter((elem) => elem.copies > 0)[0];
      crossover.push(candidate);
      candidate.copies --;
    };

    console.log('CROSSOVER');
    console.log(crossover);
    console.log('AS IS');
    console.log(asIs);

    return Project.findAll({where: { id: id }, include: ['chromosomes']}).then((projects) => {
      const proj = projects[0];
      const currentGen = proj.currentGeneration() + 1;
      asIs.map((result) => Chromosome.find(result.id).then((chromo) => {
        chromo.generation = currentGen;
        console.log('AS IS');
        console.log(chromo);
        //chromo.save();
      }));
      const shuffledCrossover = _.shuffle(crossover);
      while (shuffledCrossover.length) {
        const x = shuffledCrossover.pop();
        const y = shuffledCrossover.pop();
        const xGen = proj.chromosomes.filter((chro) => chro.id === x.id)[0].toGenes();
        const yGen = proj.chromosomes.filter((chro) => chro.id === y.id)[0].toGenes();
        const bitString = Object.keys(xGen).map((key) => { return { key: key, bit: Math.floor(Math.random() * 2)}});
        const xChild = {};
        const yChild = {};
        bitString.forEach((elem) => {
          if (elem.bit) {
            xChild[elem.key] = xGen[elem.key];
            yChild[elem.key] = yGen[elem.key];
          } else {
            yChild[elem.key] = xGen[elem.key];
            xChild[elem.key] = yGen[elem.key];
          }
        });
        console.log(`CROSSED ${x.id}`);
        console.log(getChromoByGenes(xChild, proj.id));
        console.log(`CROSSED ${y.id}`);
        console.log(getChromoByGenes(yChild, proj.id));
        // TENGO QUE HACERLE OFFLINE A AMBOS DESDE UN CROMOSOMA BUILDEADO (.build). SI SE EXCEDE NO LO GUARDO Y NUEVAMENTE AL LOOP. 
        //Chromosome.create(getChromoByGenes(xChild, proj.id));
        //Chromosome.create(getChromoByGenes(yChild, proj.id));
      };
    })
  })
};
