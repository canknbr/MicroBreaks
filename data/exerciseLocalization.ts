/**
 * Core Exercise Localization
 *
 * Hand-authored Turkish titles/descriptions for the built-in guided breaks.
 * Step instructions (and therefore voice guidance) intentionally stay
 * English for these — `Exercise.voiceLanguage` remains unset so speech uses
 * en-US, keeping what the user hears consistent with what they read.
 *
 * Movement-library exercises (`lib-*`) never pass through this map: they are
 * fully localized at build time in features/exercise-library/session.ts.
 * Completeness (every ALL_EXERCISES id has an entry) is unit-tested.
 */

import type { Exercise } from './exercises';
import type { LibraryLocale } from '@/features/exercise-library/catalog';

interface LocalizedMeta {
  title: string;
  description: string;
}

export const CORE_EXERCISE_TR: Record<string, LocalizedMeta> = {
  // Quick
  'eye-rest': { title: 'Göz Dinlendirme', description: 'Göz yorgunluğuna karşı 20-20-20 kuralı' },
  'deep-breath': { title: 'Derin Nefes', description: 'Hızlı nefes egzersizi' },
  'neck-roll': { title: 'Boyun Çevirme', description: 'Boyun gerginliğini bırak' },
  'eye-palming': { title: 'Avuçla Göz Dinlendirme', description: 'Yorgun gözler için derin rahatlama' },
  'eye-figure8': { title: '8 Çizen Gözler', description: 'Göz esnekliğini geliştir' },
  'distance-gazing': { title: 'Uzağa Bakış', description: 'Yakın odak yorgunluğunu azalt' },
  'shoulder-shrugs': { title: 'Omuz Silkme', description: 'Omuz gerginliğini bırak' },
  'wrist-circles': { title: 'Bilek Daireleri', description: 'Klavye yorgunluğuna iyi gelir' },
  'jaw-release': { title: 'Çene Gevşetme', description: 'Çenede biriken stresi bırak' },
  'ear-massage': { title: 'Kulak Masajı', description: 'Enerji noktalarını uyar' },
  'hand-stretch': { title: 'El Esnetme', description: 'Fare kullanımına karşı rahatlama' },

  // Stretch
  'upper-body': { title: 'Üst Vücut', description: 'Omuzlar, kollar ve sırt' },
  'lower-body': { title: 'Alt Vücut', description: 'Bacaklar, kalça ve ayak bilekleri' },
  'full-body': { title: 'Tam Vücut', description: 'Eksiksiz esneme rutini' },
  'desk-cat-cow': { title: 'Masada Kedi-İnek', description: 'Otururken omurga esnekliği' },
  'desk-pigeon': { title: 'Masada Güvercin', description: 'Otururken kalça açıcı' },
  'seated-twist': { title: 'Oturarak Dönüş', description: 'Omurga rotasyonu ve rahatlama' },
  'chair-forward-fold': { title: 'Sandalyede Öne Eğilme', description: 'Sırtı ve arka bacakları rahatlat' },
  'hip-flexor-stretch': { title: 'Kalça Fleksörü Esnetme', description: 'Gergin kalça fleksörlerini gevşet' },
  'chest-opener': { title: 'Göğüs Açıcı', description: 'Duruşu düzelt, göğsü aç' },
  'hamstring-stretch': { title: 'Arka Bacak Esnetme', description: 'Gergin arka bacakları gevşet' },
  'spine-twist': { title: 'Omurga Dönüşü', description: 'Omurganı hareketlendir' },

  // Mindful
  meditation: { title: 'Mini Meditasyon', description: 'Zihnini sakinleştir' },
  'body-scan': { title: 'Vücut Taraması', description: 'Fiziksel gerginliği bırak' },
  gratitude: { title: 'Şükran', description: 'Olumlu bir düşünce anı' },
  'box-breathing': { title: 'Kutu Nefesi', description: 'Sakin odak için kutu nefes tekniği' },
  'loving-kindness': { title: 'Sevgi ve Şefkat', description: 'Şefkati ve pozitifliği besle' },
  'focus-meditation': { title: 'Odak Güçlendirme', description: '3 dakikada konsantrasyonu keskinleştir' },
  '5-4-3-2-1-grounding': { title: '5-4-3-2-1 Topraklama', description: 'Duyusal farkındalık tekniği' },
  'positive-affirmation': { title: 'Olumlu Telkin', description: 'Özgüveni ve modu yükselt' },
  'tension-release-scan': { title: 'Gerginlik Taraması', description: 'Vücuttaki gerginliği bul ve bırak' },

  // Active
  walk: { title: 'Kısa Yürüyüş', description: 'Harekete geç ve tazelen' },
  'desk-exercises': { title: 'Masa Başı Egzersizleri', description: 'Masada hafif egzersizler' },
  energizer: { title: 'Enerji Artırıcı', description: 'Enerjini yükselt' },
  'stair-climb': { title: 'Merdiven Tırmanışı', description: 'Merdivenlerle harekete geç' },
  'dancing-break': { title: 'Dans Molası', description: 'Hareket et ve keyfini çıkar' },
  'balance-challenge': { title: 'Denge Mücadelesi', description: 'Odağı ve dengeyi geliştir' },

  // Featured
  'afternoon-reset': {
    title: 'Öğleden Sonra Yenileme',
    description: 'Esneme ve nefesi birleştiren ideal gün ortası molası',
  },
};

const localizedCache = new Map<string, Exercise>();

/**
 * Return the exercise with locale-appropriate title/description. English is
 * the authored source, so it returns the input untouched; `lib-*` exercises
 * arrive pre-localized and also pass through unchanged. Localized copies are
 * cached so repeated calls keep a stable identity for React memoization.
 */
export function localizeExercise(exercise: Exercise, locale: LibraryLocale): Exercise {
  if (locale !== 'tr') return exercise;
  const meta = CORE_EXERCISE_TR[exercise.id];
  if (!meta) return exercise;

  const cached = localizedCache.get(exercise.id);
  if (cached) return cached;

  const localized: Exercise = {
    ...exercise,
    title: meta.title,
    description: meta.description,
  };
  localizedCache.set(exercise.id, localized);
  return localized;
}
