# 0 → 1K $ MRR: Lansman Rehberi ve Claude Prompt Listesi

**Kaynak:** Adapty — *From zero to $1K MRR: A guide to launching a subscription app* (20 sayfa)

> Bu kitap "fikir → MVP → ilk kullanıcılar → ilk ödeme" aşamasını kapsıyor. Ana mesajı: **önce inşa et, sonra doğrula; küçük tut; hızlı öğren; paywall'ı geciktirme.** Sadece bir ürün-pazar uyumu ve ilk 100 ödeyen kullanıcı için tasarlanmış; ölçekleme sonraki kitabın konusu.

---

## Bu rehberi nasıl kullanmalısın

1. **Bölüm 0**'daki bağlam prompt'unu her yeni sohbetin başına yapıştır (ya da Claude Project talimatı yap).
2. `[UYGULAMA]`, `[KATEGORİ]`, `[HEDEF KULLANICI]`, `[PLATFORM]`, `[NİŞ]` alanlarını doldur.
3. Önerilen sıra: **0 → 1 (fikir/doğrulama) → 2 (MVP) → 3 (ASO) → 4 (TikTok/Reddit) → 5 (paywall/fiyat) → 6 (churn/geri bildirim)**.
4. Kitabın ilkesi: her adımda "en az" ne yapılması gerekiyorsa onu iste; Claude'un fazla özellik önermesine izin verme.

---

## 0. Bağlam Prompt'u

```
Sıfırdan bir mobil abonelik uygulaması başlatıyorum ve Adapty'nin "From zero to $1K MRR"
rehberindeki ilkelere göre ilerlemek istiyorum. Bu sohbet boyunca şu bağlamı koru:

- Uygulama fikri: [1-2 cümle]
- Kategori / niş: [KATEGORİ] — [belirli grup, ör. "yeni anneler için antrenman takibi"]
- Platform: [iOS / Android / ikisi] — Framework: [Swift / Kotlin / Flutter / React Native]
- Hedef pazar ve dil: [ör. ABD İngilizce + Türkiye Türkçe]
- Aşama: [fikir / MVP inşa ediliyor / TestFlight'ta / yayında, X kullanıcı]
- Bütçe: [0 / $X/ay] — Ekip: [tek başıma / N kişi]
- Zaman: haftada [X] saat

Rehberin temel ilkeleri (her önerinde bunlara uy):
1. Yeni bir şey icat etmem gerekmiyor; var olan bir talebi daha hızlı/temiz/odaklı çöz.
2. Kalabalık pazar iyi işaret; niş bul (belirli grup, tek ülke/dil lokalizasyonu, hız/fiyat/UX).
3. Doğrulama = gerçek kullanım. Uzun araştırma yerine MVP'yi TestFlight/beta ile paylaş, $20'lık reklam at.
4. MVP: tek akış, tek problem, temel onboarding, "anladılar mı" metriği. Çirkin olsa da yayınla.
5. Analitiği ilk günden ekle: install, ilk eylemler, D1/D3/D7 retention, crash.
6. İlk kullanıcılar için 3 kanal: ASO, kısa video (TikTok/Reels/Shorts), Reddit.
7. Paywall'ı geciktirme; onboarding'in hemen ardından göster. Kullanıcıların %80'i paywall'ı görmüyorsa onboarding bozuk.
8. Ucuza satma. Tek plan ile başla (ör. $4,99/ay veya $29,99/yıl), sonra ikinciyi test et.
9. Churn normal; "neden" sorusuna odaklan; uygulamanın doğal ritmine göre monetize et.
10. Basit tut: ilk gün kayıt butonu bile gerekmeyebilir; karmaşık backend gerekmiyor.

Cevaplarını kısa, uygulanabilir ve "bu hafta yapılacak" formatında ver. Aşırı özellik önerme.
```

---

## 1. Fikir ve Talep Doğrulama

### Kitaptan kritik noktalar
- Mağazayı talep radarı olarak kullan: ASO araçlarıyla yüksek indirme + güçlü monetizasyon olan anahtar kelimeler; popüler ama eskimiş uygulamalar; **2★ ve 3★ yorumlar** (eksik/sinir bozucu olan ne?).
- Niş seçenekleri: belirli grup ("çiftler için bütçe"), tek ülke/dil lokalizasyonu (çoğu uygulama yapmıyor), hız/fiyat/UX iyileştirmesi. Örnek: Cal AI kalori sayımını icat etmedi, daha hızlı yaptı.
- Sınırlı bütçede Android'le başlamak makul (Play daha esnek, organik çekiş kolay).
- Hızlı doğrulama: TestFlight/Play beta, Reddit/Discord'da dürüst geri bildirim, $20'lık TikTok/Instagram reklamı, App Store ön sipariş + kısa video.
- Geri bildirim kanalı açık tut: uygulama içi WhatsApp linki, kritik eylem sonrası mini form, session replay.

### Prompt'lar

**1.1 Rakip ve yorum analizi**
```
[NİŞ] alanında App Store/Google Play'de popüler 5-8 uygulamayı listele. Her biri için:
bilinen zayıf yönler, 2-3 yıldızlı yorumlarda tekrar eden şikayet temaları (tahmini),
fiyat modeli, ve benim "daha hızlı / daha temiz / daha odaklı" yapabileceğim 1 şey.
Sonunda en umut verici 3 niş açısını gerekçesiyle sırala.
```

**1.2 Yorum verisi verirsem**
```
Aşağıda rakip uygulamalardan kopyaladığım [N] adet 2-3 yıldızlı yorum var: [YORUMLAR].
Bunları temalara ayır, her temanın sıklığını say, "kolay çözülür / zor çözülür" olarak etiketle
ve MVP'de çözmem gereken tek bir çekirdek problemi öner.
```

**1.3 Niş daraltma**
```
Fikrim: [FİKİR]. Rehberin üç niş stratejisini (belirli grup, tek ülke/dil, hız-fiyat-UX)
fikrime uygula ve her biri için: hedef kullanıcı tanımı, 10 kelimelik değer önerisi,
App Store'da arayacağı 3 kelime, ve neden rakiplerin bunu yapmadığı. En iyisini seç.
```

**1.4 $20'lık doğrulama testi**
```
[UYGULAMA] için 3 günlük, $20 bütçeli bir TikTok/Instagram doğrulama reklamı tasarla:
hedef kitle, 15 saniyelik video senaryosu (ilk 3 saniye hook), landing/ön sipariş sayfası
metni, ve "devam et / vazgeç" karar eşiği (tıklama, kayıt, ön sipariş sayısı).
```

**1.5 Geri bildirim döngüsü**
```
[UYGULAMA] içine 3 geri bildirim noktası tasarla: WhatsApp/e-posta linki (nereye konur),
[KRİTİK EYLEM] sonrası 1 soruluk form, ve gizlilik uyumlu session replay kurulumu.
[FRAMEWORK] için kod örneği ver; toplanan geri bildirimi haftalık nasıl inceleyeceğimi anlat.
```

---

## 2. MVP: Küçük İnşa Et, Çirkin Yayınla

### Kitaptan kritik noktalar
- MVP nihai ürün değil; tek bir akış + temel onboarding + "anladılar mı" metriği.
- Kullanıcılar ana özelliğe ulaşamıyorsa önce onboarding'e bak; fikir hâlâ sağlam olabilir.
- Analitik ilk günden: install, ilk eylemler ("uygulamayı açtı", "özelliği kullandı"), D1/D3/D7, crash. Firebase / Mixpanel / PostHog — hangisi kolaysa.
- TestFlight, Play beta ya da özel indirme linki; amaç hızlı gerçek geri bildirim.

### Prompt'lar

**2.1 MVP kapsam belirleme**
```
[UYGULAMA] için MVP kapsamını belirle. Kural: tek bir akış, tek bir problem. Bana ver:
- "Olmazsa olmaz" 3-5 ekran ve her birinin amacı
- Bilinçli olarak MVP dışında bırakılacak özellikler listesi (ve neden)
- Kullanıcının "anladım" dediği an = aktivasyon eylemi
- 1 hafta içinde bitirecek şekilde günlük iş planı
```

**2.2 Analitik kurulumu**
```
[FRAMEWORK] ile [Firebase/Mixpanel/PostHog] kullanarak MVP analitiğini kur. Event'ler:
app_open, onboarding_step_N, onboarding_complete, [CORE_ACTION], paywall_view,
trial_start, purchase, crash. D1/D3/D7 retention nasıl hesaplanır, tek bir dashboard'da
ne görmeliyim? Kodu ve kurulum adımlarını yaz.
```

**2.3 Kod: çekirdek akış**
```
[UYGULAMA]'nın çekirdek akışını [FRAMEWORK]'te yaz: [AKIŞ AÇIKLAMASI]. Minimum bağımlılık,
backend yok (yerel depolama yeterli), hata durumları basit. Kod dosya yapısını ve her dosyanın
görevini açıkla. Tasarım için sistem bileşenlerini kullan, özel UI'a zaman harcama.
```

**2.4 Beta dağıtımı**
```
[iOS/Android] için TestFlight / Play beta yayınlama adımlarını checklist olarak ver.
Beta davetiyesine yazacağım mesajı (Reddit/Discord/WhatsApp için ayrı ayrı) ve test
kullanıcılarından soracağım 5 soruyu yaz.
```

---

## 3. ASO: Mağaza Sayfası

### Kitaptan kritik noktalar
- ASO sadece anahtar kelime değil: ikon, ekran görüntüsü, başlık = indirme kararı.
- **Adım 1:** Çekirdek kullanım senaryosunu 10-15 cümlelik ifadeyle yaz (ör. meditasyon → "uyku sesleri", "günlük farkındalık").
- **Adım 2:** Mağaza arama otomatik tamamlamayı kullan (Play daha çok öneri gösterir); AppMagic, SensorTower, Google Trends.
- **Adım 3:** Kategorindeki 5-10 uygulamanın başlık/alt başlık/ekran görüntülerini incele.
- **Adım 4:** Araç varsa hacim + zorluk; yoksa uzun kuyruklu, az rakipli ifadeler. Haftalık gözden geçir.
- **Başlık:** en güçlü kelime, okunabilir; iOS'ta alt başlıkta tekrar etme. Kötü: "Habit Tracker: The Best Habit Tracker App" → İyi: "Build better routines: Habit Tracker". Bazıları kelimeyi önce, markayı sonra koyar.
- **Alt başlık (iOS):** fayda, buzzword değil. **Anahtar kelime alanı (iOS):** 100 karakteri doldur, virgül, tekrar yok, "the/for/app" yok. **Promo metni:** sürüm gerekmeden güncellenir. **Açıklama:** Play indeksler, iOS indekslemez ama okunur; ne yapar / kim için / hangi problemi çözer.
- **İkon:** sade, metin yok, küçükte okunur, A/B test et. **Ekran görüntüleri:** ilk 3 = ne yapar / neden faydalı / ne kazanır; kısa değer odaklı başlık; bazen metinsiz daha iyi. **Video:** 15-30 sn, intro logosu yok.
- **Lokalizasyon:** tek ek dille başla, metadata + ekran görüntüsü tam çeviri.
- Ek listeler: IAP isimlerine anahtar kelime, in-app events, yorumlara cevap, uygulama boyutu, anlamlı "What's New".

### Prompt'lar

**3.1 Anahtar kelime çekirdeği**
```
[UYGULAMA] için ([NİŞ], hedef dil: [DİL]) kullanıcıların mağazada arayacağı 15 çekirdek
ifade üret. Her biri için: arama niyeti (problem / özellik / rakip adı), tahmini rekabet
(yüksek/orta/düşük), uzun kuyruklu varyant. Sonra otomatik tamamlamada kontrol etmem için
5 "tohum" kelime öner.
```

**3.2 Metadata paketi (iOS + Play)**
```
[UYGULAMA] için tam mağaza metadatası hazırla:
- iOS: başlık (≤30 kr, en güçlü kelime önce), alt başlık (≤30 kr, fayda odaklı, başlıkla
  tekrar yok), anahtar kelime alanı (tam 100 kr, virgülle, doldurucu kelime yok, başlık/alt
  başlıkla tekrar yok), promo metni (≤170 kr)
- Play: başlık (≤30 kr), kısa açıklama (≤80 kr), uzun açıklama (anahtar kelimeler doğal
  geçsin; ne yapar / kim için / hangi problemi çözer + madde işaretli özellikler)
Anahtar kelime listem: [LİSTE]. Türkçe ve İngilizce ayrı ver.
```

**3.3 Ekran görüntüsü senaryosu**
```
[UYGULAMA] için 6 ekran görüntüsü senaryosu yaz. İlk 3'ü sırayla: ne yapar / neden faydalı /
ne kazanırsın. Her biri için: gösterilecek ekran, 4-6 kelimelik değer odaklı başlık,
arka plan/düzen notu. Ayrıca metinsiz "temiz" varyant için hangi ekranların uygun olduğunu
belirt (A/B test için).
```

**3.4 Rakip metadata analizi**
```
Şu rakiplerin başlık/alt başlık/açıklamalarını yapıştırıyorum: [METİNLER]. Hangi kelimeleri
vurguluyorlar, hangi vaatleri öne çıkarıyorlar, hangi ifadeler herkeste var (kaçınmalıyım),
hangi boşluk kimsede yok (fırsat)? Benim için farklılaşan bir başlık + alt başlık öner.
```

**3.5 ASO checklist denetimi**
```
Mevcut mağaza sayfam: [BAŞLIK / ALT BAŞLIK / KEYWORDS / AÇIKLAMA / İKON TARİFİ / SS BAŞLIKLARI].
Rehberin ASO checklist'ine göre (başlık, alt başlık, keyword alanı, promo, açıklama, geliştirici
adı, ikon, ekran görüntüleri, video, IAP isimleri, in-app events, yorumlar, boyut, What's New)
puanla: her madde için ✅/⚠️/❌ ve tek cümlelik düzeltme.
```

**3.6 Haftalık ASO rutini**
```
Yayındaki [UYGULAMA] için 30 dakikalık haftalık ASO rutini tasarla: hangi sıralamalara
bakılır, ne zaman anahtar kelime değiştirilir, promo metni ne zaman güncellenir, yorumlara
nasıl cevap verilir. Takip için basit bir tablo şablonu ver.
```

---

## 4. İlk Kullanıcılar: Kısa Video ve Reddit

### Kitaptan kritik noktalar — TikTok/Reels/Shorts
- Hedef kitleyi ilk günden ayarla: TikTok telefon ayarı, SIM, IP, App Store bölgesine bakar. ABD hedefliyorsan SIM'siz telefon + VNP + bölge ayarı + hep VPN ile giriş.
- Nişe yerleş: içerik paylaşmadan önce nişindeki videolarla etkileş (FYP dolana kadar).
- Günde 3-5 video, mükemmellik değil deney. QUITTR ham videolarla viral olup aylar içinde $100K MRR'a ulaştı.
- 3 saniyede hook. Kitabın 10 hook şablonu: "Aslında …'ın daha kolay bir yolu olduğunu biliyor muydun?", "… mı yaşıyorsun? İşte yapabileceklerin", "…'ın en iyi saklanan sırrı", "… dünyasında çılgın şeyler oluyor", "İnsanların … yaptığını görmek içimi acıtıyor", "… yapmayı bırak, işe yaramıyor; bunun yerine …", "… mı? İşte düzeltecek 3 şey", "Duyduğum en iyi tavsiye …", "En iyi [kişi tipi]ler nasıl …", "Çoğu insan …'ın en iyi yolunu bilmiyor".
- İşe yarayanı tekrar paylaş (Coconote.ai aynı 10 sn'lik videoyu farklı altyazılarla defalarca kullandı).
- Ölçeklemeyi sonraya bırak; önce kendin öğren, sonra küçük creator'lar.

### Kitaptan kritik noktalar — Reddit
- Önce oku, sonra yaz (r/productivity, r/selfimprovement, r/SideProject vb.); ton ve upvote alan içerikleri anla.
- Reklam gibi olan silinir. Hikâye anlat: "…yapan basit bir alışkanlık takipçisi yaptım, öğrendiklerim", "Flutter ile yan projemi çıkardım, işe yarayan/yaramayan". Uygulamayı bağlam içinde an.
- Örnek başarılı post yapısı: kişisel neden → ne yaptım → milestone → sınırlı süreli promo kodu → özellik listesi.
- GummySearch ile ilgili thread'leri ve soruları bul.

### Prompt'lar

**4.1 TikTok hesap kurulum ve niş ısıtma**
```
[UYGULAMA] için [HEDEF ÜLKE] hedefli bir TikTok/Reels hesabı kurma planı yaz: bölge
ayarları checklist'i, ilk 3 gün "niş ısıtma" için takip edilecek hashtag/hesap tipleri,
profil biyografisi (link stratejisi dahil) ve ilk hafta içerik takvimi (günde 3 video).
```

**4.2 Hook üretimi**
```
[UYGULAMA] ([HEDEF KULLANICI], çözdüğü problem: [PROBLEM]) için rehberdeki 10 hook şablonunu
doldurarak 30 hook üret ([DİL]). Her hook için 15 saniyelik video akışını 3 satırda yaz:
hook (0-3 sn) → gösterim (3-12 sn) → CTA (12-15 sn). Ham/telefonla çekilebilir olsun.
```

**4.3 Video senaryo paketi**
```
Bu hafta çekeceğim 15 video için senaryo yaz. Karışım: 5 "problem → çözüm", 4 "ekran kaydı +
seslendirme", 3 "kişisel hikâye / neden yaptım", 3 "yanlış bilinen → doğrusu". Her biri için
konuşma metni, ekranda ne görünecek, altyazı ve ilk yorum metni.
```

**4.4 Performans döngüsü**
```
Son 20 videomun izlenme/beğeni/kaydetme/profil tıklama verisi: [VERİ]. Hangi hook tipleri
işe yaradı? Rehberin "işe yarayanı tekrar paylaş" ilkesine göre hangi 3 videoyu farklı
altyazıyla yeniden paylaşmalıyım? Gelecek hafta için içerik dağılımını güncelle.
```

**4.5 Reddit post'u**
```
[UYGULAMA] için r/[SUBREDDIT]'e reklam gibi durmayan bir "yaptım ve öğrendiklerim" post'u
yaz. Yapı: kişisel problem → neden var olan uygulamalar yetmedi → ne yaptım → 2-3 somut
öğrenme → uygulamayı bağlam içinde tek cümleyle an → sınırlı promo (isteğe bağlı).
Subreddit kurallarına uyumlu olsun; 2 farklı başlık seçeneği ver.
```

**4.6 Subreddit keşfi**
```
[NİŞ] için ilgili 8-10 subreddit öner; her biri için: büyüklük tahmini, self-promo toleransı
(düşük/orta/yüksek), orada işe yarayan içerik tipi, ve önce yorum yapacağım 2 soru tipi.
```

---

## 5. Monetizasyon: İlk Paywall ve Fiyat

### Kitaptan kritik noktalar
- Çoğu geliştirici paywall'ı çok geciktirir; "önce güven kazanayım" tuzağı. Erken test et.
- İki basit model: **Freemium** (temel ücretsiz, premium kilitli; utility/günlük araçlar için) veya **Paywall + 3-14 gün trial** (anında değer veren uygulamalar için). Köprü olarak ödüllü video reklam.
- Ucuza satma. Tek plan ile başla (ör. $4,99/ay veya $29,99/yıl). Bölgesel fiyat: gerçek trafik gelince (Hindistan, Meksika vb.) düşük gelirli bölgelerde indir.
- Paywall yeri: onboarding'in hemen ardından. Kullanıcıların <%80'i paywall'ı görüyorsa onboarding bozuk. Sonra test edilecek anlar: çekirdek eylem sonrası, kullanım limiti, premium özellik denemesi.
- İlk paywall'da: başlık (ana fayda), trial süresi, aylık+yıllık plan + tasarruf vurgusu, aksiyon CTA'sı ("Ücretsiz denemeyi başlat"), isteğe bağlı aciliyet.
- Basit tut: ilk gün kayıt butonu gerekmeyebilir, karmaşık backend gerekmez, fiyatı "ölçeklendirmek" gerekmez; tek model, tek mesaj.

### Prompt'lar

**5.1 Model seçimi**
```
[UYGULAMA] için freemium mı, paywall+trial mı? Kriter: değer anında mı hissediliyor,
günlük utility mi, hedef kullanıcı erken taahhüde hazır mı? Karar ver, gerekçele, ve
seçilen model için hangi özelliklerin ücretsiz/premium olacağını listele. Ödüllü reklam
köprüsü mantıklı mı, değerlendir.
```

**5.2 İlk fiyat**
```
[UYGULAMA] için tek bir başlangıç planı öner (aylık mı yıllık mı, kaç $). "Ucuza satma"
ilkesine göre uygulamamın sağladığı zaman/stres/başarı tasarrufunu fiyata çevir. Türkiye
için TL karşılığını App Store fiyat kademeleriyle ver. 30 gün sonra test edeceğim ikinci
plan seçeneğini de belirt.
```

**5.3 İlk paywall metni**
```
[UYGULAMA] için tek ekranlık ilk paywall yaz: başlık (ana fayda, ör. "Sınırsız …'ın kilidini
aç"), 3 fayda maddesi, trial cümlesi, aylık + yıllık plan kartları (yıllık varsayılan, "%X
tasarruf" etiketi), CTA metni, güven mikro-metni ("Bugün ücret alınmaz / İstediğin zaman
iptal"). Türkçe + İngilizce. Apple'ın abonelik metin kurallarına uysun.
```

**5.4 Paywall kodu**
```
[FRAMEWORK] + [Adapty/RevenueCat/StoreKit 2] ile bu paywall'ı kodla: ürünleri çek, plan
seçimi, satın alma, restore, hata mesajları, paywall_view/trial_start/purchase event'leri.
Onboarding'in son adımına bağla. Karmaşık backend yok; entitlement kontrolü SDK üzerinden.
```

**5.5 Paywall görünürlük teşhisi**
```
Analitik verim: install [N], onboarding tamamlama [%], paywall görüntüleme [%], trial start
[%], purchase [%]. Paywall görüntüleme %80'in altındaysa onboarding'in neresi bozuk olabilir?
Her adım için 2 olası neden ve 1 hızlı düzeltme öner.
```

---

## 6. Churn ve Öğrenme Döngüsü

### Kitaptan kritik noktalar
- İptal normal; panik yapma. Sor: farklı bir şey mi bekledi, onboarding kafa mı karıştırdı, değer belirsizleşti mi? İptal anketi ve hızlı geri bildirim butonu.
- Yüksek churn her zaman kötü değil: QR tarayıcı, TV kumandası gibi kısa ömürlü utility'ler hacimle kazanır. Regl takibi, günlük gibi uzun ömürlü uygulamalar yavaş dönüştürür ama yıllarca tutar. **Uygulamanın doğal ritmini anla, monetizasyonu ona göre tasarla.**
- İlk 100 kullanıcı her blog yazısından çok öğretir.

### Prompt'lar

**6.1 İptal anketi**
```
[UYGULAMA] için 1 ekranlık iptal anketi tasarla (3 seçenek + serbest metin): "başka bir şey
bekledim / anlamadım-kafa karışıklığı / artık ihtiyacım yok / pahalı". Her cevap için
tek satırlık karşı mesaj (baskı yapmadan). Verinin nasıl saklanacağını ve haftalık nasıl
okunacağını yaz.
```

**6.2 Doğal ritim analizi**
```
[UYGULAMA] hangi kullanım ritmine sahip: kısa ömürlü utility mi, uzun ömürlü alışkanlık mı,
mevsimsel mi? Buna göre monetizasyon modelini (abonelik süresi, lifetime, reklam, tek seferlik)
ve "sağlıklı churn" beklentimi belirle. Karşılaştırmalı kısa tablo ver.
```

**6.3 İlk 100 kullanıcı retrospektifi**
```
İlk [N] kullanıcımdan topladığım geri bildirim ve analitik: [VERİ]. Rehberin "öğrenmek için
gönder" ilkesiyle: en sık 3 sürpriz kullanım, en büyük 1 düşüş noktası, gelecek 2 hafta için
tek bir değişiklik (ve neden sadece bir tane).
```

---

## 7. Haftalık Çalışma Planı (kitabın özetinden)

| Hafta | Odak | Claude'a soracağın prompt'lar |
|---|---|---|
| 1 | Talep keşfi + niş | 1.1, 1.2, 1.3 |
| 2 | MVP inşa + analitik | 2.1, 2.2, 2.3 |
| 3 | Beta + geri bildirim + ASO taslağı | 2.4, 1.5, 3.1, 3.2, 3.3 |
| 4 | Yayın + paywall | 5.1, 5.2, 5.3, 5.4 |
| 5-8 | Günde 3 video + Reddit + haftalık ASO | 4.1-4.6, 3.6, 5.5 |
| 9+ | Churn öğrenme + iterasyon | 6.1, 6.2, 6.3 |

Kitabın kapanış cümlesi: tek bir acı noktası, tek özellik, tek mesaj. Cilaya takılma; erken gönder, dikkatle dinle, hızlı yinele.
