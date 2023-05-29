import data from "../data.json";

export const getTileSizes = () => {
  const minSize = 50;
  const maxSize = 200;
  const sizes = {};
  data.tiles.forEach((tile, index) => {
    const size = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
    sizes[index] = `${size}px`;
  });
  return sizes;
};
