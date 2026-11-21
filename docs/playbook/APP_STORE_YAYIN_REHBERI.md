# iOS uygulamasını App Store'a çıkarma rehberi

Bir iOS uygulamasını sıfırdan "Submit to App Review" düğmesine kadar götüren sıralı
rehber. Expo + EAS ile derlenen, Firebase (Firestore, Auth, Storage, Cloud Functions)
sunuculu, RevenueCat abonelikli uygulamalar için yazıldı; başka yığınlarda da sıra ve
panel işleri aynıdır. Acemi birine anlatır gibi: her adımda ne yaptığın, neden, nereye
tıklayacağın ve bittiğini nasıl anlayacağın.

Bu rehber gerçek bir yayından çıktı (20 Ekim 2026): adımlar, süreler ve "takılırsan"
notları o gün yaşananlardır.

---

## Nasıl çalışılır

1. **Tek adım yap.** Sırayla git; bitmeden sonrakine geçme. Bazı adımlar otomasyonla
   (🤖) koşar, onlarda yalnız onay verirsin.
2. **Defter tut.** Aşağıdaki tabloyu kopyala, her adımı doğrulayınca ⬜ → ✅ yap.
   "Hangi adımdayız?" sorusunun cevabı bu tablodur; sohbet kopsa da buradan devam edilir.
3. **Gizli değerleri sohbete yazma.** Anahtar, şifre, token: panoya kopyala, bir araçla
   dosyaya aldır (`npm run input -- AD` gibi). Yazılırsa anahtarı yenile.
4. **Dışa dönük her otomasyon adımından önce dry-run.** Ne yapacağını gör, sonra koş.
5. **Her adımı küçük bir commit'le kapat.** Gün sonunda bir "devam noktası" notu yaz:
   ne bitti, kimde ne bekliyor, sırada ne var.

Simgeler: 👤 sen · 🤖 otomasyon · ⏱ süre.

### İlerleme defteri (şablon)

| #   | Adım                                                  | Kim | Süre      | Durum |
| --- | ----------------------------------------------------- | --- | --------- | ----- |
| 1   | App Store Connect'te uygulama kaydı                   | 👤  | 5 dk      | ⬜    |
| 2   | Destek e-postası, yasal ad, ülke                      | 👤  | 1 dk      | ⬜    |
| 3   | App ID'yi projeye yaz                                 | 🤖  | 1 dk      | ⬜    |
| 4   | Gizlilik/koşullar/destek sitesi yayında               | 🤖  | 5 dk      | ⬜    |
| 5   | Apple anahtarı (Sign in with Apple + push)            | 👤  | 10 dk     | ⬜    |
| 6   | Firebase projesi + Blaze + bütçe + CLI girişi         | 👤  | 15 dk     | ⬜    |
| 7   | RevenueCat projesi + iki anahtar                      | 👤  | 10 dk     | ⬜    |
| 8   | E-posta gönderen hesap (Gmail uygulama şifresi)       | 👤  | 5 dk      | ⬜    |
| 9   | Dry-run + 5 karar                                     | 🤖  | 5 dk      | ⬜    |
| 10  | Sunucu kurulumu (Firebase)                            | 🤖  | 10–30 dk  | ⬜    |
| 11  | Abonelikler ve ürünler (App Store Connect)            | 🤖  | 10 dk     | ⬜    |
| 12  | Mağaza sayfası (metin, görsel, video)                 | 🤖  | 20 dk–2 s | ⬜    |
| 13  | RevenueCat kurulumu                                   | 🤖  | 3 dk      | ⬜    |
| 14  | EAS ortam değişkenleri + push anahtarı                | 🤖  | 3 dk      | ⬜    |
| 15  | Canlı doğrulama                                       | 🤖  | 5 dk      | ⬜    |
| 16  | App Privacy anketi                                    | 👤  | 20 dk     | ⬜    |
| 17  | RevenueCat: Apple bildirimleri + Sandbox "Anybody"    | 👤  | 5 dk      | ⬜    |
| 18  | Sandbox test hesabı                                   | 👤  | 3 dk      | ⬜    |
| 19  | App Store Connect kontrolleri                         | 👤  | 10 dk     | ⬜    |
| 20  | Build + App Store Connect'e yükleme                   | 🤖  | 30–60 dk  | ⬜    |
| 21  | TestFlight: grup, testçi, Beta App Review             | 🤖  | 5 dk      | ⬜    |
| 22  | Gerçek iPhone'da cihaz turu                           | 👤  | ~2 saat   | ⬜    |
| 23  | (Önerilir) Reviewer için demo hesap                   | 👤  | 15 dk     | ⬜    |
| 24  | Gönderi kontrolü (sürüm + build + ürünler)            | 🤖  | 5 dk      | ⬜    |
| 25  | Submit to App Review (web sitesinden)                 | 👤  | 10 dk     | ⬜    |
| 26  | İnceleme boyunca ve onaydan sonra                     | 👤  | 1–2 gün   | ⬜    |

**Gerçek süreler (bir yayından):** elle yapılan iş toplam ~2,5 saat; Firebase kurulumu
3 koşuda ~25 dk; mağaza sayfası 20 dil + 200 ekran görüntüsü + 20 video ile 2 saat 13
dk; EAS build 9 dk; EAS'ın Apple'a yükleme kuyruğu 25 dk; Apple'ın build işlemesi 3 dk;
Beta App Review birkaç saat–1 gün; App Review genelde 24–48 saat.

---

## Ön koşullar (bir kez)

- **Apple Developer** hesabı (yıllık ücretli) ve **App Store Connect** erişimi.
- **Bundle ID** kayıtlı; yetenekler açık: Push Notifications, Sign in with Apple, In-App
  Purchase. İmzalama sertifikası ve App Store profili.
- **App Store Connect API anahtarı** (Users and Access → Integrations → Team Keys, rol
  Admin) ve **In-App Purchase anahtarı** (aynı yer → In-App Purchase). `.p8` dosyaları bir
  kez indirilir.
- **EAS projesi** (expo.dev) ve Expo erişim token'ı; **Sentry** projesi ve token'ı
  (isteğe bağlı ama önerilir).
- Yasal sayfalar için bir yer: GitHub Pages yeter.
- Mağaza malzemesi: uygulama ikonu, 6,7"/6,5"/5,5" ekran görüntüleri, isteğe bağlı
  önizleme videoları, 20 dile kadar metinler. Keyword alanı **100 bayt** (karakter
  değil); Japonca/Korece/Çince'de karakter başına 3 bayt.

---

## Kısım A — Apple'da kayıt ve herkese açık bilgiler

### 1. App Store Connect'te uygulama kaydı 👤 ⏱ 5 dk

appstoreconnect.apple.com → **Apps** → **+** → **New App**: Platform iOS; Name (mağaza
adı; alınmışsa yedeklerin hazır olsun); Primary Language; Bundle ID; SKU (iç etiket);
User Access Full. → Create.

**Bitti mi?** Uygulamanın sayfası açılır; URL'deki sayı **App ID**'dir (ör.
`apps/6824885189`). Bu kayıt komutla açılamaz; elle açılır.

### 2. Üç açık bilgi 👤 ⏱ 1 dk

Destek e-postası (gerçekten okuduğun), yasal ad (Developer hesabındaki ad ya da şirket),
ülke (koşulların hukuku). Üçü de kullanıcıya görünür; uydurma yazma.

### 3. App ID'yi projeye yaz 🤖

`eas.json` submit profillerine `ascAppId` + API anahtarı (gözetimsiz `eas submit` için)
ve uygulamadaki "Puan ver" / paylaşım linkleri için `https://apps.apple.com/app/id<ID>`.

### 4. Yasal site 🤖 ⏱ 5 dk

Gizlilik politikası, kullanım koşulları, destek, davet ve (varsa) `/get` yönlendirme
sayfalarını GitHub Pages'e koy. **Doğrulama:** her sayfaya `curl` → 200. Apple canlı bir
gizlilik politikası linki ister (kural 5.1.1); 404 en kolay red sebebi.

> **Dikkat:** Yasal bilgiler koda girince, "bu alanlar boş" varsayan testler düşer.
> Test fikstürü gerçek dosyanın kopyasında bu alanları boşaltsın; yayın günü CI'ı
> kırmayın.

---

## Kısım B — Anahtarlar ve hesaplar (birer birer)

### 5. Apple anahtarı: Sign in with Apple + APNs 👤 ⏱ 10 dk

developer.apple.com → Certificates, IDs & Profiles → **Keys** → +. Ad: yalnız harf,
rakam ve boşluk (**tire geçersiz**; `Pet Moments` olur, `pet-moments` olmaz). İki kutuyu
birlikte işaretle: **APNs** (Configure → Sandbox & Production, Team Scoped) ve **Sign in
with Apple** (Configure → Primary App ID). Continue → Register → **Download** (bir kez).

Aynı dosya iki işe yarar: hesap silinince Apple oturumunu iptal etmek (App Review ister)
ve sunucu push'u. Sınırlar: Sign in with Apple için primary App ID başına 2 anahtar; APNs
için takım başına 2 anahtar.

**Bitti mi?** `AuthKey_XXXXXXXXXX.p8` Downloads'ta; Key ID dosya adındadır. Keys
listesinde satırda iki servis simgesi ve "Sandbox & Production" görünür.

### 6. Firebase projesi 👤 ⏱ 15 dk

1. console.firebase.google.com → Create a project → ad; **Google Analytics kapalı**
   (gerekmiyorsa); Gemini kapalı.
2. **Blaze**'e geç (sol alt Upgrade). Blaze = kullandıkça öde; ücretsiz kotalar Blaze'de
   de geçerli (Firestore günde 50k okuma / 20k yazma, Storage 5 GB, Functions ayda 2M
   çağrı). Cloud Functions ve Cloud Storage Spark'ta açılmıyor, o yüzden şart. Gerçek
   maliyet yeni bir uygulamada ayda kuruşlar (fonksiyon imajları, 6'dan fazla secret).
3. Faturalandırma hesabı: varsa seç. **Yarım kalmış hesap** ("ödeme profili" eksik)
   görürsen tamamlamak yeni açmaktan temizdir. Kart doğrulaması için geçici blokaj
   (Türkiye'de 800 TL) bir hafta içinde kalkar.
4. **Bütçe uyarısı** kur (Firebase yükseltme akışı sorar; sormazsa Cloud Billing →
   Budgets). 250–500 TL / $10 gibi; e-posta atar, harcamayı durdurmaz. Paylaşılan hesapta
   bütçeyi projeye kapsamla.
5. ⚠️ Konsolda **Firestore ve Storage'ı açma**: bölge sonradan değişmez, kurulum onları
   istediğin bölgede açar. **Authentication → Get started** ise serbest ve gerekli:
   bölgesi yok, yalnız giriş ayarlarının kabını oluşturur (kurulum bunu ister).
6. CLI girişi: `npx firebase-tools@<sürüm> login`. Komut bir araçtan (TTY'siz) koşarsa
   tarayıcı açamaz; verdiği linki aç, kodu al, `firebase login <kod>` ile tamamla.
   `gcloud auth login` için Terminal.app kullan.

**Bitti mi?** `firebase projects:list` projeyi gösterir; proje kimliğini
(`<ad>-xxxxx`) kuruluma sabitle (ad benzeyen başka proje seçilmesin).

### 7. RevenueCat 👤 ⏱ 10 dk

app.revenuecat.com → Create new project → ad; kategori/platform yalnız bilgi.
**Uygulamayı ekleme**, kurulum Bundle ID'den bulur/ekler. Project settings → API keys:

- **V2** secret: yalnız "Project configuration: Read & write" (kurulum için).
- **V1** secret: sunucu abonelik durumunu okumak için.

**Kural:** anahtarlar panodan dosyaya; sohbete yapıştırılırsa kurulum bitince yenile
(yeni V2 üret, eskisini sil). V1'i V2 alanına yazmak en sık hata.

### 8. E-posta gönderen hesap 👤 ⏱ 5 dk

E-postayla kayıt/giriş kodu gönderen uygulamalarda şart; reviewer kodu alamazsa 2.1'den
red. Gmail: 2 adımlı doğrulama açık → myaccount.google.com/apppasswords → 16 harfli
şifre. Uygulama şifresi yalnız mail göndermeye yarar, iptal edilebilir. Gmail günde ~500
mail; büyüyünce Resend/Postmark iki girdi değişikliğidir. Hiç e-posta girişi yoksa bu
adım yok.

---

## Kısım C — Sunucu ve mağaza (otomasyon; her biri önce dry-run)

### 9. Dry-run + 5 karar 🤖

Dry-run "eksik girdi yok" demeli. Onaylanacak kararlar:

1. **Fiyatlar** (ABD temel + ülke istisnaları, ör. TL).
2. **Satış ülkeleri** (Çin anakarası ICP ister; genelde hariç).
3. **Yayın zamanı:** `MANUAL` (onaydan sonra "Release This Version"a sen basarsın) ya da
   `AFTER_APPROVAL` (hemen yayın).
4. **Yaş derecesi** cevapları (sonuç 4+ hedef).
5. **AdServices** (Apple Search Ads atfı) açık mı.

Deneme süresi için Apple'ın seçenekleri: 3 gün, 1/2 hafta, 1/2/3/6 ay, 1 yıl. Tek bir
sabitten türetin (metinler, inceleme notu, paywall) ki değiştirmek bir satır olsun.

### 10. Sunucu kurulumu (Firebase) 🤖 ⏱ 10–30 dk

API'ler → Firestore ve Storage (bölge!) → giriş yöntemleri (anonim, e-posta, Apple) →
iOS/web uygulama kaydı → IAM → secret'lar → kurallar/indeksler/fonksiyonlar → yapılandırma
belgesi → TTL.

**Yeni projede üç bilinen takılma, hepsi "tekrar dene" ile geçer:**

- API'ler açıldıktan sonra Google 1–3 dakika daha "API disabled" (403) der. Bekle ya da
  adımı yeniden koş.
- İlk 2. nesil fonksiyon dağıtımında Eventarc tetikleyicili fonksiyonlar "Permission
  denied while using the Eventarc Service Agent… retry in a few minutes" der. Birkaç
  dakika sonra aynı komut.
- Oluşturulması yarıda kalan bir fonksiyon, sonra başarıyla oluşsa bile **herkese açık
  çağrı izni** (`allUsers` → Cloud Run Invoker) eksik kalabilir; belirtisi: oturumsuz
  isteğe 403, oturumlu isteğe 401. Yeniden dağıtım bu izni **yazmaz**; Cloud Run →
  servis → Security → "Allow public access" (ya da `setIamPolicy`) ile bir kez ver.

**Bitti mi?** `firebase functions:list` tüm fonksiyonları gösterir; dry-run "değişiklik
yok" der.

### 11. Abonelikler ve ürünler 🤖 ⏱ 10 dk

Abonelik grubu, aylık/yıllık abonelik, ömür boyu ürün; fiyatlar (temel ülke + istisna,
diğerleri Apple eşitler); yıllıkta deneme teklifi her satış ülkesine; dillerde ad ve
açıklama; inceleme ekran görüntüsü (alfasız JPEG). Durum "Missing Metadata" görünse de
kurulum eksiksizse sorun değil; ilk ürünler sürümle **aynı gönderide** incelenir.

### 12. Mağaza sayfası 🤖 ⏱ 20 dk – 2 saat

Dillerde ad/altyazı/açıklama/keyword/promo; her storefront'a kendi ekran görüntüleri;
önizleme videosu (storefront başına yükleme + Apple işleme, en yavaş kısım); satış
ülkeleri; yaş derecesi; telif; inceleme notu ve iletişim; öne çıkan satın alma; featuring
taslağı (gönderilmez).

**Notlar:** videoların poster kareleri Apple işlemeyi bitirmeden yazılamaz ("Asset not in
complete state"); adım bitince bir kez daha koş. App Store Connect API'sinde
nominations `filter[state]` tek değer alır (virgüllü liste 400). Metin kuralı ihlali
(fiyat, rakip adı, "ücretsiz" iddiası) tek bir dilde bile tüm gönderimi reddettirir;
yüklemeden önce denetle.

**Yeni "Header and Search Results" görselleri (isteğe bağlı):** tek evrensel dosya
**5244×2950 PNG, alfasız**, iki yere birden; ya da header 3840×1646 (21:9), search
3840×2560 / 1920×1280 (3:2). Header videosu 3840×1646, 5–30 sn, 30/60 fps, sessiz olur.
Metin yoksa bir dosya tüm dillere; önemli her şey ortadaki %60×%70'te. Fiyat, URL, ©,
ödül, Apple rozeti yok. Panelden yüklenir (sürüm sayfası → Header and Search Results);
API yolu ayrı bir inceleme gönderimi ister, ilk sürümde uzak dur.

### 13. RevenueCat kurulumu 🤖 ⏱ 3 dk

App Store uygulaması (Bundle ID, ASC API anahtarıyla), ürünler, entitlement (`premium`),
offering (`default`: `$rc_monthly`, `$rc_annual`, `$rc_lifetime`), sunucuya webhook,
uygulamaya public SDK anahtarı.

### 14. EAS 🤖 ⏱ 3 dk

Firebase/RevenueCat/Sentry değişkenleri üç ortama; **APNs anahtarı EAS'a** (yerel imza
kullanıyorsan EAS push anahtarı üretmez, sen vermezsen push çalışmaz).

### 15. Canlı doğrulama 🤖 ⏱ 5 dk

Sayfalar 200; Firebase kuralları (başkasının verisi okunamıyor, kullanıcı kendine Premium
yazamıyor, ücretsiz planda ikinci kayıt reddediliyor); fonksiyonlar oturumsuz isteği
reddediyor ve oturumluyu işliyor; imzalı linkler; webhook; RevenueCat offering; client
değişkenlerinde sunucu anahtarı yok. Burada düşen her şey gönderimden önce düzeltilir.

---

## Kısım D — Yalnız panelden

### 16. App Privacy anketi 👤 ⏱ 20 dk

App Store Connect → uygulama → **App Privacy** → Get Started → "Yes, we collect".
Yalnız topladığın türleri işaretle (örnek set: Email, Name · Photos/Videos, Other User
Content · User ID, Device ID · Purchase History · Advertising Data · Crash, Performance,
Other Diagnostic). Her türde üç soru: amaç (çoğu **App Functionality**; Purchase History
**+ Analytics**; Advertising Data yalnız **Analytics**), "linked to identity" **Yes**,
"tracking" **No** (reklam SDK'sı yoksa). En sonda **Publish**; yayınlanmayan anket
gönderimi bloklar. Anket sürüme değil uygulamaya aittir.

### 17. RevenueCat: iki tık 👤 ⏱ 5 dk

- App Store uygulaması → **Apple Server to Server notification settings** → **Apply in App
  Store Connect** (iptal/iade/yenileme bildirimleri).
- Project settings → **Sandbox testing access: Anybody** (varsayılan; değilse reviewer'ın
  test satın alımı Premium'u açmaz → 2.1 red).
- Kurulum anahtarını yenile (madde 7).

### 18. Sandbox test hesabı 👤 ⏱ 3 dk

Users and Access → **Sandbox** → Test Accounts → +; gerçek Apple kimliğin olmayan bir
adres (`adın+sb1@gmail.com` olur), ülke fiyatları göreceğin ülke.

**Ne işe yarar:** TestFlight'ta satın alma testçinin kendi Apple kimliğiyle yapılır. Apple'a
göre bu satın almalar yalnız beta testinde ücretsizdir ve App Store sürümüne geçmez, yani
telefon başkasınınsa da onun kimliğini kirletmez. Abonelikler orada süreleri ne olursa olsun
günde bir yenilenir, en çok 6 kez. Sandbox hesabının farkı **tekrar**: deneme hakkı ve "zaten
satın alındı" durumu **Clear Purchase History** ile sıfırlanır, yenileme hızı ayarlanır.
TestFlight'ta kullanmak için telefonda önce Medya ve Satın Alımlar'dan çıkılır, sonra
Geliştirici ayarlarından sandbox hesabına girilir. Xcode'dan kurulan build'ler de onu
kullanır. Bir hesap yeter; ürün başına temiz deneme istersen üç.

### 19. App Store Connect kontrolleri 👤 ⏱ 10 dk

- **Business → Agreements → Paid Apps: Active** (banka + vergi formları; onayı günler
  sürebilir, erken başla). Aktif değilse sandbox'ta bile satın alma olmaz.
- App Information → **Age Rating** sonucu (4+ ve bölgesel karşılıkları).
- **Pricing and Availability:** ücretsiz, ülke sayısı; **Apple Silicon Mac** ve **Vision
  Pro** kutularını ilk sürümde kaldır (Mac'te denenmemiş uygulama = ek inceleme riski).
- **Regulated Medical Device** beyanı (Health & Fitness / Medical kategorisinde sorulur):
  kayıt defteri uygulamasında **No**.
- Header/Search görselleri (madde 12) panelden.
- (İsteğe bağlı) App Accessibility.

---

## Kısım E — Build ve gerçek telefon

### 20. Build + yükleme 🤖 ⏱ 30–60 dk

`eas build --platform ios --profile production --auto-submit --no-wait`. İlk dakikada
"release kapısı" (eksik değer varsa adıyla durur). İzleme: `eas build:list` (not:
`build:view` `--non-interactive` almaz). Build bitince **EAS Submit** kuyruğu (ücretsiz
planda 15–60 dk); durum `eas submission` ile. Çok uzarsa IPA'yı indirip `xcrun altool
--upload-app` ile yükle. Apple'da "Processing" 3–30 dk; ikon da bu build'den gelir
(App Store Connect'te gri yer tutucu normaldir).

Yükleme e-postasında **ITMS-90683** (microphone purpose string) gelirse `app.json`'a
dürüst bir mikrofon metni ekleyip yeni build al; expo-camera ses API'lerine referans
verdiği için tarayıcı ister.

### 21. TestFlight 🤖 ⏱ 5 dk

Test bilgisi, "What to Test", grup, Beta App Review gönderimi, testçi daveti.

- **Dahili testçi:** ASC takım üyesi (Users and Access → +, rol Marketing yeter); build
  işlenir işlenmez kurar, inceleme yok. Karşılığı: ASC'de görünür.
- **Harici testçi:** yalnız e-posta; ilk build **Beta App Review**'dan geçer (birkaç
  saat–1 gün); Apple onaylayınca daveti kendisi yollar.

Telefonda: TestFlight uygulaması → davet linki → Install. Satın almalar testçinin kendi Apple
kimliğiyle ücretsiz yapılır; sandbox hesabı gerekirse madde 18'deki yoldan girilir.

### 22. Cihaz turu 👤 ⏱ ~2 saat

Satın alma, push, Sign in with Apple, derin bağlantılar ve çevrimdışı kuyruk yalnız
gerçek telefonda kanıtlanır. Liste:

- Temiz kurulum: açılış, onboarding, hesapsız ilk kayıt.
- Kamera ve bildirim izni reddedilince uygulama kullanılabilir kalıyor.
- Paywall: planlar, yerel para birimi, deneme yazısı yalnız uygunluk varsa, Terms/Privacy
  linkleri, **Restore Purchases**.
- Satın alma (TestFlight'ta ücretsiz) → Premium hemen açılıyor.
- Sil → kur → Restore → hâlâ Premium.
- Sign in with Apple (Hide My Email ile de); hesap silme; sonra yeniden kayıt.
- E-posta kodu geliyor (spam'e bak).
- Hatırlatma bildirimi geliyor.
- Uçak modunda kayıt → bağlanınca senkron.
- Cihaz dili değişince metinler o dilde.
- Çökme raporu (Sentry) sembolize görünüyor.

Düşen madde gönderimden önce düzeltilir: kod → CI → yeni build → tekrar.

### 23. Demo hesap 👤 ⏱ 15 dk (önerilir)

Uygulama hesapsız çalışsa bile Premium'lu bir hesap hazırla: e-postayla kayıt, RevenueCat
→ Customers → promotional entitlement (`premium`, Lifetime). Bilgileri App Review
Information'a yaz ("Sign-in required"). Reviewer "test edemedik" demesin.

---

## Kısım F — Gönderim

### 24. Gönderi kontrolü 🤖 ⏱ 5 dk

Sürüm adı, build bağlama, ürünlerin "Ready to Submit" olması, fiyat/deneme, ekran
görüntüleri, App Privacy, inceleme notu ve iletişim. Dry-run temizse web'e geç.

### 25. Submit 👤 ⏱ 10 dk

İlk sürüm ve ilk satın alımlar yalnız **web sitesinde, aynı gönderide**: sürüm 1.0 →
"In-App Purchases and Subscriptions" → + → üç ürün → Done; Build seçili; **Add for
Review**; gönderide sürüm + üç ürün → **Submit to App Review**. Export Compliance
sorusu `app.json`'daki şifreleme beyanıyla gelmez. Durum "Waiting for Review".

### 26. İnceleme boyunca ve sonrası

Firebase, RevenueCat ve yasal site açık kalsın; build'i değiştirme (gönderi iptal olur);
Resolution Center'a hızlı cevap. Red gelirse mesajı aynen al: çoğu red bir bilgi isteğidir,
cevap + ekran görüntüsü yeter. Onay: `MANUAL` ise "Pending Developer Release" → **Release
This Version**. Sonra: App Store Tags, özel ürün sayfaları, etkinlik, ikon testi, featuring
önerisi, yorumlara cevap, 60. günde fiyat/keyword gözden geçirme.

---

## Yapma listesi — en pahalı hatalar

- Firebase konsolunda Firestore ya da Storage açma (bölge kilitlenir).
- Apple anahtar adında tire; `.p8`'i e-postaya/buluta/sohbete atma (bir kez indirilir).
- RevenueCat V1'i V2 alanına yazma; sandbox erişimini "Anybody"den çıkarma.
- Anahtar/şifreyi sohbete yapıştırma; yapıştırdıysan yenile.
- App Privacy'yi "Publish" etmeden bırakma.
- IAP'leri sürüme eklemeden Submit'e basma.
- İnceleme sürerken build değiştirme; Firebase/RevenueCat/siteyi kapatma.
- Native paket ekleyince uygulama sürümünü artırmadan OTA güncelleme (runtime version).

## Kısa hata kartları

| Belirti                                      | Bakılacak yer                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| "API has not been used… or it is disabled"   | Yeni açıldı; 1–3 dk bekle, tekrar koş                                         |
| Eventarc "Permission denied… Service Agent"  | İlk 2. nesil dağıtım; birkaç dakika sonra tekrar                              |
| Fonksiyon oturumsuza 403, oturumluya 401     | Cloud Run Invoker izni eksik; servise `allUsers` → Cloud Run Invoker ver       |
| Poster karesi "Asset not in complete state"  | Video işleniyor; adımı sonra tekrar koş                                       |
| nominations filter 400                       | `filter[state]` tek değer                                                     |
| Kod e-postası gelmiyor                       | Spam; uygulama şifresi; fonksiyon logları                                     |
| Paywall'da fiyat yok                         | Paid Apps Active mi; ürün durumları; offering Current mı                      |
| Satın aldım, sunucu free diyor               | Webhook ve V1 anahtarı; senkron fonksiyonu logları                            |
| Push gelmiyor                                | Bildirim izni; APNs anahtarı EAS'ta mı                                        |
| Build ilk dakikada düşüyor                   | Release kapısı eksik değeri söyler; EAS ortam değişkenleri                    |
| EAS Submit saatlerce kuyrukta                | IPA'yı indir, `xcrun altool --upload-app`                                     |
| App Store Connect'te ikon yok                | İlk build işlenince gelir                                                     |
| `firebase login` tarayıcı açmıyor            | TTY yok; linki aç, kodu al, `firebase login <kod>`                            |
