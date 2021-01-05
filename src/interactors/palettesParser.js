require('dotenv').config();
const parser = require('node-html-parser');
const axios = require('axios');
const _ = require('lodash');

const url = (color) => `${process.env.PALETTES_URL}?hex=%23${color}&sub=1`;

const parsePalettes = (data) => {
  const parsed = parser.parse(data.data);
  return parsed.querySelector('.palettes').querySelector('.wrapper').querySelectorAll('.color-palette');
};

const parsePalette = (data) => {
  const palette = [];
  const colorboxes = data.querySelector('.color-palette-inner').querySelectorAll('.color-box');
  colorboxes.forEach((colorbox) => {
    const colortext = colorbox.querySelector('input').attributes.value;
    palette.push(colortext);
  });
  return palette;
}

const fetchPalletes = (baseColors, result, successCb, errorCb) => {
  const baseColor = baseColors.shift();
  if(baseColor) {
    axios.get(url(baseColor), { method: 'get', headers: {'X-Requested-With': 'XMLHttpRequest'}}).then((data) => {

      const palettes = parsePalettes(data);
      palettes.forEach((palette) => {
        result.push(parsePalette(palette));
      });
      fetchPalletes(baseColors, result, successCb, errorCb);
    }).catch((err) => {
      errorCb(err);
    });
  } else {
    successCb(result);
  }
}

const getPalettes = (baseColors) => {
  return new Promise((resolve, reject) => {
    fetchPalletes(unsignedColors(baseColors), [], resolve, reject)
  });
}

// TODO: New file for distance VS parser

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return {h,s,l};
}

function distanceHSL(color1, color2) {
  // Return HSL to hex distance between two colors
  const hsl1 = hexToHSL(color1);
  const hsl2 = hexToHSL(color2);

  const h = (Math.abs(Math.abs((hsl1.h - hsl2.h + 180) % 360) - 180)) * 100 / 180;
  const s = Math.abs(hsl1.s - hsl2.s);
  const l = Math.abs(hsl1.l - hsl2.l);

  return {h,s,l};
}

function lumDistance(color1, color2) {
  const hsl = distanceHSL(color1, color2);
  return hsl.l;
}

function distance(color1, color2) {
  const hsl = distanceHSL(color1, color2);
  return (hsl.h + hsl.s + hsl.l);
};

const unsignedColors = (baseColors) => baseColors.map((color) => color.split('#').join(''));

const getNearestInPalette = (baseColors, palette) => {
  // Given a palette and N landing colors, return the N palette colors closer to landing colors
  const paletteColors = {
    colors: [],
    totalDistance: 0,
    baseColor: palette[0]
  };

  baseColors.forEach((lColor) => {
    const distancedColors = palette.map((pColor) => {
      return {pColor, distance: distance(pColor, lColor)}
    });

    const nearest = _.minBy(distancedColors, 'distance');
    paletteColors.totalDistance += nearest.distance;
    paletteColors.colors.push(nearest.pColor);
  });

  return paletteColors;
}

const getFilteredPalettes = (baseColors) => {
  return getPalettes(baseColors).then((palettes) => {
    return palettes.map((palette) => getNearestInPalette(baseColors, palette));
  });
};

const palettesParser = {
  getFilteredPalettes: getFilteredPalettes,
  distance: distance,
  lumDistance: lumDistance,
  getNearestInPalette: getNearestInPalette,
  hexToHSL: hexToHSL,
  hslToHex: hslToHex
};

module.exports = palettesParser;
