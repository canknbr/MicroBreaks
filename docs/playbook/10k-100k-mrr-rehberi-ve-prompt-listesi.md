# 10K → 100K $ MRR: Ölçekleme Rehberi ve Claude Prompt Listesi

**Kaynak:** Adapty — *Grow your subscription app from $10K to $100K MRR* (32 sayfa)

> Bu kitap "işe yaradığını kanıtladın, şimdi ölçekle" aşamasını kapsıyor. Ana tezi: **çoğu uygulama ücretli edinme olmadan ~$10K MRR'da tavana vurur; ölçekleme = analitik + tek kanalda ücretli reklam + kreatif hacmi + sistematik test + kontrollü genişleme + doğru finansman.** Her bölümün sonunda kitabın kendi "key takeaways" listesi var; prompt'lar bunlara göre kuruldu.

---

## Bu rehberi nasıl kullanmalısın

1. **Bölüm 0**'daki bağlam prompt'unu her sohbetin başına ekle. Bu aşamada Claude'un **gerçek metriklerini** bilmesi şart; sayılarını gir.
2. Önerilen sıra: **0 → 1 (analitik) → 2 (ilk ücretli kanal) → 3 (kreatif) → 4 (paywall/onboarding testi) → 5 (çok kanal) → 6 (yeni pazar) → 7 (finansman)**. Kitap "bir sorunu çöz, sonra diğerine geç" der; bölüm atlama.
3. Ölçekleme kararlarını her zaman **birim ekonomisi** ile bağla: LTV ≥ 2× CAC, ROAS %200-400, retention sabit.

---

## 0. Bağlam Prompt'u

```
$10K MRR civarında bir mobil abonelik uygulamasını $100K'ya ölçeklemeye çalışıyorum ve
Adapty'nin "From $10K to $100K MRR" rehberindeki çerçeveye göre karar vermek istiyorum.
Bu sohbet boyunca şu bağlamı koru:

- Uygulama: [AD, kategori, 1-2 cümle]
- Platform dağılımı: iOS %[X] / Android %[Y] — Framework: [..]
- MRR: $[X] — aylık büyüme %[X] — mevcut pazarlar: [ülkeler]
- Ödeyen kullanıcı: [N] — plan karışımı: haftalık %[X] / aylık %[X] / yıllık %[X]
- Mevcut metrikler: trial start %[X], trial→paid %[X], D1/D7/D30 retention %[X]/[X]/[X],
  DAU/MAU %[X], 12 ay rLTV $[X], iade %[X]
- Ücretli edinme: [yok / Meta $X/gün / ...] — CPI $[X], CTR %[X], ROAS %[X], CAC $[X]
- Ekip: [N kişi, roller] — aylık pazarlama bütçesi: $[X]
- Araçlar: [Adapty/RevenueCat, MMP (AppsFlyer/Adjust/yok), analitik, BI]

Rehberin temel kuralları (her önerinde bunlara uy):
1. Analitik üç sütun: UA (edinme), monetizasyon, ürün; birbirini besleyen tek döngü.
2. Benchmark'lar: CPI iOS $3-5 / Android $2-3; CTR zayıf <%0,6, iyi ~%0,8-1, mükemmel >%2;
   impression→install %3-4; CAC ABD $30-70; ROAS %200-400 sağlıklı; LTV > 2× CAC;
   iade %4-7 tipik; DAU/MAU %20-30; Day 0 trial dönüşümü %30-50.
3. LTV ücretli edinmenin işleyip işlemeyeceğini belirler. LTV:CAC 1,5-2x iyi.
   Başlangıç kuralı: 12 aylık rLTV ÷ 2 = maksimum CAC.
4. Tek kanalla başla (çoğunlukla Meta). $100-200/gün; <$50/gün öğrenmeyi yavaşlatır.
   ~50 optimizasyon olayı/hafta sonrası stabil. 15+ kreatif varyasyonla başla.
5. Kreatiflerin çoğu başarısız olur; kazananlar 2-4 haftada yorulur. Statikle test et,
   kazananı videoya/UGC'ye yükselt. CTR %20-40 düşerse hemen yenile.
6. Abonelikler onboarding sırasında/hemen sonrasında olur; tek değişkenli A/B test yap.
   Plan süresi ve trial testleri en yüksek CR/LTV artışını verir (%66/%85, %66/%80).
7. Yeni kanal ekleme = mevcut kanal kârlı ve stabilse. Düşen performansı kanal ekleyerek düzeltme.
8. Yeni pazar: her seferinde 1-2 pazar; sadece dönüşüm yolunu lokalize et; $2-5K ile 2-4 hafta
   soft launch; LTV ≥ 2× CAC, trial→paid ana pazarın ±%10'u, D30 retention aynı aralık → 2/3 iyi ise devam.
9. Finansman: ertelenmiş ödeme (nakit akışı), factoring ($20-50K MRR), RBF ($50K+ MRR),
   VC/melek (istisnai büyüme). Yanıltıcı reklam retention'ı öldürür.

Cevaplarını sayılarla, karar eşikleriyle ve "bu hafta / bu ay" aksiyon listesiyle ver.
Emin olmadığın benchmark'ı uydurma; "kategorine göre değişir, kendi verin ölçüt" de.
```

---

## 1. Analitiği Doğru Kurmak

### Kitaptan kritik noktalar
- **UA analitiği:** manuel takip (ad manager + mağaza konsolu) → MMP (kanal atfı) → BI ($100K'ya yaklaşırken Tableau/Looker/warehouse).
- **Monetizasyon analitiği:** MRR, CAC, ARPU/ARPPU, ROAS, LTV, iade. Trial→paid düşük veya ilk ay churn yüksekse paywall/fiyat/trial/lifecycle'a odaklan.
- **Ürün analitiği:** D1/D7/D30, DAU/MAU, oturum derinliği, funnel dönüşümü, özellik benimseme.
- **Birleşik döngü:** ürün → monetizasyon (retention ARPU/LTV'yi şekillendirir), monetizasyon → edinme (yüksek LTV daha yüksek teklif), edinme → monetizasyon (uyumsuz trafik CAC'ı artırır), ürün → edinme (yapışkan ürün organiği artırır, CAC düşer).
- Manuel takip hiç takip etmemekten iyi; basit başla.

### Prompt'lar

**1.1 Analitik olgunluk denetimi**
```
Mevcut analitik kurulumum: [ARAÇLAR ve neyi ölçtüğüm]. Rehberin üç sütununa (UA /
monetizasyon / ürün) göre eksik metriklerimi listele, her eksik için hangi araçla ve
kaç saatte kapatılacağını söyle. $10K→$30K→$100K MRR için üç aşamalı analitik yol haritası
çıkar (manuel → MMP → BI).
```

**1.2 Metrik teşhisi**
```
Metriklerim: [LİSTE]. Rehberin benchmark tablolarıyla kıyasla; her metrik için
"benchmark altı / içinde / üstü" ve rehberin "eğer düşükse" aksiyonunu uyarla.
Sonra birleşik döngüye göre en yukarı akış (root cause) sorunumu tek cümleyle belirle.
```

**1.3 rLTV ve maksimum CAC**
```
Kohort verilerim: [aylık gelir, iade, kullanıcı sayısı]. rLTV = (Gelir − İade) / Kullanıcı
formülüyle 12 aylık rLTV'yi hesapla (Python/SQL kodu ver), plan süresi ve kanal bazında
segmentle, ve "rLTV ÷ 2" kuralıyla kanal başına maksimum CAC'ımı çıkar. Sınırlı verim
varsa tahmini LTV için hangi varsayımları yapmam gerektiğini söyle.
```

**1.4 Haftalık büyüme dashboard'u**
```
Kurucu olarak haftalık bakacağım tek sayfalık dashboard tasarla: 4 UA metriği, 5
monetizasyon metriği, 4 ürün metriği. Her biri için formül, veri kaynağı, uyarı eşiği
(benchmark'a göre) ve eşik aşılınca ilk kontrol edilecek şey. [ARAÇ] ile nasıl kurarım?
```

**1.5 MMP entegrasyonu**
```
[AppsFlyer/Adjust] MMP'yi [FRAMEWORK] uygulamama entegre et: SDK kurulumu, ATT izni,
SKAN dönüşüm değeri şeması (trial_start, purchase, D1/D7 retention için), Adapty/RevenueCat
gelir event'lerinin MMP'ye gönderilmesi. Kod ve doğrulama adımları.
```

---

## 2. İlk Ücretli Kanalı Başlatmak

### Kitaptan kritik noktalar
- Ücretli kanalda iyi çalışan: Health & Fitness, Productivity, Education, abonelikli Entertainment (yüksek LTV, güçlü retention). Zorlanan: utility (dosya yöneticisi, tarayıcı), niş içerik, tek seferlik satın alma, haber/dergi. **LTV belirler.** Uygun değilse LTV artana kadar ASO/organik.
- Küçük bütçede ($500-2.000/ay) tek kanal: yoğun öğrenme, basit atıf (ATT), düşük karmaşıklık. Çoğu uygulama Meta ile başlar.
- Meta açık artırması: teklif × tahmini eylem oranı + kullanıcı değeri. Güçlü kreatif yüksek teklifi yener. ~50 optimizasyon olayı/hafta öğrenme fazı.
- İlk kampanya checklist: Business Suite + SDK/Pixel + ATT; hedef "App Promotion"; $100-200/gün; 15+ kreatif (farklı hook/görsel/CTA, video daha iyi); Advantage+ ya da manuel kitle; 3-5 gün sonra bütçeyi kazananlara kaydır (ör. CTR >%1, CPI <$10).
- Ölçekleme: bütçeyi %20-50 artır; kreatifleri 2-3 haftada yenile; ayrı kampanyalarla hassas hedefleme test et. Kârlı değilse: CTR/CPI/install→trial teşhisi, yeni kreatif, kitle.
- UA verisini her zaman abonelik metrikleriyle bağla; pozitif birim ekonomisi olmadan ölçekleme; yanıltıcı reklam yapma.

### Prompt'lar

**2.1 Ücretli kanala uygunluk**
```
[UYGULAMA] ([KATEGORİ], 12 ay rLTV $[X], retention [X]) ücretli edinme için uygun mu?
Rehberin "iyi çalışan / zorlanan" kategorilerine ve LTV mantığına göre karar ver. Uygunsa
başlangıç bütçesi ve hedef CAC; değilse LTV'yi ücretli edinmeyi karşılayacak seviyeye
getirmek için 3 öncelikli iş.
```

**2.2 İlk Meta kampanya planı**
```
[UYGULAMA] için rehberin checklist'iyle ilk Meta kampanyasını planla: hesap/SDK/ATT kurulum
adımları, kampanya hedefi ve optimizasyon olayı seçimi (install mi trial mi purchase mı,
neden), günlük bütçe, kitle stratejisi (Advantage+ vs manuel), 15 kreatif için brief listesi,
3-5. gün karar kuralları ve 2 haftalık takvim.
```

**2.3 Kampanya teşhisi**
```
5 günlük kampanya verisi: harcama $[X], impression [N], CTR %[X], CPI $[X], install→trial %[X],
trial→paid %[X], ROAS %[X]. Rehberin "kârlı değilse" akışına göre teşhis et: sorun kreatif mi,
kitle mi, mağaza sayfası mı, onboarding mi? Kesme/ölçekleme kararı ve gelecek 5 günün planı.
```

**2.4 Ölçekleme protokolü**
```
Kampanyam kârlı (ROAS %[X], CAC $[X], LTV $[X]). Rehberin kurallarıyla 8 haftalık ölçekleme
protokolü yaz: haftalık bütçe artışı (%20-50), kreatif yenileme takvimi, ayrı test
kampanyaları, ve ölçeklemeyi durduracak kırmızı çizgiler (CAC, ROAS, retention eşikleri).
```

**2.5 Reklam–ürün tutarlılığı**
```
Reklam vaatlerim: [KREATİF METİNLERİ]. Uygulamanın gerçek onboarding ve ilk oturum deneyimi:
[AÇIKLAMA]. Yanıltıcı olabilecek vaatleri işaretle, retention'a olası etkisini açıkla ve
her biri için ürünle uyumlu alternatif vaat yaz.
```

---

## 3. Kreatif Üretimini Ölçeklemek

### Kitaptan kritik noktalar
- Kreatiflerin çoğu başarısız olur; kazananlar bile hızla yorulur. Hacim = ad fatigue'e karşı koruma, ROAS koruması.
- Statik: hızlı/ucuz, konsept testi, tek ekranda anlatılabilen değer. Video/UGC: daha ilgi çekici, akışı gösterir, TikTok'ta zorunlu. **Statikle başla, kazananı videoya yükselt; karusel ara adım; UGC TikTok'ta native durur.**
- Rotasyon: $500+/gün → 7-10 günde bir; $100-200/gün → 2-3 haftada bir. Batch halinde; kazananları küçük değişikliklerle canlı tut. Yorulan kazananı başka pazara taşı (Tier 1 → Tier 2, lokalize ederek). CTR %20-40 düşerse hemen aksiyon.
- Rakip casusluğu: Meta Ad Library, TikTok Top Ads / TikTok Library (Avrupa), Google Ad Transparency Center; ücretli: BigSpy, Tyver, Adheart, Pipiads, Adflex.
- Hipotez tablosu tut: kitle içgörüsü, hook, özellik, format, CTA, sonuç.
- AI ile ölçekleme: hook/açı/CTA üretimi (Claude vb.), Midjourney statik, ElevenLabs/Murf seslendirme, HeyGen/Synthesia avatar, kısa AI video. **AI kreatifler UGC'den düşük CTR verir; keşif için kullan, kazananı gerçek insanla yeniden çek.** CapCut ile düzenle.
- Üretim seviyeleri: L1 solo (<$15K MRR), L2 freelancer/creator ($50-300/video, <$50K), L3 ajans (<$100K), L4 in-house (<$500K), L5 in-house + ajanslar.

### Prompt'lar

**3.1 Kreatif hipotez matrisi**
```
[UYGULAMA] için kreatif hipotez matrisi oluştur: 5 kitle içgörüsü × 6 hook tipi × 4 özellik
× 3 format (statik / karusel / UGC video) × 3 CTA. Bundan ilk batch için en umut verici 15
kombinasyonu seç ve her biri için 2 satırlık brief yaz. Tabloyu takip için şablon olarak ver.
```

**3.2 Statik kreatif metinleri**
```
Seçilen 15 konsept için statik reklam metinleri yaz: başlık (≤40 kr), ana metin (≤125 kr),
CTA, görsel yönergesi (tek ekranda anlaşılır). Rehberin "tek ekranda değer" kuralına uy.
[DİL] için. Sonra her birini Midjourney/görsel üretim prompt'una çevir.
```

**3.3 UGC video senaryosu**
```
Statik testte kazanan konsept: [KONSEPT] (CTR %[X]). Bunu 20-30 saniyelik UGC videoya
yükselt: hook (0-3 sn), problem, uygulama ekranı gösterimi, sonuç, CTA. Creator'a
gönderilecek brief (çekim koşulları, yapmaması gerekenler) ve alternatif 3 hook ver.
```

**3.4 Rakip kreatif analizi**
```
Meta Ad Library / TikTok Top Ads'ten aldığım rakip reklam açıklamaları: [LİSTE]. Ortak
hook kalıpları, vurgulanan vaatler, formatlar ve CTA'ları çıkar. Kimsenin kullanmadığı
2 açı öner. Ödünç alıp uyarlayacağım 5 kreatif brief'i yaz (kopya değil, adaptasyon).
```

**3.5 Rotasyon takvimi**
```
Günlük harcamam $[X]. Rehberin rotasyon kuralına göre 8 haftalık kreatif takvimi yap:
kaç yeni kreatif, hangi haftalarda, batch büyüklüğü, kazananları canlı tutma yöntemi,
CTR düşüş alarmı (%20-40) için kontrol ritmi. Yorulan kazananları [Tier 2 PAZAR]'a
taşıma planı ekle.
```

**3.6 Üretim seviyesi kararı**
```
MRR $[X], ekip [N], aylık kreatif ihtiyacım [N]. Rehberin 5 seviyesine göre hangi seviyede
olmalıyım? Freelancer/creator seçeneğinde brief şablonu, fiyat aralığı ($50-300), kalite
kontrol checklist'i ve haftada kaç video yeterli olur?
```

---

## 4. Onboarding ve Paywall Testleri

### Kitaptan kritik noktalar
- Aboneliklerin çoğu onboarding sırasında/hemen sonrasında; en güçlü kaldıraç burada.
- Sonuç metrikleri: LTV, ARPU (aylar sürer). Proxy metrikler: ödemeye dönüşüm, trial start & trial→paid, onboarding tamamlama/düşüş, D1/D7, DAU/MAU, oturum süresi.
- **Tek değişkenli test.** Aynı anda çok şey değiştirme.
- Paywall'da test edilecekler: fiyat (en büyük kaldıraç), abonelik süresi (haftalık planlar gelirin yarısına yaklaşıyor; 3 ay/6 ay/lifetime), plan düzeni/varsayılan/"Best value" etiketi, trial (var/yok, süre, trial kullanıcısına daha yüksek fiyat, "İstediğin zaman iptal"), yerleşim (ilk anlamlı eylem sonrası, özellik kapısı, ayarlar, oturum bazlı), buton metni + mikro-metin ("Bugün ücret yok"), push hatırlatmaları (terk sonrası, trial ortası, yenileme).
- Test tipine göre artış (CR / LTV): plan süresi %66/%85, trial %66/%80, plan sayısı %54/%58, fiyat %46/%73, sadece görsel/metin %27/%33.
- Onboarding'de test edilecekler: ekran sayısı, kişiselleştirme (hedef sorusu), quiz (empati), görsel öğeler (ilerleme çubuğu, konfeti), metin, kayıt sürtünmesi ("Google ile devam" / "Şimdilik atla"), sosyal kanıt ve risk azaltıcılar ("10k kullanıcı 4.8", "güvenli ödeme", "para iade garantisi").

### Prompt'lar

**4.1 Test yol haritası (önceliklendirilmiş)**
```
[UYGULAMA] için 12 haftalık A/B test yol haritası çıkar. Rehberin etki verisine göre
sırala: plan süresi → trial → plan sayısı → fiyat → düzen → yerleşim → metin → onboarding
öğeleri. Her test için: hipotez, tek değişken, proxy metrik, minimum örneklem (mevcut
trafiğim: haftalık [N] install), süre, karar kuralı. Aynı anda tek test.
```

**4.2 Plan süresi testi**
```
Mevcut planlar: [LİSTE]. Haftalık plan ekleme / 3-6 aylık plan / lifetime seçeneklerini
rehberin verileriyle değerlendir. Test tasarımı: kontrol vs varyant paywall'ları, fiyatlar,
varsayılan seçim, "Best value" etiketi, ölçülecek metrikler (CR + 12 ay rLTV projeksiyonu).
Kazananı nasıl belirleyeceğimi açıkla.
```

**4.3 Trial stratejisi testi**
```
Trial'lı vs trial'sız, 3/7/14 gün, ve "trial kullanıcısına daha yüksek fiyat" varyantlarını
[UYGULAMA] için karşılaştır. Her varyant için paywall metni (CTA + güven mikro-metni:
"Bugün ücret yok", "İstediğin zaman iptal") ve trial ortası / trial sonu push metinleri yaz.
```

**4.4 Ek paywall yerleşimleri**
```
Onboarding sonundaki ana paywall'a ek olarak [UYGULAMA] için 4 yerleşim tasarla: ilk anlamlı
eylem sonrası, özellik kapısı, ayarlar, oturum bazlı. Her biri için tetikleyici, gösterim
frekans sınırı, mesaj ve "baskı yapmadan niyet yakalama" gerekçesi. Adapty/RevenueCat
placement yapısıyla nasıl kurulur, kod örneği ver.
```

**4.5 Onboarding varyantları**
```
Mevcut onboarding'im: [EKRANLAR]. Rehberin onboarding test tablosundaki 7 öğeye göre
(ekran sayısı, kişiselleştirme, quiz, görsel, metin, kayıt sürtünmesi, sosyal kanıt)
her biri için bir varyant öner: ne değişir, neden, beklenen proxy metrik etkisi.
En yüksek beklenen etkili 2'sini ilk test olarak seç.
```

**4.6 Sonuç yorumlama**
```
A/B test sonucu: kontrol [N kullanıcı, CR %X, ARPU $X], varyant [N, %Y, $Y]. İstatistiksel
anlamlılığı hesapla (kod ver), erken durdurma riskini değerlendir, ve "yay / uzat / iptal"
kararını gerekçele. Sonucu LTV'ye çevirmek için hangi ek veriye ihtiyacım var?
```

---

## 5. Çok Kanala Geçiş

### Kitaptan kritik noktalar
- Yeni kanal sadece mevcut kanal kârlı ve stabilse. MRR düz, CPI artıyor, CTR düşüyorsa → funnel/kreatif sorunu, eksik platform değil. $1M MRR altında tek büyük kanal (çoğunlukla Meta) yeter.
- Genişleme sinyali: tutarlı pozitif ROAS, CAC < LTV, retention sabit. Fayda: tek algoritmaya bağımlılık azalır, mevsimsellik yumuşar.
- **Meta:** 3B+ kullanıcı, biraz daha yaşlı; Reels-first, UGC, temiz statik; ~50 olay/hafta; lifestyle, productivity, education, travel.
- **TikTok:** 1,5B+ MAU, genç; UGC şart, statik nadiren; CPM Meta'dan düşük, CTR uyum bulunana kadar dalgalı; lifestyle, travel, productivity, fitness.
- **Apple Ads:** yüksek niyet, 90+ pazar; ATT/SKAN dışı temiz atıf, anahtar kelime, Custom Product Pages; düşük ölçek ama sabit dönüşüm ve güçlü LTV; aranabilir değer (fitness, öğrenme, meditasyon).
- **Google App Campaigns:** Search/Play/YouTube/Display/Discover; otomatik hedefleme, pre-reg; kara kutu raporlama; utilities, fintech, health, education.
- Kurallar: güçten genişle; tek tek; önce kreatif (her platformun dili farklı); birim ekonomisi.

### Prompt'lar

**5.1 Genişleme karar ağacı**
```
Mevcut kanal verim: ROAS %[X] (son 8 hafta trendi: [..]), CAC $[X], LTV $[X], retention
[..], MRR trendi [..]. Rehberin karar ağacına göre: performans düşüyor mu → mevcut kanalı
düzelt; stabil mi → yeni kanal ekle? Kararı ver, gerekçele, ve "mevcut kanalı düzelt"
çıkarsa ilk 3 düzeltmeyi listele.
```

**5.2 İkinci kanal seçimi**
```
[UYGULAMA] ([KATEGORİ], iOS %[X], hedef pazar [..]) için TikTok, Apple Ads ve Google App
Campaigns'i rehberin kanal özetiyle karşılaştır: kitle uyumu, kreatif gereksinimi, atıf
kalitesi, ölçek/LTV dengesi. Tek bir ikinci kanal seç; ilk 4 haftalık test planı ve
başarı eşiğini yaz.
```

**5.3 Apple Ads kurulumu**
```
[UYGULAMA] için Apple Ads başlangıç yapısı: kampanya grupları (brand / generic / competitor /
discovery), ASO anahtar kelime listemden ilk 30 kelime ve eşleşme tipleri, Custom Product
Page eşleştirmeleri (hangi kelime grubuna hangi sayfa), günlük bütçe ve CPA hedefi
(LTV'ye göre), ve negatif kelime listesi.
```

**5.4 Platforma özgü kreatif adaptasyonu**
```
Meta'da kazanan 5 kreatifim: [AÇIKLAMALAR]. Bunları TikTok'un native diline uyarla: UGC
formatı, hook değişiklikleri, altyazı/ses kullanımı, süre. Neden birebir taşımanın işe
yaramayacağını her biri için tek cümleyle açıkla.
```

---

## 6. Yeni Pazarlara Açılmak

### Kitaptan kritik noktalar
- Tier-1 İngilizce pazarlarda (ABD, İngiltere, Kanada, Avustralya) büyüme yavaşlayınca sıradaki kaldıraç genişleme. **Her seferinde bir pazarda birim ekonomisini kanıtla, tekrar et.**
- **Adım 1 — Nerede test:** organik sinyaller (lokalizasyonsuz gelen install = gizli talep), ekonomi ("edinmesi ucuz, monetize etmesi zengin"), dil kaldıracı (İspanyolca → İspanya + LatAm; Almanca → DE/AT/CH), platform karışımı (iOS ağırlıklı ülke = ARPU; Android = düşük CPI ile ölçek). Aynı anda en fazla 2 pazar.
- Adapty verisiyle 12 ay LTV örnekleri: ABD $45,6; Japonya $53,7; İsrail $53,4; Norveç $52,8; Katar $52,3; BAE $51,3; İngiltere $44,0; Almanya-benzeri Batı Avrupa $41-49; Brezilya $30,7; Meksika $38,3; Suudi Arabistan $46,4.
- **Adım 2 — Sadece dönüşüm yolunu lokalize et:** mağaza sayfası (başlık, açıklama, ekran görüntüleri, video), onboarding + paywall (metin ve fiyat; para birimi uyuşmazsa dönüşüm düşer), yerel fiyat kademeleri. Push, e-posta, destek, uygulamanın kendisi çekiş görülene kadar bekler.
- **Adım 3 — Gerçek parayla soft launch:** $2-5K, 2-4 hafta, zaten işleyen kanal, çevrilmiş ve kültürel olarak uyarlanmış kreatifler, birden fazla hook.
- **Adım 4 — Üç sert metrik:** LTV ≥ 2× CAC (3× → ölçek alanı), trial→paid ana pazarın ±%10'u, D30 retention en iyi ülkelerle aynı aralık. 2/3 iyi → devam; değil → dur/düzelt/geç.
- **Adım 5 — Yavaş ölçekle:** haftada %20-30 bütçe artışı, derin lokalizasyon, yerel amplifikasyon (influencer, PR, mağaza öne çıkarma), fiyat duyarlılığı testi.

### Prompt'lar

**6.1 Pazar seçimi**
```
Mevcut pazarım [..]. Lokalizasyonsuz gelen install dağılımım: [ÜLKE: N]. Rehberin 4 kriteriyle
(organik sinyal, ekonomi, dil kaldıracı, platform karışımı) ve 12 ay LTV verisiyle test
edilecek 2 pazar seç. Her biri için: neden, beklenen CPI/LTV aralığı, dilin açtığı ek
bölgeler, riskler.
```

**6.2 Dönüşüm yolu lokalizasyonu**
```
[PAZAR/DİL] için sadece dönüşüm yolunu lokalize et: mağaza başlığı/alt başlığı/açıklaması,
6 ekran görüntüsü başlığı, onboarding ekran metinleri, paywall metni ve CTA. Kültürel
uyarlamaları (birebir çeviri yerine) işaretle. Yerel fiyat için Apple/Google kademelerinden
öneri ve para birimi gösterimi.
```

**6.3 Soft launch planı**
```
[PAZAR] için $[2-5K] bütçeli, [2-4] haftalık soft launch planı: kanal (mevcut kazanan),
5 hook'lu kreatif seti (çeviri + kültürel uyarlama notu), haftalık bütçe dağılımı,
ölçülecek metrikler ve test sonundaki 3 sert metrik eşiği (LTV≥2×CAC, trial→paid ±%10,
D30 retention aralığı).
```

**6.4 Pazar kararı**
```
[PAZAR] soft launch sonuçları: CAC $[X], tahmini LTV $[X], trial→paid %[X] (ana pazar %[Y]),
D30 retention %[X] (en iyi ülkelerim %[Y]). Rehberin 2/3 kuralıyla karar ver: devam / dur /
düzelt / geç. Devam ise 8 haftalık yavaş ölçekleme planı (haftalık %20-30, derin lokalizasyon
sırası, yerel amplifikasyon, fiyat duyarlılığı testi).
```

**6.5 Türkiye'ye özel (isteğe bağlı)**
```
Türkiye'yi pazar olarak değerlendir: Android ağırlığı, TL fiyatlandırma ve kur dalgalanması,
ödeme alışkanlıkları, iOS/Android ARPU farkı. Rehberin "edinmesi ucuz, monetize etmesi zengin"
kriterine göre nerede duruyor? Türkçe dönüşüm yolu lokalizasyonu için ek dikkat noktaları.
```

---

## 7. Büyüme İçin Finansman

### Kitaptan kritik noktalar
- Gerek var mı: yan proje + sağlam CAC/LTV + çok oyunculu niş → bootstrap; "kazanan hepsini alır" → dış sermaye. Marketplace'ler ağır ön UA ister.
- **Ertelenmiş ödeme (reklam platformları):** mağaza ödemesi öncesi 30-45 gün boşluğu köprüler; aylık fatura, 30 gün vade. Meta, TikTok, Google, Apple sunar (Google: son 12 ayın 3'ünde $5K+ harcama + 1 yıl faaliyet).
- **Factoring:** gelecek mağaza ödemesini bugün nakde çevirir; dilüsyon yok; avans < ödeme (iade/chargeback payı); ~%3 ücret. $20-50K MRR için.
- **RBF:** toplu para, gelirin sabit %'siyle geri ödeme, tavan var (~1,1-1,5×); factoring'den pahalı (%10-50). $50K+ MRR ve öngörülebilir gelir.
- **VC/melek:** $50K MRR + istikrarlı büyüme → %15-20 ile $1M örneği; uzmanlık + ağ; sıkı KPI/raporlama. Çoğu uygulama için VC uygun değil; melekler daha açık. Kaynak: Crunchbase, Signal by NFX, OpenVC, geliştirici ağı.
- Daha az uygun: banka kredisi, crowdfunding, aile-arkadaş.

### Prompt'lar

**7.1 Finansman ihtiyacı analizi**
```
MRR $[X], büyüme %[X]/ay, CAC $[X], LTV $[X], geri ödeme süresi [X] ay, nakit $[X], planladığım
UA artışı $[X]/ay. Rehberin çerçevesine göre: bootstrap mı, ertelenmiş ödeme mi, factoring mi,
RBF mi, melek/VC mi? Karşılaştırma tablosu (maliyet, hız, dilüsyon, uygunluk) ve seçimin
gerekçesi. 3 aylık nakit akışı projeksiyonu ver.
```

**7.2 Nakit akışı simülasyonu**
```
Mağaza ödeme döngüm 30-45 gün; aylık reklam harcamam $[X]. Ertelenmiş ödeme + factoring
(avans %[80], ücret %[3]) senaryosunu simüle et (Python/Excel formülü): aylık nakit
pozisyonu, harcamayı %[X] artırırsam ne zaman nakit sıkışır? RBF ($[X], %[10] gelir payı,
1,3× tavan) alternatifiyle karşılaştır.
```

**7.3 Melek yatırımcı hazırlığı**
```
[UYGULAMA] için melek yatırımcı pitch'i taslağı: rehberin vurguladığı organik edinme
gücü, birim ekonomisi (LTV:CAC), retention, büyüme; 10 slaytlık akış; yatırımcıların
soracağı 10 zor soru ve cevap taslağı. Crunchbase/Signal/OpenVC'de nasıl arama yaparım?
```

---

## 8. Kitabın Özet Kuralları → Aylık Kontrol Prompt'u

Kitabın kapanış listesi: analitik pusula; tek kanalla küçük başla; kreatif hacmi; sistematik tek değişkenli test; bir kanalı ustalaşmadan diğerini ekleme; yeni pazarı organik sinyalle doğrula; finansmanı bilinçli planla.

```
Aylık büyüme retrospektifi yap. Bu ayki verilerim: [MRR, büyüme, CAC, LTV, ROAS, retention,
test sonuçları, kreatif sayısı, kanal/pazar durumu]. Rehberin 7 kuralına göre her birini
✅/⚠️/❌ olarak puanla, en zayıf 1 alanı seç ve gelecek ay için sadece o alana odaklanan
haftalık plan yaz. Diğer alanlarda "ne yapmamalıyım" listesi de ekle.
```

---

## Ek: 0-1K rehberiyle bağlantı

Bu kitabın önkoşulu: çalışan bir mağaza sayfası, kanıtlanmış paywall, ilk ödeyen kullanıcılar. UA analitiği bölümünde "impression→install düşükse mağaza sayfasını düzelt" denir; bunun için **0→1K rehberinin ASO bölümündeki (3.x) prompt'ları** kullan. Trial→paid veya ilk ay churn sorun ise önce bu rehberin 4. bölümüne (test), sonra RevenueCat raporu rehberinin retention bölümüne git.
