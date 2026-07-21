#!/usr/bin/env node
/**
 * Exercise Library Generator
 *
 * Curates desk-friendly movements from the open exercises dataset
 * (https://github.com/hasaneyldrm/exercises-dataset) and generates:
 *
 *   1. assets/exercises/gifs/<id>.gif    — 180×180 animation per movement
 *   2. assets/exercises/thumbs/<id>.jpg  — 180×180 thumbnail per movement
 *   3. data/exerciseLibrary.generated.ts — typed records (EN+TR names, steps, taxonomy)
 *   4. data/exerciseLibraryMedia.generated.ts — static require() map for Metro
 *
 * Usage:
 *   node scripts/generate-exercise-library.mjs [datasetDir]
 *   EXERCISES_DATASET_DIR=/path/to/exercises-dataset-main npm run generate:exercises
 *
 * Curation principles (MicroBreaks = 1–5 min desk wellness breaks):
 *   - body-weight only: no barbells, machines, bars, benches, bands, or suspension gear
 *   - every movement doable at/near a desk, standing in a small space, or on a mat
 *   - no advanced gymnastics (planche, levers, handstands) or one-arm feats
 *   - near-duplicates collapsed to the clearest variant
 *   - dataset media is © Gym visual (https://gymvisual.com/) — 180×180 with
 *     attribution retained, per the dataset NOTICE.md redistribution terms
 *
 * The TR display names below are hand-authored; TR instruction steps come from
 * the dataset itself (MIT-licensed text).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Curated catalog. `id` is the dataset id. Optional `name` overrides the
 * dataset name (typo fixes, clarity); `position` overrides the automatic
 * classification derived from instruction text.
 *
 * kind:       stretch | mobility | strength | cardio
 * difficulty: 1 gentle · 2 moderate · 3 challenging
 */
const CURATED = [
  // ── Neck ────────────────────────────────────────────────────────────────
  { id: '1403', tr: 'Boyun yan esnetme', kind: 'stretch', difficulty: 1, position: 'desk' },
  { id: '0716', tr: 'Dirençli boyun yan esnetme', kind: 'stretch', difficulty: 1, position: 'desk' },

  // ── Shoulders ───────────────────────────────────────────────────────────
  { id: '0669', tr: 'Arka omuz esnetme', kind: 'stretch', difficulty: 1 },
  { id: '2271', name: 'Boxing left hook', tr: 'Gölge boks: sol kroşe', kind: 'cardio', difficulty: 2 },

  // ── Back & spine ────────────────────────────────────────────────────────
  { id: '1405', tr: 'Sırt-göğüs esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1346', tr: 'Diz üstü kanat esnetme', kind: 'stretch', difficulty: 1 },
  { id: '0690', tr: 'Oturarak bel esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1358', tr: 'Yan yatış esnetmesi', kind: 'stretch', difficulty: 1 },
  { id: '1362', name: 'Sphinx pose', tr: 'Sfenks duruşu', kind: 'stretch', difficulty: 1 },
  { id: '1363', tr: 'Omurga esnetme', kind: 'stretch', difficulty: 1 },
  { id: '0794', tr: 'Ayakta yan esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1364', tr: 'Ayakta pelvik eğim', kind: 'mobility', difficulty: 1 },
  { id: '1365', tr: 'Üst sırt esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1366', tr: 'Yukarı bakan köpek', kind: 'stretch', difficulty: 2 },
  { id: '1352', tr: 'Bel kıvırma', kind: 'mobility', difficulty: 1 },
  { id: '3669', tr: 'Ayakta okçu rotasyonu', kind: 'mobility', difficulty: 1 },

  // ── Chest ───────────────────────────────────────────────────────────────
  { id: '1271', tr: 'Göğüs ve ön omuz esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1167', tr: 'Dinamik göğüs esnetme', kind: 'mobility', difficulty: 1 },
  { id: '0659', name: 'Wall push-up', tr: 'Duvar şınavı', kind: 'strength', difficulty: 1 },
  { id: '0493', tr: 'Eğimli şınav', kind: 'strength', difficulty: 2, position: 'desk' },
  { id: '3211', tr: 'Dizüstü şınav', kind: 'strength', difficulty: 1 },
  { id: '0662', tr: 'Şınav', kind: 'strength', difficulty: 2 },
  { id: '1297', tr: 'İzometrik göğüs sıkıştırma', kind: 'strength', difficulty: 1, position: 'desk' },
  { id: '3145', tr: 'Şınav plus', kind: 'strength', difficulty: 2 },
  { id: '3021', tr: 'Kürek kemiği şınavı', kind: 'mobility', difficulty: 2 },
  { id: '3011', tr: 'Eğimli kürek kemiği şınavı', kind: 'mobility', difficulty: 1, position: 'desk' },

  // ── Arms & wrists ───────────────────────────────────────────────────────
  { id: '0721', tr: 'Bilek çekme esnetmesi', kind: 'stretch', difficulty: 1, position: 'desk' },
  { id: '1428', tr: 'Bilek daireleri', kind: 'mobility', difficulty: 1, position: 'desk' },
  { id: '1421', tr: 'Ön kol plank geçişi', kind: 'strength', difficulty: 2, position: 'floor' },
  { id: '0643', tr: 'Baş üstü triseps esnetme', kind: 'stretch', difficulty: 1 },
  { id: '0129', name: 'Chair dip (knees bent)', tr: 'Sandalyede dips (dizler bükülü)', kind: 'strength', difficulty: 2, position: 'desk' },
  { id: '0283', tr: 'Elmas şınav', kind: 'strength', difficulty: 3 },
  { id: '2398', tr: 'Dizüstü dar şınav', kind: 'strength', difficulty: 1 },
  { id: '0490', tr: 'Eğimli dar şınav', kind: 'strength', difficulty: 2, position: 'desk' },
  { id: '1770', tr: 'Bacak dirençli biseps curl', kind: 'strength', difficulty: 1, position: 'desk' },
  { id: '1771', tr: 'Dizüstü triseps ekstansiyonu', kind: 'strength', difficulty: 2 },

  // ── Lower legs ──────────────────────────────────────────────────────────
  { id: '1368', tr: 'Ayak bileği daireleri', kind: 'mobility', difficulty: 1, position: 'desk' },
  { id: '1373', tr: 'Ayakta baldır yükselişi', kind: 'strength', difficulty: 1 },
  { id: '1407', tr: 'Duvarda baldır itme esnetmesi', kind: 'stretch', difficulty: 1 },
  { id: '1377', tr: 'Duvarda baldır esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1390', tr: 'Oturarak baldır esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1490', tr: 'Merdivende baldır yükselişi', kind: 'strength', difficulty: 1 },
  { id: '1387', tr: 'Tek bacak baldır yükselişi', kind: 'strength', difficulty: 2 },
  { id: '0257', tr: 'Diz daireleri', kind: 'mobility', difficulty: 1 },

  // ── Hips & upper legs — stretches ───────────────────────────────────────
  { id: '1512', name: 'All fours squat stretch', tr: 'Emekleme pozisyonunda kalça esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1548', tr: 'Sandalyede bacak uzatma esnetmesi', kind: 'stretch', difficulty: 1, position: 'desk' },
  { id: '1511', tr: 'Arka bacak esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1576', tr: 'Bacak yukarıda arka bacak esnetme', kind: 'stretch', difficulty: 1 },
  { id: '0613', tr: 'Yan yatarak ön bacak esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1419', tr: 'Çapraz bacak esnetme', kind: 'stretch', difficulty: 2 },
  { id: '2571', tr: 'Sallanan kurbağa esnetmesi', kind: 'stretch', difficulty: 2 },
  { id: '1585', name: "Runner's stretch", tr: 'Koşucu esnetmesi', kind: 'stretch', difficulty: 1 },
  { id: '1424', tr: 'Oturarak kalça esnetme', kind: 'stretch', difficulty: 1 },
  { id: '2567', tr: 'Oturarak piriformis esnetme', kind: 'stretch', difficulty: 1 },
  { id: '1587', tr: 'Oturarak geniş açı esnetme serisi', kind: 'stretch', difficulty: 2 },
  { id: '1494', tr: 'Kelebek duruşu', kind: 'stretch', difficulty: 1 },
  { id: '1418', name: 'Hug knees to chest', tr: 'Çömelip dizlere sarılma', kind: 'stretch', difficulty: 1 },
  { id: '1604', name: "World's greatest stretch", tr: 'Dünyanın en iyi esnetmesi', kind: 'mobility', difficulty: 2 },
  { id: '3639', tr: 'Yatarak diz bükülü rotasyon', kind: 'stretch', difficulty: 1 },

  // ── Hips & upper legs — strength & mobility ─────────────────────────────
  { id: '3533', name: 'Bodyweight squat', tr: 'Squat (çömelme)', kind: 'strength', difficulty: 1 },
  { id: '3470', tr: 'Öne hamle (lunge)', kind: 'strength', difficulty: 2 },
  { id: '1460', tr: 'Yürüyerek hamle', kind: 'strength', difficulty: 2 },
  { id: '3769', name: 'Curtsy squat', tr: 'Reverans squat', kind: 'strength', difficulty: 2 },
  { id: '2368', name: 'Split squat', tr: 'Split squat', kind: 'strength', difficulty: 2 },
  { id: '0514', tr: 'Sıçramalı squat', kind: 'cardio', difficulty: 3 },
  { id: '1685', tr: 'Squat + yukarı uzanma', kind: 'mobility', difficulty: 1 },
  { id: '1686', tr: 'Squat + dönüşlü uzanma', kind: 'mobility', difficulty: 2 },
  { id: '0624', name: 'Wall sit march', tr: 'Duvar oturuşunda diz çekme', kind: 'strength', difficulty: 2 },
  { id: '3119', name: 'Low squat', tr: 'Alçak squat', kind: 'mobility', difficulty: 1 },
  { id: '3132', name: 'Low squat with support', tr: 'Destekli alçak squat', kind: 'mobility', difficulty: 1 },
  { id: '3561', tr: 'Kalça köprüsünde yürüyüş', kind: 'strength', difficulty: 2 },
  { id: '3013', tr: 'Alçak kalça köprüsü', kind: 'strength', difficulty: 1 },
  { id: '1422', tr: 'Pelvik eğimden köprüye', kind: 'mobility', difficulty: 1 },
  { id: '3645', tr: 'Tek bacak köprü', kind: 'strength', difficulty: 2 },
  { id: '0459', tr: 'Makas tekmeleri', kind: 'strength', difficulty: 2 },
  { id: '3552', name: 'Quick feet', tr: 'Hızlı ayaklar', kind: 'cardio', difficulty: 2 },
  { id: '0710', tr: 'Ayakta yan bacak kaldırma', kind: 'strength', difficulty: 1 },
  { id: '3667', tr: 'Yan yatarak iç bacak kaldırma', kind: 'strength', difficulty: 1 },
  { id: '0795', tr: 'Ayakta arka bacak bükme', kind: 'strength', difficulty: 1 },
  { id: '3212', name: 'Standing toe touch', tr: 'Ayakta öne eğilme', kind: 'mobility', difficulty: 1 },

  // ── Core ────────────────────────────────────────────────────────────────
  { id: '3147', name: 'Lying pelvic tilt', tr: 'Yatarak pelvik eğim', kind: 'mobility', difficulty: 1 },
  { id: '0276', tr: 'Ölü böcek (dead bug)', kind: 'strength', difficulty: 1 },
  { id: '3016', tr: 'Kıvrılma (curl-up)', kind: 'strength', difficulty: 1 },
  { id: '0687', name: 'Russian twist', tr: 'Rus twisti', kind: 'strength', difficulty: 2 },
  { id: '2329', tr: 'Omurga rotasyonu', kind: 'mobility', difficulty: 1 },
  { id: '1471', tr: 'Tırtıl yürüyüşü', kind: 'mobility', difficulty: 2, position: 'floor' },
  { id: '0689', tr: 'Oturarak bacak kaldırma', kind: 'strength', difficulty: 1, position: 'desk' },
  { id: '3699', tr: 'Plank omuz dokunuşu', kind: 'strength', difficulty: 2 },
  { id: '3239', tr: 'Dizüstü plank omuz dokunuşu', kind: 'strength', difficulty: 1 },
  { id: '0664', tr: 'Şınav + yan plank', kind: 'strength', difficulty: 3, position: 'floor' },
  { id: '0464', tr: 'Plank + rotasyon', kind: 'strength', difficulty: 2 },
  { id: '0002', tr: '45° yana eğilme', kind: 'strength', difficulty: 1 },
  { id: '0006', tr: 'Topuk dokunuşları', kind: 'strength', difficulty: 1 },
  { id: '0001', tr: '3/4 mekik', kind: 'strength', difficulty: 2 },
  { id: '3201', tr: 'Çeyrek mekik', kind: 'strength', difficulty: 1 },
  { id: '0872', tr: 'Ters mekik', kind: 'strength', difficulty: 2 },
  { id: '0262', tr: 'Çapraz mekik', kind: 'strength', difficulty: 2 },
  { id: '0443', tr: 'Dirsek-diz buluşması', kind: 'strength', difficulty: 2 },
  { id: '0003', name: 'Air bike', tr: 'Bisiklet mekik', kind: 'strength', difficulty: 2 },
  { id: '0274', name: 'Crunch', tr: 'Mekik (crunch)', kind: 'strength', difficulty: 1 },
  { id: '0865', tr: 'Yatarak bacak-kalça kaldırma', kind: 'strength', difficulty: 2 },
  { id: '0705', name: 'Side plank', tr: 'Yan plank', kind: 'strength', difficulty: 2 },
  { id: '3213', tr: 'Yanlara ayak ucu dokunuşu', kind: 'strength', difficulty: 1 },
  { id: '1687', tr: 'Geriye adım + yukarı uzanma', kind: 'mobility', difficulty: 1 },
  { id: '1688', tr: 'Dönüşlü hamle', kind: 'mobility', difficulty: 2 },

  // ── Cardio ──────────────────────────────────────────────────────────────
  { id: '3672', tr: 'İleri-geri adımlama', kind: 'cardio', difficulty: 1 },
  { id: '3636', tr: 'Duvarda yüksek diz', kind: 'cardio', difficulty: 2 },
  { id: '3221', tr: 'Yarım diz bükme', kind: 'cardio', difficulty: 1 },
  { id: '3224', name: 'Jack jump', tr: 'Jack sıçraması', kind: 'cardio', difficulty: 2 },
  { id: '3219', tr: 'Makas sıçraması', kind: 'cardio', difficulty: 2 },
  { id: '3222', tr: 'Yarım squat sıçraması', kind: 'cardio', difficulty: 2 },
  { id: '3223', tr: 'Yıldız sıçraması', kind: 'cardio', difficulty: 3 },
  { id: '3671', tr: 'Kayak adımı', kind: 'cardio', difficulty: 1 },
  { id: '0630', tr: 'Dağcı hareketi', kind: 'cardio', difficulty: 2 },
  { id: '1160', tr: 'Burpee', kind: 'cardio', difficulty: 3 },
  { id: '3360', tr: 'Ayı yürüyüşü', kind: 'cardio', difficulty: 3 },
  { id: '3361', tr: 'Patenci sıçrayışı', kind: 'cardio', difficulty: 2 },
  { id: '3655', tr: 'Yüksek diz + hamle yürüyüşü', kind: 'cardio', difficulty: 2 },
];

// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exitCode = 1;
}

function classifyPosition(entry, exercise) {
  if (entry.position) return entry.position;
  const first = (exercise.instructions?.en ?? '').slice(0, 160).toLowerCase();
  if (/sit (?:up straight |tall )?(?:on|in) (?:the edge of )?(?:a |your )?(?:chair|bench)|stand or sit|sit or stand/.test(first)) {
    return 'desk';
  }
  if (/lie |lying|kneel|all fours|sit on the (?:ground|floor)|face down|on your back|on your side|plank position|crawl/.test(first)) {
    return 'floor';
  }
  return 'standing';
}

function cleanName(entry, exercise) {
  const raw = entry.name ?? exercise.name;
  const stripped = raw.replace(/\s*\((?:male|female)\)\s*$/i, '').trim();
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function normalizeSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((step) => String(step).replace(/\s+/g, ' ').trim())
    .filter((step) => step.length > 0);
}

function tsString(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function main() {
  const datasetDir =
    process.argv[2] ?? process.env.EXERCISES_DATASET_DIR ?? '';

  if (!datasetDir || !fs.existsSync(path.join(datasetDir, 'data', 'exercises.json'))) {
    fail(
      'Dataset not found. Pass the dataset directory as the first argument or set EXERCISES_DATASET_DIR.\n' +
        '  Expected layout: <dir>/data/exercises.json, <dir>/images/, <dir>/videos/'
    );
    return;
  }

  const dataset = JSON.parse(
    fs.readFileSync(path.join(datasetDir, 'data', 'exercises.json'), 'utf8')
  );
  const byId = new Map(dataset.map((exercise) => [exercise.id, exercise]));

  const seen = new Set();
  for (const entry of CURATED) {
    if (seen.has(entry.id)) fail(`Duplicate curated id: ${entry.id}`);
    seen.add(entry.id);
    if (!byId.has(entry.id)) fail(`Curated id not in dataset: ${entry.id}`);
  }
  if (process.exitCode) return;

  const gifDir = path.join(ROOT, 'assets', 'exercises', 'gifs');
  const thumbDir = path.join(ROOT, 'assets', 'exercises', 'thumbs');
  fs.mkdirSync(gifDir, { recursive: true });
  fs.mkdirSync(thumbDir, { recursive: true });

  const records = [];
  let mediaBytes = 0;

  for (const entry of CURATED) {
    const exercise = byId.get(entry.id);

    // MicroBreaks is a desk app — only surface movements a seated or standing
    // worker can do without getting on the floor. Floor/lying/kneeling/plank
    // moves are dropped from the generated catalog entirely.
    const position = classifyPosition(entry, exercise);
    if (position === 'floor') continue;

    const gifSource = path.join(datasetDir, exercise.gif_url);
    const thumbSource = path.join(datasetDir, exercise.image);
    if (!fs.existsSync(gifSource)) {
      fail(`Missing GIF for ${entry.id}: ${gifSource}`);
      continue;
    }
    if (!fs.existsSync(thumbSource)) {
      fail(`Missing thumbnail for ${entry.id}: ${thumbSource}`);
      continue;
    }

    const stepsEn = normalizeSteps(exercise.instruction_steps?.en);
    const stepsTr = normalizeSteps(exercise.instruction_steps?.tr);
    if (stepsEn.length === 0) fail(`No EN steps for ${entry.id} (${exercise.name})`);
    if (stepsTr.length === 0) fail(`No TR steps for ${entry.id} (${exercise.name})`);

    const gifTarget = path.join(gifDir, `${entry.id}.gif`);
    const thumbTarget = path.join(thumbDir, `${entry.id}.jpg`);
    fs.copyFileSync(gifSource, gifTarget);
    fs.copyFileSync(thumbSource, thumbTarget);
    mediaBytes += fs.statSync(gifTarget).size + fs.statSync(thumbTarget).size;

    records.push({
      id: `lib-${entry.id}`,
      datasetId: entry.id,
      name: { en: cleanName(entry, exercise), tr: entry.tr },
      bodyPart: exercise.body_part,
      target: exercise.target,
      secondaryMuscles: exercise.secondary_muscles ?? [],
      kind: entry.kind,
      position,
      difficulty: entry.difficulty,
      steps: { en: stepsEn, tr: stepsTr },
    });
  }
  if (process.exitCode) return;

  // Remove stale media from previous runs so deleted curations don't linger.
  const validGifs = new Set(records.map((record) => `${record.datasetId}.gif`));
  const validThumbs = new Set(records.map((record) => `${record.datasetId}.jpg`));
  for (const file of fs.readdirSync(gifDir)) {
    if (!validGifs.has(file)) fs.rmSync(path.join(gifDir, file));
  }
  for (const file of fs.readdirSync(thumbDir)) {
    if (!validThumbs.has(file)) fs.rmSync(path.join(thumbDir, file));
  }

  // Stable ordering: body part, then EN name — keeps diffs reviewable.
  records.sort(
    (a, b) => a.bodyPart.localeCompare(b.bodyPart) || a.name.en.localeCompare(b.name.en)
  );

  const header = `/**
 * AUTO-GENERATED by scripts/generate-exercise-library.mjs — do not edit.
 * Regenerate with: npm run generate:exercises -- <datasetDir>
 *
 * Movement data © exercises-dataset contributors (MIT).
 * Media referenced by these records is © Gym visual — https://gymvisual.com/
 */
`;

  const dataLines = records.map((record) => {
    const secondary = record.secondaryMuscles.map(tsString).join(', ');
    const stepsEn = record.steps.en.map(tsString).join(',\n        ');
    const stepsTr = record.steps.tr.map(tsString).join(',\n        ');
    return `  {
    id: ${tsString(record.id)},
    datasetId: ${tsString(record.datasetId)},
    name: { en: ${tsString(record.name.en)}, tr: ${tsString(record.name.tr)} },
    bodyPart: ${tsString(record.bodyPart)},
    target: ${tsString(record.target)},
    secondaryMuscles: [${secondary}],
    kind: ${tsString(record.kind)},
    position: ${tsString(record.position)},
    difficulty: ${record.difficulty},
    steps: {
      en: [
        ${stepsEn},
      ],
      tr: [
        ${stepsTr},
      ],
    },
  },`;
  });

  const dataFile = `${header}
import type { LibraryExerciseRecord } from '@/features/exercise-library/types';

export const LIBRARY_EXERCISES: readonly LibraryExerciseRecord[] = [
${dataLines.join('\n')}
] as const;
`;

  const mediaLines = records.map(
    (record) =>
      `  ${tsString(record.datasetId)}: {
    gif: require('../assets/exercises/gifs/${record.datasetId}.gif'),
    thumb: require('../assets/exercises/thumbs/${record.datasetId}.jpg'),
  },`
  );

  const mediaFile = `${header}
import type { ImageSourcePropType } from 'react-native';

export interface LibraryExerciseMedia {
  gif: ImageSourcePropType;
  thumb: ImageSourcePropType;
}

export const LIBRARY_EXERCISE_MEDIA: Record<string, LibraryExerciseMedia> = {
${mediaLines.join('\n')}
};
`;

  fs.writeFileSync(path.join(ROOT, 'data', 'exerciseLibrary.generated.ts'), dataFile);
  fs.writeFileSync(path.join(ROOT, 'data', 'exerciseLibraryMedia.generated.ts'), mediaFile);

  const counts = {};
  for (const record of records) {
    counts[record.bodyPart] = (counts[record.bodyPart] ?? 0) + 1;
  }
  console.log(`✔ Generated ${records.length} library exercises`);
  console.log(`  media: ${(mediaBytes / 1024 / 1024).toFixed(1)} MB in assets/exercises/`);
  for (const [bodyPart, count] of Object.entries(counts).sort()) {
    console.log(`  ${bodyPart}: ${count}`);
  }
  const positions = records.reduce((acc, record) => {
    acc[record.position] = (acc[record.position] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    `  positions — desk: ${positions.desk ?? 0}, standing: ${positions.standing ?? 0}, floor: ${positions.floor ?? 0}`
  );
}

main();
