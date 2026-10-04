// Draws ../favicon.ico. Not a build step: the .ico is committed and served as-is,
// and this is only run again when the drawing changes -
//   node design/favicon.js
//
// The icon is a gamepad whose controls are 4 0 4 - see design/DESIGN.md, "The
// favicon". It is two drawings, not one scaled: a 16 grid for the tab and a 32
// grid for everything larger, because the big one shrunk loses its digits.

const fs = require("fs");
const path = require("path");

const AMBER = [0xff, 0xb0, 0x00]; // --p-amber
const GROUND = [0x0a, 0x07, 0x04]; // --p-ground

const FOUR_3 = ["#.#", "#.#", "###", "..#", "..#"];
const ZERO_4 = [".##.", "#..#", "#..#", "#..#", ".##."];
const FOUR_7 = ["##...##", "##...##", "##...##", "##...##", "#######", "#######", ".....##", ".....##", ".....##"];
const ZERO_6 = [".####.", "######", "##..##", "##..##", "##..##", "##..##", "##..##", "######", ".####."];

// The pad's silhouette as [firstRow, lastRow, ...[x0, x1] spans], then its digits
// as [glyph, x, y].
const DRAWINGS = {
  16: {
    body: [[2, 2, [2, 13]], [3, 3, [1, 14]], [4, 11, [0, 15]], [12, 12, [0, 4], [11, 15]],
           [13, 13, [0, 3], [12, 15]], [14, 14, [1, 2], [13, 14]]],
    digits: [[FOUR_3, 2, 5], [ZERO_4, 6, 5], [FOUR_3, 11, 5]],
  },
  32: {
    body: [[5, 5, [5, 10], [21, 26]], [6, 6, [3, 28]], [7, 7, [1, 30]], [8, 21, [0, 31]],
           [22, 22, [0, 12], [19, 31]], [23, 23, [0, 10], [21, 31]], [24, 24, [0, 9], [22, 31]],
           [25, 25, [1, 8], [23, 30]], [26, 26, [2, 7], [24, 29]]],
    digits: [[FOUR_7, 3, 10], [ZERO_6, 13, 10], [FOUR_7, 22, 10]],
  },
};

// n x n pixels, each null (transparent) or an [r, g, b]. The digits are painted
// in the ground colour rather than left as holes, so they stay dark on a light
// tab bar.
function draw(n) {
  const px = Array.from({ length: n }, () => Array(n).fill(null));
  const { body, digits } = DRAWINGS[n];
  for (const [y0, y1, ...spans] of body)
    for (let y = y0; y <= y1; y++) for (const [a, b] of spans) for (let x = a; x <= b; x++) px[y][x] = AMBER;
  for (const [glyph, ox, oy] of digits)
    glyph.forEach((row, r) => [...row].forEach((c, i) => { if (c === "#") px[oy + r][ox + i] = GROUND; }));
  return px;
}

// One ICO image: a 32-bit BMP without its file header, rows bottom-up, followed
// by a 1-bit transparency mask whose rows pad to four bytes.
function bmp(px) {
  const n = px.length;
  const maskRow = Math.ceil(n / 32) * 4;
  const buf = Buffer.alloc(40 + n * n * 4 + n * maskRow);
  buf.writeUInt32LE(40, 0);
  buf.writeInt32LE(n, 4);
  buf.writeInt32LE(n * 2, 8); // colour rows plus mask rows
  buf.writeUInt16LE(1, 12);
  buf.writeUInt16LE(32, 14);
  buf.writeUInt32LE(n * n * 4 + n * maskRow, 20);
  for (let y = 0; y < n; y++) {
    const row = px[n - 1 - y];
    for (let x = 0; x < n; x++) {
      const p = row[x];
      const at = 40 + (y * n + x) * 4;
      if (p) buf.set([p[2], p[1], p[0], 0xff], at);
      else buf[40 + n * n * 4 + y * maskRow + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return buf;
}

const images = Object.keys(DRAWINGS).map(Number).map((n) => [n, bmp(draw(n))]);
const head = Buffer.alloc(6 + 16 * images.length);
head.writeUInt16LE(1, 2); // type: icon
head.writeUInt16LE(images.length, 4);
let offset = head.length;
images.forEach(([n, data], i) => {
  const at = 6 + 16 * i;
  head[at] = n;
  head[at + 1] = n;
  head.writeUInt16LE(1, at + 4);
  head.writeUInt16LE(32, at + 6);
  head.writeUInt32LE(data.length, at + 8);
  head.writeUInt32LE(offset, at + 12);
  offset += data.length;
});

const out = path.join(__dirname, "..", "favicon.ico");
fs.writeFileSync(out, Buffer.concat([head, ...images.map(([, data]) => data)]));
console.log("wrote " + out + ": " + images.map(([n]) => n + "px").join(", "));
