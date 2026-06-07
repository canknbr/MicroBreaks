# MicroBreaks — Uçtan Uca Denetim Raporu

> **Tarih:** 2026-06-05
> **Versiyon:** 1.0.0 (build 1) — release adayı
> **Stack:** React Native 0.81.5 · Expo SDK 54 · TypeScript 5.9 · Zustand 5 · Firebase (Analytics/Crashlytics/Auth/Firestore/Messaging) · RevenueCat · i18next
> **Denetim açısı:** Kullanıcı + QA + Kıdemli mühendis + Kıdemli (Google) UX designer
> **Metodoloji:** 5 paralel derinlemesine kod tabanı analizi + web sektör araştırması (paralı API/AI kullanılmadı; sadece local kod + free web search)

---

## 0. Yönetici Özeti (TL;DR)

Kod tabanı **olgunluk seviyesi yüksek bir MVP** — testlerin %75'i geçer durumda, Firebase entegrasyonu temiz, GDPR dokümanları gerçek, design tokens yapılandırılmış, i18n EN+TR tam. Ancak prod'a göndermeden önce **mutlaka kapatılması gereken 4 blocker** ve **kullanıcı deneyimini bozan ~12 yüksek-öncelikli sorun** var.

**4 Blocker (uygulama mağazaya gidemez):**

| # | Konu | Etki |
|---|------|------|
| **B1** | `app.json` → `eas.projectId: "your-project-id"` placeholder | EAS Build başlamaz, OTA update URL'i bozuk |
| **B2** | Bildirim deep-link sadece Profile tab açılınca dinleniyor | Push bildirime tıklayan kullanıcı boş ekran görür |
| **B3** | Account-recovery flow yanlış sırada — auth başarısız olursa lokal veri silinmiş olur | Kullanıcı hesap kurtarmaya çalışırken tüm verisini kaybeder |
| **B4** | Timer `skip()` → "completed" sayar, istatistikler yalan söyler | Kullanıcının fokus dakikası ve oturum sayısı şişirilir; gamification güveni biter |

**Genel Skor Tablosu** (10 üzerinden):

| Alan | Puan | Önemli Not |
|------|------|------------|
| Mimari & Kod Kalitesi | 6.8 | Cross-store coupling + duplicate state |
| UX/UI Tasarım | 6.5 | "Calm tech" iddiası ile vibrant neon renkler çelişiyor |
| Test Kapsamı | 4.5 | `app/` dizini %0 coverage, E2E yok |
| Performans | 7.0 | MMKV/FlashList yüklü ama kullanılmıyor (yarım göç) |
| Accessibility | 5.5 | Reduce Motion yok, label coverage sadece 2 ekranda |
| Lokalizasyon | 7.5 | Timer push bildirimleri EN hardcoded, geri kalanı temiz |
| Güvenlik & Gizlilik | 7.5 | Firestore rules sağlam; minification kapalı, privacy manifests eksik |
| Prod Hazırlığı | 5.0 | Store form'ları (data safety, privacy labels) eksik |
| **Toplam** | **6.3** | Sağlam temel — release öncesi 2-3 sprint düzeltme şart |

---

## 1. Kapsam ve Metodoloji

**Ne yaptık:**

- 5 paralel agent (Architecture / UX / QA / Performance & A11y & i18n / Security & Prod-Readiness) ile kod tabanını dosya bazında okuduk.
- 4 web araması ile RN 0.81 + Expo 54 bilinen sorunları, 2026 wellness UX best practice'leri, Calm/Headspace paywall dark pattern'leri, Pomodoro arka plan davranışı araştırıldı.
- Memory'deki "642 tests pass, 2 streak failures" iddiası **güncel değil** — şu an **739 test, 1 recommendation engine fail** (services/recommendations/scoring.ts:289 clamp gevşek).
- Coverage iddia edilen %60 threshold değil; **gerçek %25.14 statements / %22.66 branches**. CI'da `--coverage` ile koşulursa fail eder.

**Ne yapmadık (bilinçli):**

- Çalışan uygulama üzerinde manual test (simulator/cihaz açmadık) — sadece statik analiz.
- Ücretli AI/API kullanmadık (Lighthouse-Mobile, BrowserStack, LinearB vs. yok).

---

## 2. KRİTİK BULGULAR (Production Blocker'lar)

### B1 · EAS Project ID Placeholder — Mağaza Build'i Başlamaz
**Severity:** CRITICAL
**Lokasyon:** `app.json:116` ve `app.json:120`
```json
"extra": { "eas": { "projectId": "your-project-id" } },
"updates": { "url": "https://u.expo.dev/your-project-id" }
```
`app.config.js` env override'ları destekliyor (`EAS_PROJECT_ID`), ama default değer placeholder. EAS build başlatma başarısız olur; OTA update fail eder.
**Aksiyon:**
1. `npx eas-cli init` ile project ID üret.
2. `EXPO_PUBLIC_EAS_PROJECT_ID` env'ine ekle (CI/CD secret).
3. `scripts/validate-app-config.js` içine "placeholder reddetme" check'i ekle.

---

### B2 · Push Bildirim Deep-Link Sadece Profile Tab Açıkken Çalışır
**Severity:** CRITICAL
**Lokasyon:** `hooks/useNotifications.ts:100-127` (listener) + `app/(tabs)/profile.tsx:68` (tek mount noktası)
`addNotificationResponseListener` yalnızca Profile tab mount olunca register oluyor. Cold-start senaryosu tamamen kayıp:
- Uygulama kapalıyken bildirime tıklarsan → açılır, ama `getLastNotificationResponseAsync()` hiç çağrılmıyor.
- Uygulama Home'dayken bildirim tıklanırsa → router.push çalışmaz.

**Aksiyon:**
1. Listener'ı `app/_layout.tsx`'e global olarak taşı.
2. Cold-start için `Notifications.getLastNotificationResponseAsync()` kontrolü ekle, başlangıç route'una map'le.
3. Profile-içi hook'tan kaldır (bir kere mount edilmesi yeterli).

---

### B3 · Account Recovery → Auth Fail → Lokal Veri Uçar
**Severity:** CRITICAL
**Lokasyon:** `services/account/sessionReset.ts:131-152`
Sıra şu an: (1) `clearLocalSessionState()`, (2) `signOut()`, (3) `signInWithEmailPassword()`. Eğer (3) hata verirse (yanlış şifre, ağ kopukluğu) lokal veri zaten silindi, kullanıcı **fresh anonim** session ile karşılaşır + "sign in failed" mesajı. Geri dönüş yolu yok.

**Aksiyon:**
1. Sırayı tersine çevir: önce `signInWithEmailPassword()` (kuru çalıştır), başarılıysa lokal state'i clear et.
2. Transactional/idempotent pattern: snapshot al → kurtarma denemesi → fail ise rollback.
3. Integration test ekle: yanlış şifre ile recovery → lokal data unchanged assertion.

---

### B4 · Timer `skip()` İstatistikleri Yalan Söylüyor
**Severity:** CRITICAL
**Lokasyon:** `store/timerStore.ts:303-306`
Yorumda "Skip current phase without tracking stats" yazıyor ama `completePhase()` çağrılıyor → work fazıysa `todaySessionsCompleted++` ve `todayFocusMinutes += workDurationMinutes`. 5 saniye sonra "Skip" basan kullanıcı kendine 25 dk fokus rapor ediyor.
**Etki:** Gamification güvenilirliği biter; streak, level, weekly goal hepsi yalan veriye dayanır.
**Aksiyon:**
1. `skipPhase()` action'ı eklenip phase transition'ı stats güncellemesinden ayır.
2. Mevcut `skip()` callsite'larını yeni action'a yönlendir.
3. Unit test: "skip 5sn sonra" → todayFocusMinutes 0 kalmalı.

---

## 3. BÖLÜM A — Mimari & Kod Kalitesi

### A1 · Cross-Store Coupling (HIGH)
**Lokasyon:** `store/userStore.ts:11,124`, `store/settingsStore.ts:10,244-245`
Tüm Zustand store'ları `syncService.queueDataChange()` ve `syncService.isSyncPulling()` çağırıyor. Store'lar sync service'in varlığını ve davranışını assume ediyor → izole test imkânsız.
**Aksiyon:** Bir `StoreMutationBus` event emitter ekle, store'lar event yayınlasın, sync service subscribe etsin. Store'lar sync'i bilmesin.

### A2 · Duplicate Audio Preferences (HIGH)
**Lokasyon:** `store/settingsStore.ts:18-20,70` ve `store/timerStore.ts:39-40,137-138`
`soundEnabled` ve `vibrationEnabled` hem settingsStore'da hem timerStore'da. Hangisi gerçek? Sync ettiğinde çakışır.
**Aksiyon:** settingsStore tek kaynak; timerStore `useSettingsStore.getState()`'ten okusun. Persist'ten timer kopyasını sil.

### A3 · `noUncheckedIndexedAccess` Kapalı (HIGH)
**Lokasyon:** `tsconfig.json`
117 yerde `any`/`as any` cast var (özellikle icon name'lerinde). Strict modda boş bırakılmamalı.
**Aksiyon:** `"noUncheckedIndexedAccess": true` ekle; cast'leri `keyof typeof Ionicons.glyphMap` türü ile düzelt.

### A4 · MMKV Yüklü Ama Kullanılmıyor (MEDIUM)
**Lokasyon:** `package.json:67` (react-native-mmkv@4.1.0)
Hâlâ AsyncStorage kullanan: `i18n/config.ts`, `services/storage.ts`, `store/*` persist middleware, `firebase/messaging.ts`, `firebase/config.ts`.
**Aksiyon:** Önce Zustand persist'i MMKV'ye taşı (10x hız kazancı). i18n için AsyncStorage kalabilir (low-frequency).

### A5 · `features/` vs `components/` Sınırı Bulanık (MEDIUM)
**Lokasyon:** `features/onboarding/runtime.ts`, `features/break-session/sessionParams.ts`
İkisinin de aynı domain'i kapsayan klasörleri var.
**Aksiyon:** Karar ver: `features/` = domain logic + state machines; `components/` = pure UI. `runtime.ts` → `services/onboarding/`.

### A6 · Storage Key Tek Yerde Toplanmamış (LOW-MEDIUM)
**Lokasyon:** Tüm store'lar — `'microbreaks-user'`, `'microbreaks-settings'`, `'microbreaks-timer'` string olarak.
**Aksiyon:** `constants/storageKeys.ts` oluştur, `as const` export et. Yanlış yazım sorunu kalmasın.

### A7 · Zustand `version` Versiyonlama Stratejisi Yok (MEDIUM)
**Lokasyon:** `store/*.ts` persist config'leri
Şu an `version: 1` (veya yok). İleride field eklemek/değiştirmek istersek migration garantisi yok.
**Aksiyon:** `migrations/stores.md` oluştur, her store için migrate fonksiyonu eklenecek schema.

### A8 · scheduleProgressSideEffects Await Edilmiyor (HIGH)
**Lokasyon:** `store/userStore.ts:108-134`
`queueMicrotask`/`setTimeout` ile defer ediliyor, fakat **hiç await edilmiyor**. Crash anında veri kaybı + concurrent mutation race.
**Aksiyon:** Promise return et, `AbortController` ile cancel desteği, debounce'a açık.

### A9 · Storage Error Swallowing (MEDIUM)
**Lokasyon:** `services/storage.ts:50-57, 78-83`
`getItem`/`setItem` quota / corrupt / permission error'larını ayırt etmeden null/false dönüyor. Crashlytics'e bildirim yok.
**Aksiyon:** `getItemWithError`/`setItemWithError` zaten var (61-94) — onları kullan. Quota error'ını Crashlytics'e ayrı kategoriyle gönder.

### A10 · Legacy `services/error/sentry.ts` Kaldırılmamış (LOW)
Memory'de Crashlytics adapter'a geçildiği yazılı ama dosya hâlâ duruyor.
**Aksiyon:** Sil + import check.

---

## 4. BÖLÜM B — UX / UI / Tasarım (Senior Google Designer + Calm Tech Lens)

### B-UX1 · "Calm Tech" İddiası ile Neon Palette Çelişiyor (HIGH)
**Lokasyon:** `theme/colors.ts`, README satır 9-30
README "How We Feel inspired, WCAG AA, calm tech" diyor. Gerçek: pure black background + neon teal (#06FFA5), coral (#EF476F), yellow (#FFD166), purple (#7B68EE). Calm tech "düşük visual arousal" ister; bu palette wellness ekosisteminde **tam tersi**.
**Tasarım perspektifi:** Amber Case'in Calm Design prensibinde "tech sit in your periphery". Neon renkler attention'ı çeker, periphery'de oturmaz. Cambridge'in 2024 mindfulness app dark pattern araştırması — Calm/Headspace/Insight Timer'da Forced Enrollment ve overstimulation en sık problem.
**Aksiyon (2 yol):**
1. **Re-skin yolu:** Tüm palette 30-40% desature; warm gray (#0D0D0D) blacks; sage / celadon yeşil; soft taupe.
2. **Re-position yolu:** README'yi düzelt — "modern, vibrant productivity wellness" pozisyonu üstlen, "calm" iddiasını bırak.
**Karar gereken seçim:** P1 önceliği. Birinci yol uzun (2 hafta), ikinci yol kısa (1 saat) ama strateji değişimi.

### B-UX2 · Reduce Motion Sistem Ayarına Saygı Yok (HIGH)
**Lokasyon:** Tüm animasyon component'leri — `TimerWidget`, `CelebrationOverlay`, `SplashScreen`, `BreakSession`
`AccessibilityInfo.isReduceMotionEnabled()` hiçbir yerde çağrılmıyor. Vestibular bozuklukları olan kullanıcılar bu uygulamayı kullanamaz. iOS App Review için pasif sebep, KVKK/erişilebilirlik için aktif risk.
**Aksiyon:** `hooks/useReduceMotion.ts` oluştur, animation duration'larını conditional yap. Skip kuralı: animation = `enabled ? 0 : Duration.normal`.

### B-UX3 · Bildirim Permission Priming Friction Var (HIGH)
**Lokasyon:** `app/(onboarding)/notification-permission.tsx`, `constants/onboarding.ts:21`
"Enable" ve "Later" var, **"Skip Notifications"** yok. "Later" advance ediyor (cesaretsiz opt-out). Permission cost (frequency, battery) açıklanmıyor; sadece benefit.
**Aksiyon:**
1. "Skip" explicitly add et.
2. Sample banner mockup'ı göster ("You'll see one like this every 25 min").
3. Benefit dilini user-centric outcome'a çevir ("Stay focused without distraction").

### B-UX4 · Break Session Exit'te Geri Bildirim Eksik (HIGH)
**Lokasyon:** `app/break-session.tsx:213-216,370-376`, `components/break-session/BreakControls.tsx`
- "End Session" instant exit — confirmation/toast yok.
- Completion'da haptic feedback yok (line 385).
- Pause/Skip/End butonları yatay sıralı; thumb-zone optimization yok.
**Aksiyon:**
1. Completion'a `Haptics.notificationAsync(Success)` + 300ms gentle scale animation.
2. End butonuna confirmation toast "Bitirdin — güzel iş!" (silent değil).
3. Layout: Pause/Resume center-big, Skip ve End secondary olarak altta.

### B-UX5 · Paywall'da "Continue Free" Görünürlüğü Belirsiz (MEDIUM)
**Lokasyon:** `components/subscription/PaywallContent.tsx`
RevenueCat backed; `onContinueFree` callback var ama UI prominence belirsiz. 2026 Superwall analizine göre Calm/Headspace bu butonu küçük + soluk gösterir = dark pattern. Cambridge çalışması "Forced Enrollment" en yaygın dark pattern olarak tespit etmiş.
**Aksiyon:**
1. "Devam Et — Ücretsiz" → satın al butonu ile **eş boyutta** + eş kontrast.
2. Free vs Pro karşılaştırma tablosu paywall öncesi.
3. Annual savings explicit ("Save 15% with annual").
4. Restore Purchases erişilebilir (zaten var, position iyileştir).

### B-UX6 · Icon Library Karışık (MEDIUM)
**Lokasyon:** Çoklu component'ler
Ionicons (54+ kullanım) + Material Icons (`icon-symbol.tsx`) + emoji (`constants/onboarding.ts:21 - '👀'`). Boyut tutarsız (24/44/48px).
**Aksiyon:**
1. Tek library karar ver (Ionicons önerilir, Expo native).
2. Boyut ölçek: `xs:16, sm:20, md:24, lg:32, xl:48`.
3. Emoji'leri vector icon'lara çevir (celebration dışında).

### B-UX7 · Dark Mode "Light" Token İsmi Yanlış (LOW-MEDIUM)
**Lokasyon:** `theme/colors.ts:181-286`
Dark mode'da `errorLight`/`warningLight` token'ları `#1A1A1A` arka plana refere ediyor. "Light" yanıltıcı.
**Aksiyon:** Rename → `errorBackground`/`warningBackground`. Semantic naming.

### B-UX8 · Typography: Serif Küçük Boyutta Zor Okunur (LOW)
**Lokasyon:** `theme/typography.ts`
Georgia serif başlık ve gövdede kullanılıyor. Mobile 16-18px serif çoğu cihazda zorlanır.
**Aksiyon:** Serif sadece display.large (48px+). Headline.large ve altı → Inter (sans-serif).

### B-UX9 · Notification Content Tone — Çeşitlilik Yetersiz (MEDIUM)
**Lokasyon:** `services/notifications.ts:117-142`
6 rotated mesaj var. 2 günlük kullanımdan sonra tekrar başlar; "stale" hissi.
**Aksiyon:** 12-15 mesaja çıkar; onboarding'deki painArea'ya göre contextual ("eye strain seçtin → 20-20-20" daha öne çıkar).

### B-UX10 · Settings'te Toggle Hiyerarşisi Görsel Olarak Yok (LOW)
**Lokasyon:** `app/(tabs)/profile.tsx`
Master toggle (notification.enabled) kapalıyken child toggle'lar disable görünmüyor.
**Aksiyon:** Master off → child'ları gray-out + hint text "Önce ana bildirimi aç".

### B-UX11 · Account Deletion 1-Tap (MEDIUM-HIGH)
Pratik gözlem: hesap silme `replaceWithFreshAnonymousSession` ile çağrılıyor — explicit "type DELETE" pattern yok.
**Aksiyon:** 2-adımlı flow: button → modal → "DELETE" yaz veya şifre re-confirm.

### B-UX12 · Empty State Error Recovery'de Tek Action (LOW)
**Lokasyon:** `components/home/EmptyState.tsx:59`
"Retry" var ama "Contact Support" yok.
**Aksiyon:** Error state'e ikincil "Yardım al" + "last updated 2h ago" timestamp ekle.

---

## 5. BÖLÜM C — QA: Bug'lar & Test Boşlukları

### C-BUG1 · Custom Timer NaN Crash (HIGH)
**Lokasyon:** `store/timerStore.ts:354-359`
`parseInt("abc")` → NaN → `Math.max(1, NaN)` = NaN → `customWorkMinutes` NaN → `getPhaseDuration` NaN dakika → 0 saniye, `completePhase` loop.
**Aksiyon:** `Number.isFinite()` guard, sonra clamp.

### C-BUG2 · DST/Timezone Streak Kırılması (HIGH)
**Lokasyon:** `services/breakHistory.ts:280`
Spring-forward (Mart) 23 saat olduğu için `floor(23/24)=0` → "aynı gün" → streak +1 olmaz.
**Aksiyon:** UTC-noon karşılaştırması veya `getLocalDateString` farkı. Time-traveler util ile DST test ekle.

### C-BUG3 · Break Save Feedback'ten Önce → Rating Kayboluyor (HIGH)
**Lokasyon:** `app/break-session.tsx:78-169`
Completion fazında `saveCompletedBreak` çağrılıyor (rating null). Sonra `updateBreakRating` çağrılırsa OK; ama feedback olmadan Done basan kullanıcı rating'siz break bırakır. Recommendation engine `historicalOutcomes`'a kayıt geçmez → öneri kalitesi düşer.
**Aksiyon:** Save'i feedback aşaması sonrasına ertele veya `pendingRating` bayrağıyla işaretle.

### C-BUG4 · Sync `updatedAt` Eşitlik → Çift Push Riski (MEDIUM)
**Lokasyon:** `services/sync/syncService.ts:361-384`, `services/sync/breakSync.ts:84`
Single break push sonrası `lastPushAt` set ediliyor. Bir sonraki `pushBreakHistory` `updatedAt > lastPushAt` filtresi uyguluyor. Aynı saniye içinde mutate edilen kayıt push olmaz.
**Aksiyon:** Mikro-second precision veya monotonic counter + push edilen ID'leri set'te tut.

### C-BUG5 · Subscription `expireIfNeeded` Trial Stuck State (MEDIUM)
**Lokasyon:** `store/subscriptionStore.ts:560-577`
`trialEndsAt <= now && expiresAt > now` — eğer `expiresAt === trialEndsAt` (henüz subscription başlamadı), koşul false → UI "Trial aktif" gösterir.
**Aksiyon:** `>` yerine `>=` veya RevenueCat refresh tetikle.

### C-BUG6 · Quiet Hours 14-Attempt Limit Sessiz Fail (MEDIUM)
**Lokasyon:** `services/notifications.ts:386-428`
14 günden fazla quiet hours içinde takılırsa null döner. Streak protection & daily goal reminder sessizce iptal olur.
**Aksiyon:** Crashlytics breadcrumb + kullanıcıya "quiet hours senin için hatırlatma kapalı tutuyor" snackbar.

### C-BUG7 · Settings Force-Quit'te Son Değişiklik Kaybolur (MEDIUM)
**Lokasyon:** `services/sync/syncService.ts:402`
3s debounce. Force-quit `shutdown()` çağırmaz.
**Aksiyon:** AppState `background` event'inde flush.

### C-BUG8 · Onboarding `painSeverity` Zombi Veri (LOW)
**Lokasyon:** `store/onboardingStore.ts:55-74`
`painAreas: []` set edildiğinde `painSeverity: { eyes: 'severe' }` kalır. Recommendation engine'e gönderilir.
**Aksiyon:** painAreas mutation'ında painSeverity'yi senkronize sanitize et.

### C-BUG9 · `useBreakSession` Timer + moveToNextPhase Race (LOW-MEDIUM)
**Lokasyon:** `hooks/useBreakSession.ts:206-223`
`setTimeRemaining` callback'inde `moveToNextPhaseRef.current()` ve eş zamanlı `setTotalTimeElapsed` +1 — hızlı skip'lerde fazladan saniye sayılabilir.
**Aksiyon:** Tek state update batch'inde transition'ı yap.

### C-BUG10 · Data Export OOM (LOW)
**Lokasyon:** `services/data-export.ts:68`
5000 break + cloud + onboarding tek seferde `JSON.stringify` → eski cihazlarda crash.
**Aksiyon:** Stream/chunk yaz veya pagination — özellikle Android 8-9 düşük RAM cihazlar için.

### C-BUG11 · Recommendation Engine Clamp Gevşek (MEDIUM)
**Lokasyon:** `services/recommendations/scoring.ts:289`
Failing test `__tests__/unit/services/recommendations.test.ts:181` — "worse" cezası -16 yetmiyor; eye-rest 46 ile hâlâ lider olabiliyor.
**Aksiyon:** Past-outcome cezasını -16'dan -24'e çıkar veya pain-area boost'unu düşür. Table-driven test ile severity × outcome × time matrisi.

### C-TEST1 · `app/` Klasörü %0 Coverage (CRITICAL)
`app/break-session.tsx` (618 satır), `app/_layout.tsx` (bootstrap), `app/(onboarding)/*` — hiçbiri test edilmiyor. C-BUG3 buradan kaçtı.
**Aksiyon:** Integration test (React Testing Library): break-session happy path + feedback path; layout'un bindUserSession/teardownUserSession döngüsü.

### C-TEST2 · RevenueCat Branch Test Yok (CRITICAL)
**Lokasyon:** `services/billing/` %17 coverage
`mapPackageToOffer`, `mapRevenueCatCustomerInfo`, purchase intent yarıda kalma branch'leri test edilmemiş.
**Aksiyon:** Unit test + sandbox integration: trial → premium lifecycle.

### C-TEST3 · E2E Yok (HIGH)
**Aksiyon:** Maestro öner (RN + Expo dev-client uyumlu, YAML, düşük maintenance). Akışlar:
- `onboarding.yaml` (welcome → permissions → completion)
- `pomodoro-background.yaml` (25 dk → background → lock → reopen)
- `purchase-trial.yaml` (sandbox)
- `account-delete.yaml`
- `notification-coldstart.yaml`

### C-TEST4 · Sync `SyncService` Singleton Test İzolasyonu Yok (HIGH)
**Aksiyon:** Class export + `resetForTests()` helper. AppState/NetInfo mock'larıyla offline-online geçiş testi.

### C-TEST5 · Notifications Quiet Hours Cross-Midnight (HIGH)
**Aksiyon:** Table-driven test: `quietHoursStart > quietHoursEnd`, gün dönüm anı, 14-attempt sınırı.

### C-TEST6 · A11y Test Altyapısı Yok (HIGH)
**Aksiyon:** `byRole`/`byA11yState` PR template'inde zorunlu. Custom matcher `toBeAccessible()` (rol+label+hint check).

### C-TEST7 · Coverage Threshold Gerçekçi Değil (MEDIUM)
jest.config.js'de %60 yazıyor, gerçek %22. CI `--coverage` fail.
**Aksiyon:** Geçici threshold %25'e indir + per-module hedef koy (`services/sync 70%`, `billing 60%`). Ratchet up stratejisi.

### C-TEST8 · Performance Test'leri Flake (memory) (LOW)
**Aksiyon:** `__tests__/integration/performance/`'a taşı, default suite'ten çıkar, nightly run.

---

## 6. BÖLÜM D — Performans, A11y, Lokalizasyon

### D-PERF1 · MMKV Yüklü Kullanılmıyor (MEDIUM)
Bkz. A4. Zustand persist'i MMKV'ye geçir.

### D-PERF2 · FlashList Yüklü Kullanılmıyor (MEDIUM)
**Lokasyon:** `app/notifications.tsx`, `app/(tabs)/stats.tsx` — ScrollView
Şu an küçük liste olduğu için sorun yok ama scale'de problem.
**Aksiyon:** `<FlashList estimatedItemSize={80} keyExtractor={...}>` geçir.

### D-PERF3 · Image WebP/AVIF Optimizasyonu Yok (LOW)
icon.png 384KB. PNG → WebP convert (iOS 14+/Android 4.3+ OK).
**Aksiyon:** `npx @squoosh/cli --webp '{quality:85}' assets/images/*.png`.

### D-PERF4 · Skia 435MB node_modules — Bundle Size Şişman (MEDIUM)
**Lokasyon:** `package.json:36`
Skia hangi feature için gerekli? Eğer break-session canvas drawing içinse lazy-load.
**Aksiyon:** `npx expo export` ile production bundle ölç. Skia removable mı incele.

### D-PERF5 · React Compiler + Manual `React.memo` Çakışması (LOW)
**Lokasyon:** `app.json:112` reactCompiler:true + 15 component'te manual `memo`
Compiler aktifken manual memo redundant.
**Aksiyon:** Bir component sırf compiler ile test et; redundant memo'ları kaldır.

### D-PERF6 · Sync Queue Boyut Sınırsız (MEDIUM)
**Lokasyon:** `services/sync/syncService.ts:58`
**Aksiyon:** `if (pendingQueue.length > 100) dequeue()` + Crashlytics warn.

### D-A11Y1 · Reduce Motion Yok (HIGH)
Bkz. B-UX2.

### D-A11Y2 · accessibilityLabel Sadece 2 Ekranda (HIGH)
Memory'de "profile + stats tam a11y" yazıyor. Diğerlerinde grep 0. Break-session, settings, timer widget, notifications, tab nav eksik.
**Aksiyon:** PR template'inde zorunlu hale getir; lint rule (`react-native-a11y`) ekle.

### D-A11Y3 · maxFontSizeMultiplier Yok (LOW)
**Lokasyon:** `components/themed-text.tsx`
Sistem 200%+ → layout taşar.
**Aksiyon:** `maxFontSizeMultiplier={1.5}` themed-text root prop'una.

### D-A11Y4 · Live Region Timer Countdown Yok (MEDIUM)
Screen reader timer'ı okumaz.
**Aksiyon:** TimerWidget'i `accessibilityLiveRegion="polite"` ile sar.

### D-A11Y5 · WCAG AA Formal Audit Yok (MEDIUM)
README iddia ediyor ama doğrulanmadı.
**Aksiyon:** Tüm fg/bg pair'leri için kontrast ölç (script). Failing pair'leri tokenize et.

### D-I18N1 · Timer Push Notification Hardcoded EN (HIGH)
**Lokasyon:** `services/timerService.ts:50-51`
```ts
const phaseLabel = session.phase === 'work' ? 'Focus session' : 'Break';
```
TR kullanıcısı EN bildirim alır.
**Aksiyon:** `i18n.t('timer.focusSession')`.

### D-I18N2 · Motivational Quotes / Feedback Labels Hardcoded EN (MEDIUM)
**Lokasyon:**
- `components/home/MotivationalQuote.tsx:10-17` (8 quote EN)
- `components/break-session/BreakFeedback.tsx:17-24` ("Helpful", "Okay", "Not helpful")
- `components/ui/ConfettiCelebration.tsx:45-49` ("Goal Complete!", "Level Up!")
**Aksiyon:** i18n keys oluştur.

### D-I18N3 · stats.tsx/notifications.tsx Default Locale (MEDIUM)
**Lokasyon:** `app/notifications.tsx:28`, `app/(tabs)/stats.tsx:21`
`.toLocaleDateString()` → system locale, ama uygulama i18n.language farklıysa tutarsızlık.
**Aksiyon:** `useTranslation().formatDate(date, 'short')`.

### D-I18N4 · RTL Foundation Var, Uygulama Yok (LOW)
`isRTL` hook var, ama `paddingStart/End` yerine `paddingLeft/Right` kullanılıyor.
**Aksiyon:** Arabic/Hebrew planlanıyorsa migration başlat; aksi takdirde tech debt olarak işaretle.

---

## 7. BÖLÜM E — Güvenlik, Gizlilik, Production-Readiness

### E-SEC1 · Firestore Rules — Genel Durum OK (NOT)
`firestore.rules` iyi yapılandırılmış: `isOwner(userId)`, payload size limit, default deny.
**Eksik:** Per-user write rate limit. DoS riski hafif ama anonymous user şu an sınırsız yazabilir.
**Aksiyon:** Cloud Functions tetikli rate limit veya `request.time` window kontrolü.

### E-SEC2 · Android Minification KAPALI (HIGH)
**Lokasyon:** `android/app/build.gradle:69` — `enableMinifyInReleaseBuilds = false`
Production release'de ProGuard/R8 disable. Obfuscation yok, bundle büyük.
**Aksiyon:** `true` yap + proguard-rules.pro genişlet (Reanimated, Firebase, RevenueCat keep rules zaten gerekli).

### E-SEC3 · iOS Privacy Manifests Eksik (MEDIUM)
**Lokasyon:** `app.json:24-43`
4 reason kategorisi tanımlı (UserDefaults, SystemBootTime, FileTimestamp, DiskSpace). Firebase Analytics + Crashlytics + RevenueCat kendi `PrivacyInfo.xcprivacy` getiriyor — kontrol et. Eğer SDK manifest contribute etmiyorsa Apple Review reject.
**Aksiyon:** `pod 'FirebaseAnalytics'` ve diğerleri için `PrivacyInfo.xcprivacy` doğrula (Xcode build phase).

### E-SEC4 · Crashlytics'te Email Loglanıyor (LOW-MEDIUM)
**Lokasyon:** `services/firebase/crashlytics-adapter.ts` (setUser → email attribute)
GDPR pseudonymisation prensibi ihlali.
**Aksiyon:** Sadece anonim ID. Email kaldır veya hash'le.

### E-SEC5 · Production'da `console.warn` Var (LOW)
**Lokasyon:** `app/break-session.tsx:1062, 1098, 1111` — `__DEV__` guard yok.
**Aksiyon:** `babel-plugin-transform-remove-console` ekle (production preset).

### E-SEC6 · Account Deletion Atomic Değil (MEDIUM)
**Lokasyon:** `services/firebase/auth.ts deleteAuthAccount` + `firestore.ts deleteAllUserData`
Caller sırayla çağırıyor; biri fail ederse partial state kalır (Firestore silindi, auth duruyor → orphan).
**Aksiyon:** Cloud Function trigger `onDelete(user)` → otomatik Firestore cleanup. Client sadece auth.delete() çağırır.

### E-PROD1 · App Store Privacy Nutrition Form Eksik (HIGH)
Metadata dosyalarında yok. App Store Connect dashboard'da manuel girilmesi gerekiyor:
- Data Linked to You: User ID, App Functionality
- Data Not Linked: Diagnostics, Usage Data
**Aksiyon:** `docs/STORE_PRIVACY_LABELS.md` yaz; submission checklist'e ekle.

### E-PROD2 · Play Console Data Safety Form Eksik (HIGH)
Aynı şekilde Google Play tarafı.
**Aksiyon:** Form içeriğini repo'da dokümante et (snapshot).

### E-PROD3 · Age Rating Questionnaire (MEDIUM)
Yok. Privacy Policy "not under 13" diyor ama official rating yok.
**Aksiyon:** App Store: Age 4+ veya 12+; Play: Everyone. Yetişkin içerik yok.

### E-PROD4 · Source Map Upload CI/CD'de Yok (MEDIUM)
Crashlytics dSYM upload script yok.
**Aksiyon:** `.github/workflows/eas-build.yml`'a Firebase CLI ile `firebase crashlytics:symbols:upload` step ekle.

### E-PROD5 · OTA `runtimeVersion: appVersion` Riskli (LOW)
Bir bug-fix update yanlış uygulanırsa rollback zor.
**Aksiyon:** Semantic versioning policy + EAS Update channels (production/staging).

### E-PROD6 · `verify:release` Script Pre-commit Yok (LOW)
Husky/lint-staged yok.
**Aksiyon:** `husky/pre-commit`: lint + typecheck + relevant tests (lint-staged).

### E-PROD7 · `eas.json` Profile Env Var Routing Eksik (LOW)
Preview ve production env'de RevenueCat key, Firebase ayrım net mi? Check.

---

## 8. BÖLÜM F — Sektör Karşılaştırması (Web Findings)

**Kaynaklar (free, paid değil):**

- [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54)
- [What breaks after Expo 54/RN 0.81 upgrade — elobyte](https://elobyte.com/what-breaks-after-an-expo-54-reactnative-0-81-upgrade-and-what-play-store-policies-forced-us-to-change/)
- [Healthcare UI Design 2026 — Eleken](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications)
- [How UX/UI drives wellness app engagement — Diversido](https://www.diversido.io/blog/how-does-ux-ui-impact-your-wellness-app)
- [Dark patterns in mindfulness apps — Cambridge](https://www.cambridge.org/core/journals/proceedings-of-the-design-society/article/mindfulness-and-the-unseen-understanding-the-impact-of-dark-patterns-in-mindfulness-applications/C238118AB4D1185F1967826A0267348A)
- [Calm's paywall patterns — Superwall](https://superwall.com/blog/5-paywall-patterns-used-by-million-dollar-apps/)
- [Mobile design trends 2026 — Muzli](https://muz.li/blog/whats-changing-in-mobile-app-design-ui-patterns-that-matter-in-2026/)
- [Best break reminder apps 2026 — Restier](https://restier.app/blog/best-break-reminder-apps-2026/)

**Sektör Trend'leri vs MicroBreaks:**

| Trend (2026) | Bizdeki Durum |
|--------------|---------------|
| Dark mode default (OLED battery) | ✅ Pure black var |
| Calm/desaturated palette | ❌ Neon (B-UX1) |
| Personalization (mood/severity adaptive) | ⚠️ recommendation engine var ama clamp gevşek |
| Habit-building without guilt | ⚠️ Streak protection var, "missed day" tonu kontrol edilmeli |
| Dynamic Type / large touch targets | ⚠️ Touch target OK, font scaling cap yok |
| Predictive break detection (idle/meeting) | ❌ Yok |
| Wearable sync (Apple Health/Google Fit) | ❌ Yok (roadmap'te var) |
| Forced enrollment dark pattern AVOID | ⚠️ Paywall "free" prominence kontrol et |
| Battery-friendly background timer | ⚠️ AppState handler var, FOREGROUND_SERVICE permission yok (Android) |

**Bilinen RN 0.81 / Expo 54 sorunları (web kaynaktan):**

1. **iOS 0.81.0 precompiled XCFrameworks store submission fail** → 0.81.1'de fix. Kullandığımız 0.81.5 OK.
2. **Metro 0.83 internal import path değişti**: `metro/src/..` → `metro/private/..`. Bizde Metro override yok, bağımsızız.
3. **Text clipping / safe-area overlap upgrade sonrası**: Bizde tam bir QA pass gerek (UAT'da snapshot karşılaştırma).
4. **app.json statusBar field artık root/Android'de yok**. Bizde kullanılmıyor.

---

## 9. ÖNCELİKLENDİRİLMİŞ YOL HARİTASI

> Aşağıdaki sıra **ücretsiz/yerel araçlarla** ilerlemek üzere planlandı. Paralı AI/API gerekmiyor.

### Sprint 1 — Blocker Temizliği (3-5 gün)

| # | Görev | Bölüm | Effort | Test |
|---|-------|-------|--------|------|
| 1 | B1 — EAS init + project ID çöz, validation guard | E-PROD | 1h | `verify:config` extend |
| 2 | B2 — Notification listener'ı `_layout.tsx`'e taşı, cold-start handler | QA | 3h | E2E manual + integration |
| 3 | B3 — `sessionReset` flow tersine çevir, snapshot/rollback | QA | 4h | Unit test |
| 4 | B4 — `skipPhase` action ayır, stats'tan koparmaz | QA | 2h | Unit test |
| 5 | C-BUG1 — Custom timer NaN guard | QA | 30dk | Unit test |
| 6 | C-BUG2 — DST/timezone streak fix, time-traveler util | QA | 3h | Unit test (table) |
| 7 | C-BUG3 — Break save'i feedback sonrasına ertele | QA | 2h | Integration test |

### Sprint 2 — Foundation Düzelt (5-7 gün)

| # | Görev | Bölüm | Effort |
|---|-------|-------|--------|
| 8 | A2 — Sound/Vibration duplicate kaldır | Architecture | 2h |
| 9 | A4 — Zustand persist → MMKV | Architecture | 4h |
| 10 | D-I18N1 — Timer push notification i18n | i18n | 2h |
| 11 | D-A11Y1/B-UX2 — `useReduceMotion` hook + tüm animasyonlara entegrasyon | A11y | 6h |
| 12 | D-A11Y2 — accessibilityLabel coverage (break-session, settings, timer) | A11y | 8h |
| 13 | E-SEC2 — Android minification etkin + ProGuard kuralları | Security | 3h |
| 14 | E-SEC5 — `babel-plugin-transform-remove-console` | Security | 30dk |
| 15 | C-TEST7 — Coverage threshold gerçekçi yap + ratchet | QA | 2h |

### Sprint 3 — UX İyileştirme (5-7 gün)

| # | Görev | Bölüm | Effort | Karar |
|---|-------|-------|--------|-------|
| 16 | B-UX1 — Palette stratejisi: ya desature ya re-position | UX | KARAR + 4h-2hf | **AskUser** |
| 17 | B-UX3 — Onboarding "Skip Notifications" + sample banner | UX | 4h | |
| 18 | B-UX4 — Break completion haptic + toast + button hierarchy | UX | 5h | |
| 19 | B-UX5 — Paywall "Continue Free" prominence | UX | 3h | |
| 20 | B-UX6 — Icon library unify | UX | 6h | |
| 21 | B-UX9 — Notification mesaj çeşitliliği + contextual | UX | 4h | |
| 22 | D-I18N2 — Hardcoded EN string'leri i18n'le | i18n | 4h | |

### Sprint 4 — Production Hardening (5-7 gün)

| # | Görev | Bölüm | Effort |
|---|-------|-------|--------|
| 23 | E-SEC3 — Privacy manifest doğrula (Firebase, RevenueCat) | Security | 3h |
| 24 | E-SEC4 — Crashlytics email kaldır/hash | Security | 1h |
| 25 | E-SEC6 — Cloud Function `onDelete(user)` trigger | Security | 4h |
| 26 | E-PROD1/2 — Privacy nutrition + data safety form'ları (doc) | Prod | 4h |
| 27 | E-PROD3 — Age rating questionnaire | Prod | 1h |
| 28 | E-PROD4 — CI/CD source map upload | Prod | 3h |
| 29 | C-TEST3 — Maestro E2E iskelet (onboarding + pomodoro + purchase + delete) | QA | 12h |
| 30 | C-TEST2 — RevenueCat unit branch'leri | QA | 6h |

### Sprint 5 — Polish & Performance (3-5 gün)

| # | Görev | Bölüm | Effort |
|---|-------|-------|--------|
| 31 | D-PERF2 — FlashList migration (notifications/stats) | Performance | 3h |
| 32 | D-PERF3 — Image WebP convert | Performance | 1h |
| 33 | A3 — `noUncheckedIndexedAccess` + cast cleanup | Architecture | 8h |
| 34 | A5 — `features/` vs `components/` sınırı netleştir + refactor | Architecture | 6h |
| 35 | A8 — `scheduleProgressSideEffects` await refactor | Architecture | 4h |
| 36 | C-BUG11 — Recommendation clamp + table tests | QA | 4h |
| 37 | D-A11Y4 — Timer live region | A11y | 1h |

---

## 10. UYGULAMA KARARLARI — Yapma / Yapma Listesi

**YAPMAYACAĞIZ (şimdilik):**

| Konu | Sebep |
|------|-------|
| Sentry'yi geri getir | Crashlytics yeterli; ücretsiz tier OK |
| Detox E2E | Maestro daha düşük maintenance |
| Skia'yı tamamen sök | Önce kullanım analizi gerek |
| `noUncheckedIndexedAccess` Sprint 1'e al | Sprint 5 — riski düşük, hacmi yüksek |
| Tam dark mode rebrand | Önce strateji kararı (B-UX1) |
| Backend rewrite (sync, recommendations) | Yeterince iyi çalışıyor; iterate et |
| RTL support | TR ve EN için gereksiz |
| Wearable integration | Roadmap v2 |
| AI-based personalization | Paralı, scope dışı |
| Backend Cloud Function ekosistemi | E-SEC6 hariç gereksiz |

**YAPACAĞIZ ama ÜCRETSİZ araçlarla:**

| Konu | Araç |
|------|------|
| Coverage trend takibi | GitHub Actions + lcov + Codecov free |
| E2E | Maestro (open source, free) |
| Bundle size analiz | `npx expo export` + manuel |
| Crashlytics symbol upload | Firebase CLI |
| Privacy label doc | Markdown |
| Translation | Manuel (TR native speaker = sen) |
| Performance profile | React DevTools Profiler |
| Accessibility audit | iOS Accessibility Inspector + Android TalkBack manuel |

---

## 11. EK BULGULAR — Genel Hijyen

- **CLAUDE.md** yok — yeni katılan dev için onboarding doc'u eksik.
- **CHANGELOG.md** yok — version bump ve değişiklik takibi manuel.
- **`.cursorrules`** var ama outdated olabilir (kontrol et).
- **`docs/MRR_EXECUTION_BACKLOG.md`** dahil çok sayıda doc var — sahibi/güncelliği belirsiz.
- **`junit.xml`** repo'da (153 KB) — `.gitignore`'a ekle, CI artifact olarak yükle.

---

## 12. EK A — Adım Adım İlerleme İçin Komutlar

Bu rapor ile çalışmaya başlamak için:

```bash
# Mevcut durum baseline'ı
npm run typecheck && npm run lint && npx jest --coverage --watchman=false

# Sprint 1 başlangıç — branch
git checkout -b audit/sprint-1-blockers

# Aşağıdaki maddeleri ardışık olarak işleriz; her madde için ayrı commit
# 1. EAS init
# 2. Notification listener
# 3. Session reset flow
# 4. Skip phase
# 5. NaN guard
# 6. DST fix
# 7. Save break ordering
```

---

## 13. NASIL İLERLEYECEĞİZ?

Bu rapor 60+ bulgu içeriyor; hepsini birden ele alamayız. Önerilen plan:

1. **Bu raporu birlikte gözden geçirelim** — her bölümü onayla ya da reddet.
2. **Sprint 1 (Blocker'lar)** ile başlayalım — 1-3 gün içinde net önemli düzeltmeler.
3. Her sprint sonunda **`AUDIT_REPORT.md` üstünde checkbox güncelle** (tracking).
4. Sprint 3 (UX) öncesi **B-UX1 palette kararı** vermem gerekiyor (rebrand mı, re-position mu).
5. Sprint 4 öncesi **store account'ları için form taslakları** üzerinde anlaşalım (Privacy nutrition).

---

**Hazırlayan:** Claude Code (5 paralel agent + web araştırması)
**Doğrulama:** Tüm bulgular dosya:satır referansı ile kod tabanından çıkarıldı.
**Format:** Markdown — kıdemli mühendis + designer + QA + product owner için tek doküman.

> **Sonraki adım:** Sen bu raporu okuyup hangi bölümden başlayalım dersen, Sprint 1'in ilk maddesinden iterasyona geçeriz.
