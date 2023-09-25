// From here: https://medium.com/@omar.rashid2/fisher-yates-shuffle-a2aa15578d2f
const shuffle = (array) => {
  let oldElement;

  for (let i = array.length - 1; i > 0; i--) {
    let rand = Math.floor(Math.random() * (i + 1));
    oldElement = array[i];
    array[i] = array[rand];
    array[rand] = oldElement;
  }

  return array;
}

export default shuffle
