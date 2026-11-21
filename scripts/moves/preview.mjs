#!/usr/bin/env node
/**
 * Contact sheet of every keyframe (plus the mid-transition frame with --mid),
 * for eyeballing poses while authoring.
 *   node scripts/moves/preview.mjs <out.png> [--mid] [moveId ...]
 */
import sharp from 'sharp';
import { fitBox, sampleFrames, solveKey } from './rig.mjs';
import { renderIllustrated } from './illustrate.mjs';
import { MOVES } from './poses.mjs';

const args = process.argv.slice(2);
const outPath = args.shift();
const withMid = args[0] === '--mid' ? (args.shift(), true) : false;
if (!outPath) {
  console.error('usage: node scripts/moves/preview.mjs <out.png> [--mid] [moveId ...]');
  process.exit(1);
}
const selected = args.length ? args : Object.keys(MOVES);
const CELL = 256;

const rows = selected.map((id) => {
  const move = MOVES[id];
  const all = sampleFrames(move.keys, 12);
  const frames = [];
  move.keys.forEach((k, i) => {
    frames.push(solveKey(k.pose));
    if (withMid) {
      const mids = all.filter((f) => f.key === i && f.t !== undefined);
      if (mids.length) frames.push(mids[Math.floor(mids.length * 0.75)].frame);
    }
  });
  return { id, frames, box: fitBox(all.map((f) => f.frame)) };
});
const cols = Math.max(...rows.map((r) => r.frames.length));

let cells = '';
rows.forEach((row, r) => {
  row.frames.forEach((frame, c) => {
    const svg = renderIllustrated(frame, { background: '#F6F4EF', glowId: `g${r}_${c}`, box: row.box });
    cells += `<image x="${c * CELL}" y="${r * CELL}" width="${CELL}" height="${CELL}" href="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"/>`;
  });
  cells += `<text x="8" y="${r * CELL + 20}" fill="#8a8a8a" font-size="15" font-family="Menlo">${row.id}</text>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * CELL}" height="${rows.length * CELL}"><rect width="100%" height="100%" fill="#ddd"/>${cells}</svg>`;
await sharp(Buffer.from(svg)).png().toFile(outPath);
console.log(`✔ ${outPath} (${rows.length} moves)`);
