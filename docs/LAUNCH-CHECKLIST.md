# 🚀 MicroBreaks Yayın Kontrol Listesi

Kodun tamamı hazır. Bu doküman, **senin manuel yapman gereken her şeyi** sırasıyla listeler.
Her adımı bitirdikçe işaretle. Doğrulama komutu her aşamada yol gösterir:

```bash
npm run verify:config -- --profile production   # eksik kalan her şeyi isimlendirir
npm run verify:release                          # tam sürüm kapısı (typecheck+lint+testler)
```

---

## 1. Hesaplar

- [ ] **Apple Developer Program** üyeliği (99$/yıl) — Team ID'yi not al
- [ ] **Google Play Console** hesabı (25$ tek seferlik)
- [ ] **Firebase** projesi (Blaze planı — Functions için gerekli)
- [ ] **RevenueCat** hesabı (ücretsiz başlar)
- [ ] **Expo / EAS** hesabı (`owner: cankanbur` app.json'da tanımlı)

---

## 2. Firebase Kurulumu

Proje oluşturduktan sonra **iki uygulama** ekle (bundle id'ler app.json ile birebir aynı olmalı):

| Platform | Kimlik |
|---|---|
| iOS | `com.cankanbur.MicroBreaks` |
| Android | `com.cankanbur.MicroBreaks` |

- [ ] iOS config indir → repo köküne **`./GoogleService-Info.plist`**
- [ ] Android config indir → repo köküne **`./google-services.json`**
  - *(İkisi de .gitignore'da — commit edilmez. app.config.js dosyaları otomatik algılar.)*
- [ ] **Authentication → Anonymous** sağlayıcısını aç
- [ ] **Firestore** oluştur → kuralları ve indexleri deploy et:
  ```bash
  npx firebase-tools deploy --only firestore:rules,firestore:indexes
  ```
- [ ] **Cloud Functions** deploy et:
  ```bash
  npx firebase-tools deploy --only functions
  ```
- [ ] **Cloud Messaging (FCM)**: iOS için APNs Auth Key (.p8) yükle
  (Apple Developer → Keys → APNs key oluştur → Firebase → Project Settings → Cloud Messaging)
- [ ] **App Check**: iOS'ta DeviceCheck/App Attest, Android'de Play Integrity etkinleştir
  - Debug build'lerde test için: `.env` → `EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN`
- [ ] **Crashlytics** ve **Analytics**'i konsoldan etkinleştir

---

## 3. RevenueCat Kurulumu

### 3a. Mağaza ürünleri (önce App Store Connect + Play Console'da oluştur)

Kod bu **offer id'lerini** bekliyor (`constants/subscription.ts`):

| Offer ID | Süre | Deneme | Önerilen fiyat* |
|---|---|---|---|
| `solo_annual` | Yıllık | 7 gün | $29.99 |
| `solo_monthly` | Aylık | — | $3.99 |
| `pro_annual` | Yıllık | 7 gün | $49.99 |
| `pro_monthly` | Aylık | — | $5.99 |
| `family_annual` | Yıllık | 7 gün | $79.99 |
| `family_monthly` | Aylık | — | $9.99 |

*Fiyatlar `DEFAULT_SUBSCRIPTION_OFFERS` içinde tanımlı; mağazada farklı belirlersen RevenueCat gerçek fiyatı gönderir, kod otomatik uyum sağlar.*

- [ ] App Store Connect → Subscriptions: 6 ürünü oluştur (bir Subscription Group içinde)
- [ ] Play Console → Monetize → Subscriptions: aynı 6 ürünü oluştur

### 3b. RevenueCat panosu

- [ ] Proje oluştur → iOS + Android app ekle (aynı bundle id'ler)
- [ ] **Entitlements** oluştur — kod şu kimlikleri okur:
  - `solo`, `pro`, `family` *(tier bazlı)*
  - `pro` aynı zamanda legacy kimlik — mevcut aboneler için korunuyor
- [ ] Her ürünü ilgili entitlement'a bağla (solo_* → solo, pro_* → pro, family_* → family)
- [ ] **Offerings**: default offering'e 6 paketi ekle; `pro_annual`'ı "recommended" işaretle
- [ ] **API Keys** → Public SDK keys → `.env`'e yaz:
  ```
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxx
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxx
  ```
- [ ] App Store Connect **Shared Secret** + Play **service credentials**'ı RevenueCat'e ekle

---

## 4. EAS (Expo Application Services)

- [ ] Giriş + proje bağla:
  ```bash
  npx eas-cli login
  npx eas-cli init          # projectId üretir
  ```
- [ ] Üretilen id'yi `.env`'e yaz: `EAS_PROJECT_ID=...`
  *(veya app.json'daki `your-project-id` placeholder'ını kalıcı değiştir)*
- [ ] Production secret'ları EAS'a yükle (build sunucusu .env'i görmez):
  ```bash
  npx eas-cli env:create --scope project --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_xxx --environment production
  npx eas-cli env:create --scope project --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value goog_xxx --environment production
  ```
- [ ] Firebase dosyalarını EAS'a yükle (dosya tipi secret):
  ```bash
  npx eas-cli env:create --scope project --name GOOGLE_SERVICES_PLIST --type file --value ./GoogleService-Info.plist --environment production
  npx eas-cli env:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment production
  ```
- [ ] Submit bilgileri `.env`'e: `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID`
- [ ] Play submit için: Play Console → Service account key → `./google-play-service-account.json`

---

## 5. Apple'a Özgü

- [ ] App Store Connect'te uygulamayı oluştur (`com.cankanbur.MicroBreaks`)
- [ ] **Capabilities** (EAS otomatik ister, onayla): Push Notifications, App Groups (`group.com.cankanbur.MicroBreaks`), Associated Domains, Live Activities
- [ ] **Universal Links**: `landing-page/.well-known/apple-app-site-association` içindeki
  `REPLACE_WITH_APPLE_TEAM_ID` değerini gerçek Team ID ile değiştir →
  `https://microbreaks.app/.well-known/apple-app-site-association` adresinde
  `Content-Type: application/json`, **redirect'siz** servis et
- [ ] Widget target (`targets/widget`) ilk EAS build'de otomatik derlenir — ek işlem yok

## 6. Android'e Özgü

- [ ] Play Console'da uygulamayı oluştur (`com.cankanbur.MicroBreaks`)
- [ ] İlk AAB yüklendikten sonra: Play Console → Setup → App signing → **SHA-256** kopyala →
  `landing-page/.well-known/assetlinks.json` içindeki placeholder'a yaz →
  `https://microbreaks.app/.well-known/assetlinks.json` adresinde yayınla

---

## 7. Mağaza Listeleri

Hazır metinler repo'da — kopyala/yapıştır:

| Dosya | Nereye |
|---|---|
| `metadata/en/app-store.json` | App Store Connect (EN) |
| `metadata/tr/app-store.json` | App Store Connect (TR) |
| `metadata/en/google-play.json` | Play Console (EN) |
| `metadata/tr/google-play.json` | Play Console (TR) |

- [ ] 6 ekran görüntüsü çek (dosya adları metadata'da listeli; `landing-page/aso-preview.html` yardımcı)
- [ ] **Gizlilik etiketleri** (Apple Privacy Nutrition / Play Data Safety):
  - Toplanan: anonim kimlik, kullanım analitiği, çökme verisi — *kimliğe bağlı değil*
  - Toplanmayan: konum, kişiler, sağlık verisi
  - Kaynak: `constants/legal.ts` içindeki Privacy Policy ile birebir uyumlu
- [ ] Privacy Policy + Terms URL'leri: `https://microbreaks.app/privacy` ve `/terms`
  (landing-page'e statik sayfa olarak ekle — içerik `constants/legal.ts`'te hazır)

---

## 8. Build → Test → Yayın

```bash
# 1) Ön kontrol — her şey yerli yerinde mi?
npm run verify:config -- --profile production
npm run verify:release

# 2) Store build'leri
npx eas-cli build --profile production --platform ios
npx eas-cli build --profile production --platform android

# 3) İç test
#    iOS → TestFlight'a otomatik düşer; Android → internal track'e:
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android

# 4) TestFlight/Internal'da SATIN ALMA test et (sandbox hesabıyla):
#    paywall → satın al → restore → free quota → kilit açılışları
```

- [ ] Sandbox satın alma + restore akışı çalışıyor
- [ ] Bildirim izni + hatırlatmalar geliyor; ağrı odaklı hatırlatma dokunuşu ilgili kütüphane bölgesini açıyor
- [ ] Universal link (`https://microbreaks.app/...`) uygulamayı açıyor
- [ ] Hareket Kütüphanesi turu: arama/filtre, kilitli hareket bulanık önizlemesi → paywall, favori, Bugünün Planı
- [ ] Bölge devresi (ücretsiz: Boyun) baştan sona oynuyor; GIF her harekette değişiyor
- [ ] Pro hesapla özel rutin: oluştur → sırala → kaydet → oynat → düzenle → sil
- [ ] TR + EN dillerinde tam tur atıldı

---

## 9. Yayın Sonrası (ilk hafta)

- [ ] Crashlytics'te crash-free oranını izle (hedef ≥ %99.5)
- [ ] RevenueCat → Charts: trial start / conversion / churn
- [ ] `metadata/experiments-config.js` içindeki ASO deneylerini sırayla çalıştır
- [ ] Store yorumlarına 24 saat içinde yanıt ver

## ⚠️ Bilinen ticari not

Hareket Kütüphanesi medyası **© Gym visual** (180×180, atıf gösteriliyor — uygulama içi
3 yerde + Kullanım Koşulları §6). Dataset bu şartlarla yeniden dağıtım izni taşıyor;
yine de ticari yayın öncesi https://gymvisual.com lisans şartlarını bir kez kendin teyit
et, gerekirse doğrudan lisans al. (Riski sıfırlamak istersen: alternatif medya seti ile
`npm run generate:exercises` yeniden çalıştırılabilir — pipeline hazır.)
