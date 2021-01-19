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
        console.log('RESULTS');
        console.log(results);
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

const recursiveCrossover = (remaining, proj, currentGen) => {
  if (remaining.length) {
    const x = remaining[0];
    const y = remaining[1];
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
    const xChromo = Chromosome.build(getChromoByGenes(xChild, proj.id));
    const yChromo = Chromosome.build(getChromoByGenes(yChild, proj.id));
    xChromo.offlineAptitude().then((score1) => {
      yChromo.offlineAptitude().then((score2) => {
        if ((score1 > 0) && (score2 > 0)) {
          console.log(`crossed ${x.id} with ${y.id}`);
          xChromo.generation = currentGen;
          yChromo.generation = currentGen;
          remaining.shift();
          remaining.shift();
          xChromo.save();
          yChromo.save();
          recursiveCrossover(remaining, proj, currentGen);
        } else {
          recursiveCrossover(remaining, proj, currentGen);
        }
      });
    });
  }
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

    return Project.findAll({where: { id: id }, include: ['chromosomes']}).then((projects) => {
      const proj = projects[0];
      const currentGen = proj.currentGeneration() + 1;
      asIs.map((result) => Chromosome.find(result.id).then((chromo) => {
        console.log(`kept ${chromo.id}`);

        const newChromo = Chromosome.build(
          { elements: chromo.elements, colors: chromo.colors, styling: chromo.styling,
            projectId: chromo.projectId, copiedFrom: chromo.id, generation: currentGen }
        );
        newChromo.save();
      }));
      const shuffledCrossover = _.shuffle(crossover);
      recursiveCrossover(shuffledCrossover, proj, currentGen);
    })
  })
};

const recursiveMutation = (proj, chromo) => {
  const gen = _.sample(Object.keys(chromo.toGenes()));
  const elemType = gen.split('_')[0];
  const elemIndex = gen.split('_')[1];
  switch (elemType) {
    case 'perm':
      console.log(`CHROMO ${chromo.id} MUTA`);
      console.log(`Permutacion: de ${chromo.elements[elemIndex]}`);
      let newElements = chromo.elements;
      newElements[elemIndex] = _.shuffle(chromo.elements[elemIndex]);
      chromo.elements = newElements;
      console.log(`A: ${newElements[elemIndex]}`)
      chromo.save();
      break;
    case 'color':
      Palette.findAll({where: { projectId: proj.id }}).then((palettes) => {
        console.log(`CHROMO ${chromo.id} MUTA`);
        console.log(`COLOR: de ${chromo.colors[elemIndex]}`);
        let newColor = chromo.colors;
        newPalette = _.sample(palettes.filter((palette) => palette.baseColor !== palette.colors[elemIndex]));
        newColor[elemIndex] = newPalette.colors[elemIndex];
        chromo.colors = newColor;
        console.log(`A: ${newColor[elemIndex]}`);
        chromo.offlineAptitude().then((score) => {
          if (score > 0) {
            chromo.save();
          } else {
            console.log(`CHROMO ${chromo.id} REPRUEBA OFFLINE`);
            chromo.reload().then((newChromo) => {
              recursiveMutation(proj, newChromo);
            });
          }
        });
      });
      break;
    case 'styling':
      console.log(`CHROMO ${chromo.id} MUTA`);
      console.log(`STYLING: de ${chromo.styling[elemIndex]}`);
      let newStyling = chromo.styling;
      newStyling[elemIndex] = _.sample(proj.baseStyles[elemIndex]);
      chromo.styling = newStyling;
      console.log(`A: ${newStyling[elemIndex]}`);
      chromo.save();
      break;
    default:
      console.log('ERROR');
  }
};

const mutation = (id) => {
  return Project.findAll({where: { id: id }, include: ['chromosomes']}).then((projects) => {
    const proj = projects[0];
    const currentGen = proj.currentGeneration();
    const chromos = proj.chromosomes.filter((chromo) => chromo.generation === currentGen );
    chromos.forEach((chromo) => {
      if (Math.random() < 0.8) {
        recursiveMutation(proj, chromo);
      } else {
        console.log(`CHROMO ${chromo.id} NO MUTA`);
      };
    });
  })
}
