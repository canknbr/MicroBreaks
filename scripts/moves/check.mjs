#!/usr/bin/env node
/**
 * Validates every frame of every desk move against the engine's anatomy rules.
 *   node scripts/moves/check.mjs [moveId ...]
 * Exits non-zero when any frame fails.
 */
import { sampleFrames, validateFrame } from './rig.mjs';
import { MOVES } from './poses.mjs';

export const CHECK_FPS = 12;

export function checkMove(id) {
  const move = MOVES[id];
  const issues = [];
  let frames;
  try {
    frames = sampleFrames(move.keys, CHECK_FPS);
  } catch (error) {
    return [`${id}: ${error.message}`];
  }
  for (const f of frames) {
    const where = f.t === undefined ? `${id} key ${f.key}` : `${id} key ${f.key}→${(f.key + 1) % move.keys.length} @${f.t.toFixed(2)}`;
    issues.push(...validateFrame(f.frame, where));
  }
  return issues;
}

if (process.argv[1] && process.argv[1].endsWith('check.mjs')) {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(MOVES);
  let failed = 0;
  for (const id of ids) {
    const issues = checkMove(id);
    if (issues.length) {
      failed++;
      // Collapse repeats: show each distinct message once with a count.
      const counts = new Map();
      for (const msg of issues) {
        const k = msg.replace(/^.*?: /, '').replace(/\(-?\d+°\)|by [\d.]+px/, '').trim();
        const prev = counts.get(k);
        counts.set(k, { n: (prev?.n ?? 0) + 1, first: prev?.first ?? msg });
      }
      console.log(`✖ ${id}`);
      for (const { n, first } of counts.values()) console.log(`    ${first}${n > 1 ? `  (+${n - 1} more frames)` : ''}`);
    }
  }
  console.log(failed ? `\n${failed}/${ids.length} moves have problems` : `✔ ${ids.length} moves pass`);
  process.exitCode = failed ? 1 : 0;
}
