export const getColorHue = (color) => {
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
      default:
        hue = 0; // Handle unmatched cases
        break;
    }
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }
  return hue;
};
