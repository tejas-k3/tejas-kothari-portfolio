export const getRandomSize = () => {
  const minSize = 50;
  const maxSize = 200;
  const num = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
  return num;
};
