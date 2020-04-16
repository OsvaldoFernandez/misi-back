const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

const randomizer = (project) => {
  const newElements = [...(project.elements)].map((candidates) => [...candidates]);
  return newElements.map((candidates) => shuffle(candidates));
}

module.exports = randomizer;
