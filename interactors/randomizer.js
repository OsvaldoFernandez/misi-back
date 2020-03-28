// const models = require('../models');
// const Project = models.Project;

// TODO: Get eq prob shuffle.
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// My reference chromosome (initial)
// TODO: Get this from previous generation
// const elements = [
//   [
//     'preheader',
//     'navbar'
//   ], [
//     'logo',
//     'title',
//     'social'
//   ], [
//     'option2',
//     'option3',
//     'option4',
//     'option5'
//   ], [
//     'section1',
//     'section2',
//     'section3',
//     'section4',
//     'section5'
//   ]
// ];


const randomizer = (project) => {
  const newElements = [...(project.elements)].map((candidates) => [...candidates]);
  return newElements.map((candidates) => shuffle(candidates));
}

// Getting new chrosomose
// TODO: This one should not be totally random. Just minor mutation.

module.exports = randomizer;
