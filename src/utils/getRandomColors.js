let previousColor = null;
let lowestSaturation = 50;
let highestSaturation = 100;
let lowestLightness = 30;
let highestLightness = 60;
export const getRandomColors = () => {
  let color = "";
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

const getColorHue = (color) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  const [r, g, b] = data.slice(0, 3);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  if (max === min) {
    hue = 0;
  } else {
    const delta = max - min;
    switch (max) {
      case r:
        hue = ((g - b) / delta) % 6;
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      case b:
        hue = (r - g) / delta + 4;
        break;
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }
  return hue;
};
