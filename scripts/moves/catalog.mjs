/**
 * Desk-move catalog: names, steps and taxonomy for every drawn move.
 * Poses live in poses.mjs under the same id. Text is original to this project.
 *
 * bodyPart → zone: neck|shoulders → neck · back · chest · lower/upper arms → arms
 *                  waist → core · upper/lower legs → legs · cardio
 * position: desk (in your chair / at your desk) · standing (next to your desk)
 * difficulty: 1 gentle · 2 moderate · 3 challenging
 */

export const CATALOG = [
  // ── Neck & shoulders ─────────────────────────────────────────────────
  {
    id: 'neck-side-tilt', bodyPart: 'neck', target: 'trapezius', secondary: ['levator scapulae'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Seated neck side tilt', tr: 'Oturarak boyun yana eğme' },
    steps: {
      en: ['Sit tall and let your shoulders drop.', 'Tip your right ear toward your right shoulder; rest your right hand on your head without pulling.', 'Breathe slowly for a few breaths, then switch sides.'],
      tr: ['Dik otur, omuzlarını aşağı bırak.', 'Sağ kulağını sağ omzuna doğru eğ; sağ elini çekmeden başının üstüne koy.', 'Birkaç yavaş nefes boyunca kal, sonra taraf değiştir.'],
    },
  },
  {
    id: 'chin-to-chest', bodyPart: 'neck', target: 'trapezius', secondary: ['upper back'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Chin-to-chest stretch', tr: 'Çeneyi göğse indirme' },
    steps: {
      en: ['Sit tall with your hands resting on your knees.', 'Slowly lower your chin toward your chest until you feel the back of your neck lengthen.', 'Hold and breathe, then lift your head back up slowly.'],
      tr: ['Ellerin dizlerinde, dik otur.', 'Ensenin uzadığını hissedene kadar çeneni yavaşça göğsüne indir.', 'Nefes alarak bekle, sonra başını yavaşça kaldır.'],
    },
  },
  {
    id: 'chin-tuck', bodyPart: 'neck', target: 'deep neck flexors', secondary: ['upper back'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'Chin tucks', tr: 'Çene geri çekme' },
    steps: {
      en: ['Sit tall and look straight ahead.', 'Glide your chin straight back, as if making a double chin; keep your eyes level.', 'Hold for two seconds, release, and repeat.'],
      tr: ['Dik otur ve tam karşıya bak.', 'Çeneni düz bir çizgide geriye kaydır, gözlerin aynı hizada kalsın.', 'İki saniye tut, bırak ve tekrarla.'],
    },
  },
  {
    id: 'neck-rotation', bodyPart: 'neck', target: 'sternocleidomastoid', secondary: ['trapezius'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'Look over your shoulder', tr: 'Omuz üstünden bakma' },
    steps: {
      en: ['Sit tall with your hands on your thighs.', 'Turn your head slowly to look over your left shoulder; keep your shoulders still.', 'Come back through center and turn to the right.'],
      tr: ['Ellerin uyluklarında, dik otur.', 'Omuzlarını sabit tutarak başını yavaşça çevir ve sol omzunun üstünden bak.', 'Ortadan geçerek sağa dön.'],
    },
  },
  {
    id: 'shoulder-shrugs', bodyPart: 'shoulders', target: 'trapezius', secondary: ['shoulders'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'Shoulder shrugs', tr: 'Omuz silkme' },
    steps: {
      en: ['Sit tall with your arms relaxed.', 'Lift both shoulders up toward your ears and squeeze for a second.', 'Let them drop completely and repeat.'],
      tr: ['Kolların gevşek, dik otur.', 'İki omzunu kulaklarına doğru kaldır ve bir saniye sık.', 'Tamamen bırak ve tekrarla.'],
    },
  },
  {
    id: 'shoulder-rolls', bodyPart: 'shoulders', target: 'shoulders', secondary: ['trapezius', 'rhomboids'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'Shoulder rolls', tr: 'Omuz çevirme' },
    steps: {
      en: ['Sit tall with your hands on your knees.', 'Roll your shoulders forward, up, back and down in slow, big circles.', 'After a few rounds, reverse the direction.'],
      tr: ['Ellerin dizlerinde, dik otur.', 'Omuzlarını öne, yukarı, geriye ve aşağı doğru yavaş ve geniş çemberlerle çevir.', 'Birkaç turdan sonra yönü değiştir.'],
    },
  },
  {
    id: 'cross-body-shoulder', bodyPart: 'shoulders', target: 'deltoids', secondary: ['upper back'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Cross-body shoulder stretch', tr: 'Kolu göğüs önünden çekme' },
    steps: {
      en: ['Sit tall and bring your right arm straight across your chest.', 'Hold it above the elbow with your left hand and draw it gently closer.', 'Hold, then switch arms.'],
      tr: ['Dik otur, sağ kolunu düz şekilde göğsünün önünden karşıya getir.', 'Sol elinle dirseğin üstünden tut ve hafifçe kendine çek.', 'Bekle, sonra kol değiştir.'],
    },
  },

  // ── Back ─────────────────────────────────────────────────────────────
  {
    id: 'seated-cat-cow', bodyPart: 'back', target: 'spine', secondary: ['lower back', 'upper back'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'Seated cat-cow', tr: 'Oturarak kedi-inek' },
    steps: {
      en: ['Sit near the front of your chair with your hands on your knees.', 'Breathe out and round your back, dropping your chin.', 'Breathe in, lift your chest and gently arch. Flow between the two.'],
      tr: ['Sandalyenin önüne doğru otur, ellerin dizlerinde.', 'Nefes verirken sırtını yuvarla, çeneni indir.', 'Nefes alırken göğsünü kaldır ve hafifçe kavislen. İkisi arasında akıcı geç.'],
    },
  },
  {
    id: 'seated-twist', bodyPart: 'back', target: 'spine', secondary: ['obliques'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Seated spinal twist', tr: 'Oturarak omurga burgusu' },
    steps: {
      en: ['Sit tall with both feet flat on the floor.', 'Breathe in to lengthen, then breathe out and turn your chest to the left; hold the chair back or armrest.', 'Hold for a few breaths, return to center and twist to the right.'],
      tr: ['İki ayağın yerde, dik otur.', 'Nefes alarak uzan, nefes verirken göğsünü sola çevir; sandalyenin arkalığından ya da kolçağından tut.', 'Birkaç nefes bekle, ortaya dön ve sağa burgu yap.'],
    },
  },
  {
    id: 'seated-side-bend', bodyPart: 'back', target: 'lats', secondary: ['obliques'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Seated side bend', tr: 'Oturarak yana eğilme' },
    steps: {
      en: ['Sit tall and reach your right arm up overhead.', 'Lean your upper body to the left, reaching up and over.', 'Hold, come back up, and switch sides.'],
      tr: ['Dik otur ve sağ kolunu başının üstüne uzat.', 'Üst gövdeni sola eğ, yukarı ve karşıya uzan.', 'Bekle, doğrul ve taraf değiştir.'],
    },
  },
  {
    id: 'seated-forward-fold', bodyPart: 'back', target: 'lower back', secondary: ['hamstrings'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Seated forward fold', tr: 'Oturarak öne katlanma' },
    steps: {
      en: ['Push your chair back from the desk and sit with your feet wide.', 'Fold forward over your thighs and let your arms and head hang toward the floor.', 'Breathe into your back, then roll up slowly, head last.'],
      tr: ['Sandalyeni masadan uzaklaştır, ayakların açık otur.', 'Uyluklarının üzerine öne katlan; kollarını ve başını yere doğru sarkıt.', 'Sırtına nefes ver, sonra başın en son gelecek şekilde yavaşça doğrul.'],
    },
  },
  {
    id: 'upper-back-round', bodyPart: 'back', target: 'upper back', secondary: ['rhomboids', 'shoulders'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Upper back reach', tr: 'Üst sırt uzatma' },
    steps: {
      en: ['Sit tall and interlace your fingers in front of you.', 'Push your hands forward and round your upper back, letting your head drop.', 'Feel the space open between your shoulder blades, then sit back up.'],
      tr: ['Dik otur, parmaklarını önünde kenetle.', 'Ellerini ileri it ve üst sırtını yuvarla, başın öne düşsün.', 'Kürek kemiklerinin arasının açıldığını hisset, sonra doğrul.'],
    },
  },
  {
    id: 'scapula-squeeze', bodyPart: 'back', target: 'rhomboids', secondary: ['trapezius'],
    kind: 'strength', position: 'desk', difficulty: 1,
    name: { en: 'Shoulder blade squeeze', tr: 'Kürek kemiği sıkıştırma' },
    steps: {
      en: ['Sit tall and reach both arms forward at chest height.', 'Pull your elbows back past your ribs and squeeze your shoulder blades together.', 'Hold for two seconds, reach forward again, and repeat.'],
      tr: ['Dik otur ve iki kolunu göğüs hizasında öne uzat.', 'Dirseklerini kaburgalarının yanından geriye çek ve kürek kemiklerini birbirine sıkıştır.', 'İki saniye tut, kollarını tekrar öne uzat ve tekrarla.'],
    },
  },
  {
    id: 'desk-dog', bodyPart: 'back', target: 'lats', secondary: ['hamstrings', 'shoulders'],
    kind: 'stretch', position: 'standing', difficulty: 1,
    name: { en: 'Desk downward dog', tr: 'Masada aşağı bakan köpek' },
    steps: {
      en: ['Stand facing your desk and place both hands on its edge.', 'Walk your feet back and hinge at the hips until your back is flat and your head is between your arms.', 'Hold and breathe, then walk back in to stand.'],
      tr: ['Masana dönük dur, iki elini masanın kenarına koy.', 'Ayaklarını geri götür ve sırtın düz, başın kollarının arasında kalacak şekilde kalçadan menteşelen.', 'Nefes alarak bekle, sonra ayaklarını yaklaştırıp doğrul.'],
    },
  },
  {
    id: 'standing-back-bend', bodyPart: 'back', target: 'lower back', secondary: ['hip flexors'],
    kind: 'mobility', position: 'standing', difficulty: 1,
    name: { en: 'Standing back bend', tr: 'Ayakta geriye esneme' },
    steps: {
      en: ['Stand up with your feet hip-width apart.', 'Place your hands on your lower back, fingers pointing down.', 'Lift your chest and lean back gently; keep your neck long. Return to standing.'],
      tr: ['Ayakların kalça genişliğinde, ayağa kalk.', 'Ellerini parmakların aşağı bakacak şekilde belinin arkasına koy.', 'Göğsünü kaldır ve hafifçe geriye esne; boynunu uzun tut. Dik duruşa dön.'],
    },
  },

  // ── Chest ────────────────────────────────────────────────────────────
  {
    id: 'chest-opener', bodyPart: 'chest', target: 'pectorals', secondary: ['shoulders'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Seated chest opener', tr: 'Oturarak göğüs açma' },
    steps: {
      en: ['Sit tall and lace your fingers behind your head.', 'Open your elbows wide and lift your chest.', 'Breathe deeply for a few breaths, then relax.'],
      tr: ['Dik otur, parmaklarını başının arkasında kenetle.', 'Dirseklerini iki yana aç ve göğsünü kaldır.', 'Birkaç derin nefes al, sonra gevşe.'],
    },
  },
  {
    id: 'behind-back-clasp', bodyPart: 'chest', target: 'pectorals', secondary: ['shoulders'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Behind-the-back clasp', tr: 'Arkada el kenetleme' },
    steps: {
      en: ['Scoot to the front edge of your chair.', 'Clasp your hands behind your back and straighten your arms.', 'Lift your chest and draw your hands slightly away from you. Hold, then release.'],
      tr: ['Sandalyenin ön kenarına kay.', 'Ellerini arkanda kenetle ve kollarını düzelt.', 'Göğsünü kaldır, ellerini hafifçe vücudundan uzaklaştır. Bekle, sonra bırak.'],
    },
  },
  {
    id: 'w-to-y-raise', bodyPart: 'chest', target: 'shoulders', secondary: ['pectorals', 'trapezius'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'W-to-Y arm raise', tr: 'W\'den Y\'ye kol kaldırma' },
    steps: {
      en: ['Sit tall with your elbows bent and hands by your shoulders, like a W.', 'Press your arms up and slightly out into a Y.', 'Lower back to the W, squeezing your shoulder blades. Repeat.'],
      tr: ['Dik otur; dirsekler bükülü, ellerin omuz hizasında, W şeklinde.', 'Kollarını yukarı ve hafif dışa iterek Y yap.', 'Kürek kemiklerini sıkarak W\'ye geri in. Tekrarla.'],
    },
  },
  {
    id: 'desk-push-up', bodyPart: 'chest', target: 'pectorals', secondary: ['triceps', 'shoulders'],
    kind: 'strength', position: 'standing', difficulty: 2,
    name: { en: 'Desk push-up', tr: 'Masada şınav' },
    steps: {
      en: ['Make sure your desk is stable. Place your hands on its edge, a little wider than your shoulders.', 'Step back until your body is in a straight line.', 'Bend your elbows to lower your chest toward the desk, then press back up.'],
      tr: ['Masanın sağlam olduğundan emin ol. Ellerini omuz genişliğinden biraz açık şekilde kenarına koy.', 'Vücudun düz bir çizgi olana kadar geri adım at.', 'Dirseklerini bükerek göğsünü masaya yaklaştır, sonra itip geri çık.'],
    },
  },

  // ── Arms & wrists ────────────────────────────────────────────────────
  {
    id: 'wrist-flexor-stretch', bodyPart: 'lower arms', target: 'forearms', secondary: ['wrists', 'hands'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Palm-up wrist stretch', tr: 'Avuç yukarı bilek esnetme' },
    steps: {
      en: ['Reach your right arm forward, palm facing up.', 'With your left hand, gently draw your fingers back and down.', 'Hold, then switch hands.'],
      tr: ['Sağ kolunu avuç içi yukarı bakacak şekilde öne uzat.', 'Sol elinle parmaklarını nazikçe geriye ve aşağı çek.', 'Bekle, sonra el değiştir.'],
    },
  },
  {
    id: 'wrist-extensor-stretch', bodyPart: 'lower arms', target: 'forearms', secondary: ['wrists'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Palm-down wrist stretch', tr: 'Avuç aşağı bilek esnetme' },
    steps: {
      en: ['Reach your right arm forward, palm facing down.', 'Let your hand drop and use your left hand to ease it toward you.', 'Hold, then switch hands.'],
      tr: ['Sağ kolunu avuç içi aşağı bakacak şekilde öne uzat.', 'Elini aşağı bırak ve sol elinle hafifçe kendine doğru it.', 'Bekle, sonra el değiştir.'],
    },
  },
  {
    id: 'wrist-circles', bodyPart: 'lower arms', target: 'wrists', secondary: ['forearms'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'Wrist circles', tr: 'Bilek çevirme' },
    steps: {
      en: ['Hold your forearms out in front of you.', 'Make slow circles with both wrists.', 'After a few circles, switch direction.'],
      tr: ['Ön kollarını önünde tut.', 'İki bileğinle de yavaş çemberler çiz.', 'Birkaç turdan sonra yön değiştir.'],
    },
  },
  {
    id: 'prayer-stretch', bodyPart: 'lower arms', target: 'wrists', secondary: ['forearms'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Prayer stretch', tr: 'Avuç birleştirme esnetmesi' },
    steps: {
      en: ['Press your palms together in front of your chest, elbows out.', 'Keeping the palms together, slowly lower your hands toward your waist.', 'Stop when you feel the stretch in your wrists and hold.'],
      tr: ['Avuçlarını göğsünün önünde birleştir, dirsekler yanlarda.', 'Avuçları ayırmadan ellerini yavaşça beline doğru indir.', 'Bileklerinde esnemeyi hissettiğinde dur ve bekle.'],
    },
  },
  {
    id: 'overhead-triceps', bodyPart: 'upper arms', target: 'triceps', secondary: ['lats', 'shoulders'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Overhead triceps stretch', tr: 'Baş üstü triseps esnetme' },
    steps: {
      en: ['Reach your right arm up, then bend the elbow so your hand drops behind your head.', 'With your left hand, gently press the right elbow back.', 'Hold, then switch arms.'],
      tr: ['Sağ kolunu yukarı uzat, sonra dirseğini bükerek elini başının arkasına indir.', 'Sol elinle sağ dirseğini nazikçe geriye bastır.', 'Bekle, sonra kol değiştir.'],
    },
  },

  // ── Core ─────────────────────────────────────────────────────────────
  {
    id: 'seated-knee-lift', bodyPart: 'waist', target: 'lower abs', secondary: ['hip flexors'],
    kind: 'strength', position: 'desk', difficulty: 1,
    name: { en: 'Seated knee lift', tr: 'Oturarak diz kaldırma' },
    steps: {
      en: ['Sit near the front of your chair and hold its sides.', 'Brace your belly and lift one knee toward your chest.', 'Lower it with control and alternate sides.'],
      tr: ['Sandalyenin önüne doğru otur ve kenarlarından tut.', 'Karnını sık ve bir dizini göğsüne doğru kaldır.', 'Kontrollü indir ve diğer tarafla devam et.'],
    },
  },
  {
    id: 'seated-oblique-crunch', bodyPart: 'waist', target: 'obliques', secondary: ['abs'],
    kind: 'strength', position: 'desk', difficulty: 1,
    name: { en: 'Seated side crunch', tr: 'Oturarak yan mekik' },
    steps: {
      en: ['Sit tall with your hands lightly behind your head.', 'Bring your right elbow down toward your right hip while lifting the knee slightly.', 'Return to tall and alternate sides.'],
      tr: ['Ellerin hafifçe başının arkasında, dik otur.', 'Sağ dizini hafifçe kaldırırken sağ dirseğini sağ kalçana doğru indir.', 'Dik duruşa dön ve taraf değiştir.'],
    },
  },
  {
    id: 'standing-side-reach', bodyPart: 'waist', target: 'obliques', secondary: ['lats'],
    kind: 'stretch', position: 'standing', difficulty: 1,
    name: { en: 'Standing side reach', tr: 'Ayakta yana uzanma' },
    steps: {
      en: ['Stand with your feet hip-width apart.', 'Reach your right arm overhead and lean to the left.', 'Come back up and reach to the other side.'],
      tr: ['Ayakların kalça genişliğinde dur.', 'Sağ kolunu başının üstüne uzat ve sola eğil.', 'Doğrul ve diğer tarafa uzan.'],
    },
  },

  // ── Legs ─────────────────────────────────────────────────────────────
  {
    id: 'chair-squat', bodyPart: 'upper legs', target: 'quadriceps', secondary: ['glutes'],
    kind: 'strength', position: 'standing', difficulty: 1,
    name: { en: 'Sit-to-stand', tr: 'Sandalyeden kalkıp oturma' },
    steps: {
      en: ['Sit near the front of a stable chair (lock the wheels if it has them), feet hip-width apart.', 'Lean forward slightly and stand up without using your hands.', 'Sit back down slowly and with control. Repeat.'],
      tr: ['Sabit bir sandalyenin önüne doğru otur (tekerlekliyse kilitle), ayakların kalça genişliğinde.', 'Hafifçe öne eğil ve ellerini kullanmadan ayağa kalk.', 'Yavaş ve kontrollü şekilde geri otur. Tekrarla.'],
    },
  },
  {
    id: 'calf-raise', bodyPart: 'lower legs', target: 'calves', secondary: ['ankles'],
    kind: 'strength', position: 'standing', difficulty: 1,
    name: { en: 'Calf raise at the desk', tr: 'Masada parmak ucuna yükselme' },
    steps: {
      en: ['Stand next to your desk and rest your hands on it.', 'Rise up onto the balls of your feet.', 'Lower your heels slowly. Repeat.'],
      tr: ['Masanın yanında dur, ellerini masaya koy.', 'Parmak uçlarına yüksel.', 'Topuklarını yavaşça indir. Tekrarla.'],
    },
  },
  {
    id: 'seated-figure-four', bodyPart: 'upper legs', target: 'glutes', secondary: ['hips'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Seated figure-four', tr: 'Oturarak dört figürü' },
    steps: {
      en: ['Sit tall and rest your right ankle on your left knee.', 'Keep your back straight and lean forward slightly until you feel it in your right hip.', 'Hold, then switch legs.'],
      tr: ['Dik otur ve sağ ayak bileğini sol dizinin üstüne koy.', 'Sırtını düz tutarak sağ kalçanda hissedene kadar hafifçe öne eğil.', 'Bekle, sonra bacak değiştir.'],
    },
  },
  {
    id: 'seated-hamstring', bodyPart: 'upper legs', target: 'hamstrings', secondary: ['calves'],
    kind: 'stretch', position: 'desk', difficulty: 1,
    name: { en: 'Seated hamstring stretch', tr: 'Oturarak arka bacak esnetme' },
    steps: {
      en: ['Sit at the front of your chair and straighten your right leg, heel on the floor.', 'Keep your back long and hinge forward from the hips.', 'Hold, then switch legs.'],
      tr: ['Sandalyenin önüne otur, sağ bacağını topuk yerde olacak şekilde düzelt.', 'Sırtını uzun tutarak kalçadan öne menteşelen.', 'Bekle, sonra bacak değiştir.'],
    },
  },
  {
    id: 'standing-quad', bodyPart: 'upper legs', target: 'quadriceps', secondary: ['hip flexors'],
    kind: 'stretch', position: 'standing', difficulty: 1,
    name: { en: 'Standing quad stretch', tr: 'Ayakta ön bacak esnetme' },
    steps: {
      en: ['Stand beside your desk and hold it for balance.', 'Bend your right knee and hold your ankle behind you, knees close together.', 'Hold, then switch legs.'],
      tr: ['Masanın yanında dur ve denge için tutun.', 'Sağ dizini bük ve ayak bileğini arkadan tut, dizlerin yan yana kalsın.', 'Bekle, sonra bacak değiştir.'],
    },
  },
  {
    id: 'hip-flexor-stretch', bodyPart: 'upper legs', target: 'hip flexors', secondary: ['quadriceps'],
    kind: 'stretch', position: 'standing', difficulty: 1,
    name: { en: 'Standing hip flexor stretch', tr: 'Ayakta kalça önü esnetme' },
    steps: {
      en: ['Hold your desk and take a long step back with your left leg.', 'Bend your front knee and tuck your hips under until you feel the front of the back hip open.', 'Hold, then switch legs.'],
      tr: ['Masana tutun ve sol bacağınla uzun bir adım geri at.', 'Ön dizini bük ve arkadaki kalçanın önü açılana kadar leğenini içe çevir.', 'Bekle, sonra bacak değiştir.'],
    },
  },
  {
    id: 'ankle-circles', bodyPart: 'lower legs', target: 'ankles', secondary: ['calves'],
    kind: 'mobility', position: 'desk', difficulty: 1,
    name: { en: 'Ankle circles', tr: 'Ayak bileği çevirme' },
    steps: {
      en: ['Sit tall and lift your right foot slightly off the floor.', 'Draw slow circles with your foot.', 'Switch direction, then switch feet.'],
      tr: ['Dik otur, sağ ayağını yerden hafifçe kaldır.', 'Ayağınla yavaş çemberler çiz.', 'Yön değiştir, sonra ayak değiştir.'],
    },
  },
  {
    id: 'seated-leg-extension', bodyPart: 'upper legs', target: 'quadriceps', secondary: ['hip flexors'],
    kind: 'strength', position: 'desk', difficulty: 1,
    name: { en: 'Seated leg extension', tr: 'Oturarak bacak uzatma' },
    steps: {
      en: ['Sit tall and hold the sides of your chair.', 'Straighten your right leg until it is level and squeeze the front of your thigh.', 'Lower slowly and alternate legs.'],
      tr: ['Dik otur ve sandalyenin kenarlarından tut.', 'Sağ bacağını yere paralel olana kadar düzelt ve ön bacağını sık.', 'Yavaşça indir ve bacak değiştir.'],
    },
  },
  {
    id: 'standing-leg-raise', bodyPart: 'upper legs', target: 'abductors', secondary: ['glutes'],
    kind: 'strength', position: 'standing', difficulty: 1,
    name: { en: 'Standing side leg raise', tr: 'Ayakta yana bacak kaldırma' },
    steps: {
      en: ['Stand tall and hold the back of your chair.', 'Lift your outside leg out to the side, keeping your toes pointing forward.', 'Lower slowly. Repeat, then switch sides.'],
      tr: ['Dik dur ve sandalyenin arkalığından tut.', 'Dıştaki bacağını parmakların öne bakacak şekilde yana kaldır.', 'Yavaşça indir. Tekrarla, sonra taraf değiştir.'],
    },
  },
  {
    id: 'single-leg-balance', bodyPart: 'lower legs', target: 'ankle stabilizers', secondary: ['core', 'glutes'],
    kind: 'mobility', position: 'standing', difficulty: 1,
    name: { en: 'Desk-supported balance', tr: 'Masaya tutunarak denge' },
    steps: {
      en: ['Stand next to your desk and rest one hand on it.', 'Lift your outside knee to hip height and fix your eyes on one point.', 'Hold, lower the foot gently, and switch legs.'],
      tr: ['Masanın yanında dur ve bir elini masaya koy.', 'Dıştaki dizini kalça hizasına kaldır ve gözünü bir noktaya sabitle.', 'Bekle, ayağını yavaşça indir ve bacak değiştir.'],
    },
  },

  // ── Low-impact energizers ────────────────────────────────────────────
  {
    id: 'march-in-place', bodyPart: 'cardio', target: 'cardiovascular system', secondary: ['hip flexors', 'calves'],
    kind: 'cardio', position: 'standing', difficulty: 1,
    name: { en: 'March in place', tr: 'Yerinde yürüyüş' },
    steps: {
      en: ['Stand up next to your desk.', 'March in place, lifting your knees and swinging your arms.', 'Keep a steady pace and breathe.'],
      tr: ['Masanın yanında ayağa kalk.', 'Dizlerini kaldırıp kollarını sallayarak yerinde yürü.', 'Tempoyu sabit tut ve nefes al.'],
    },
  },
  {
    id: 'seated-march', bodyPart: 'cardio', target: 'cardiovascular system', secondary: ['hip flexors'],
    kind: 'cardio', position: 'desk', difficulty: 1,
    name: { en: 'Seated march', tr: 'Oturarak yürüyüş' },
    steps: {
      en: ['Sit near the front of your chair and hold its sides.', 'Lift your knees one at a time, as if marching.', 'Pick up the pace for the last few seconds.'],
      tr: ['Sandalyenin önüne doğru otur ve kenarlarından tut.', 'Yürür gibi dizlerini sırayla kaldır.', 'Son birkaç saniyede tempoyu artır.'],
    },
  },
  {
    id: 'step-jacks', bodyPart: 'cardio', target: 'cardiovascular system', secondary: ['shoulders', 'calves'],
    kind: 'cardio', position: 'standing', difficulty: 1,
    name: { en: 'Step jacks', tr: 'Adımlı jumping jack' },
    steps: {
      en: ['Stand tall with your arms by your sides.', 'Step one foot out to the side while raising both arms overhead.', 'Step back in, lower your arms, and alternate sides. No jumping needed.'],
      tr: ['Kolların yanlarda, dik dur.', 'İki kolunu başının üstüne kaldırırken bir ayağınla yana adım at.', 'Adımını geri al, kollarını indir ve taraf değiştir. Zıplamaya gerek yok.'],
    },
  },
  {
    id: 'cross-body-reach', bodyPart: 'cardio', target: 'cardiovascular system', secondary: ['obliques', 'shoulders'],
    kind: 'cardio', position: 'standing', difficulty: 1,
    name: { en: 'Cross-body reach', tr: 'Çapraz yukarı uzanma' },
    steps: {
      en: ['Stand with your feet hip-width apart.', 'Reach your right arm up and across to the left, turning your chest with it.', 'Return and reach with the other arm. Keep it brisk.'],
      tr: ['Ayakların kalça genişliğinde dur.', 'Sağ kolunu göğsünle birlikte dönerek yukarı ve sola doğru uzat.', 'Geri dön ve diğer kolla uzan. Tempolu devam et.'],
    },
  },
];
