import { getColorHue } from "./getColorHue.js";

export const getRandomColors = () => {
  let color = "";
  let previousColor = null;
  let lowestSaturation = 50;
  let highestSaturation = 100;
  let lowestLightness = 30;
  let highestLightness = 60;

  if (previousColor) {
    const prevHue = getColorHue(previousColor);
    const newHue = (prevHue + getRandomInt(10, 40)) % 360;
    const newSaturation =
      Math.floor(Math.random() * (highestSaturation - lowestSaturation + 1)) +
      lowestSaturation;
    const newLightness =
      Math.floor(Math.random() * (highestLightness - lowestLightness + 1)) +
      lowestLightness;
    color = `hsl(${newHue}, ${newSaturation}%, ${newLightness}%)`;
  } else {
    color = getOriginalColor();
  }
  previousColor = color;

  return color;
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getOriginalColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
};
