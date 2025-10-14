// Blurhash decoder utility
// Simplified implementation for canvas decoding

const digitCharacters = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '#', '$', '%', '*', '+', ',',
  '-', '.', ':', ';', '=', '?', '@', '[', ']', '^', '_', '{', '|', '}', '~',
];

const decode83 = (str: string): number => {
  let value = 0;
  for (let i = 0; i < str.length; i++) {
    const digit = digitCharacters.indexOf(str[i]);
    value = value * 83 + digit;
  }
  return value;
};

const sRGBToLinear = (value: number): number => {
  const v = value / 255;
  if (v <= 0.04045) {
    return v / 12.92;
  } else {
    return Math.pow((v + 0.055) / 1.055, 2.4);
  }
};

const linearTosRGB = (value: number): number => {
  const v = Math.max(0, Math.min(1, value));
  if (v <= 0.0031308) {
    return Math.round(v * 12.92 * 255 + 0.5);
  } else {
    return Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
  }
};

const signPow = (val: number, exp: number): number => {
  return Math.sign(val) * Math.pow(Math.abs(val), exp);
};

export function decodeToCanvas(blurhash: string, width: number, height: number, punch: number = 1): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const sizeFlag = decode83(blurhash[0]);
  const numY = Math.floor(sizeFlag / 9) + 1;
  const numX = (sizeFlag % 9) + 1;

  const quantisedMaximumValue = decode83(blurhash[1]);
  const maximumValue = (quantisedMaximumValue + 1) / 166;

  const colors: number[][] = [];

  for (let i = 0; i < numX * numY; i++) {
    if (i === 0) {
      const value = decode83(blurhash.substring(2, 6));
      colors.push([
        sRGBToLinear(value >> 16),
        sRGBToLinear((value >> 8) & 255),
        sRGBToLinear(value & 255),
      ]);
    } else {
      const value = decode83(blurhash.substring(4 + i * 2, 6 + i * 2));
      colors.push([
        signPow((Math.floor(value / (19 * 19)) - 9) / 9, 2) * maximumValue,
        signPow((Math.floor(value / 19) % 19 - 9) / 9, 2) * maximumValue,
        signPow((value % 19 - 9) / 9, 2) * maximumValue,
      ]);
    }
  }

  const imageData = ctx.createImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let j = 0; j < numY; j++) {
        for (let i = 0; i < numX; i++) {
          const basis =
            Math.cos((Math.PI * x * i) / width) *
            Math.cos((Math.PI * y * j) / height);
          const color = colors[i + j * numX];
          r += color[0] * basis;
          g += color[1] * basis;
          b += color[2] * basis;
        }
      }

      const intR = linearTosRGB(r * punch);
      const intG = linearTosRGB(g * punch);
      const intB = linearTosRGB(b * punch);

      const idx = (y * width + x) * 4;
      imageData.data[idx] = intR;
      imageData.data[idx + 1] = intG;
      imageData.data[idx + 2] = intB;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
