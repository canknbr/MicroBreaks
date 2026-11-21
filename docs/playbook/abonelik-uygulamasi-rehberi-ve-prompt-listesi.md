# Abonelik Uygulaması Geliştirme Rehberi ve Claude Prompt Listesi

**Kaynak:** RevenueCat — *State of Subscription Apps 2025* (262 sayfa, 75.000+ uygulama, 10 milyar $+ gelir, 2024 verisi)

> **Önemli not:** Bu rapor bir ASO (App Store Optimization) kitabı değil; abonelik uygulamalarının **dönüşüm, fiyatlandırma, gelir, retention, churn, platform ve kategori benchmark'ları**nı içeren bir veri raporu. Yani mağaza listesi/anahtar kelime optimizasyonundan çok "indirmeyi paraya çevirme" tarafını kapsıyor. Rehber de buna göre hazırlandı.

---

## Bu rehberi nasıl kullanmalısın

1. Her yeni Claude sohbetine **Bölüm 0'daki bağlam prompt'unu** yapıştır. Diğer tüm prompt'lar bu bağlama dayanır.
2. Köşeli parantez içindeki alanları kendi uygulamanla doldur: `[UYGULAMA]`, `[KATEGORİ]`, `[HEDEF BÖLGE]`, `[FİYAT]`, `[PLATFORM]`.
3. Prompt'ları sırayla değil, ihtiyacına göre kullan. Ama yeni bir uygulama için önerilen sıra: **0 → 1 → 2 → 3 → 4 → 12 → 5 → 6**.
4. Her bölümün başındaki "Rapordan kritik veriler" kısmı, Claude'a verdiğin prompt'ların neden öyle yazıldığını açıklar; istersen bunları da prompt'a ekleyerek Claude'un benchmark'lara göre karar vermesini sağlayabilirsin.

---

## 0. Bağlam Prompt'u (her sohbetin başına)

```
Bir mobil abonelik uygulaması geliştiriyorum ve RevenueCat'in "State of Subscription Apps 2025"
raporundaki benchmark'lara göre karar vermek istiyorum. Bu sohbet boyunca aşağıdaki bağlamı koru:

- Uygulama: [UYGULAMA ADI ve 1-2 cümle açıklama]
- Kategori: [Health & Fitness / Productivity / Education / Photo & Video / Utilities /
  Social & Lifestyle / Media & Entertainment / Gaming / Business / Travel / Shopping / AI]
- Platform: [iOS / Android / ikisi] — Framework: [Native Swift-Kotlin / Flutter / React Native]
- Hedef pazar: [Kuzey Amerika / Batı Avrupa / Asya-Pasifik / MEA / LatAm / Hindistan-SEA / Türkiye]
- Mevcut plan yapısı: [haftalık / aylık / yıllık / lifetime — fiyatlar]
- Erişim modeli: [freemium / hard paywall]
- Aşama: [fikir / MVP / yayında, X aylık / ölçekleniyor]
- Mevcut metrikler (varsa): trial start rate, trial→paid, D35 download→paid, D14/D60 RPI, 1. yenileme oranı

Rapordan bilmen gereken temel gerçekler:
1. Trial başlangıçlarının ~%80-82'si indirme gününde (Day 0) oluyor; paywall onboarding'de görünmeli.
2. Medyan trial start rate %6,2; P90 %20,3. Medyan trial→paid ~%40; 17-32 günlük trial'lar en iyi (%45,7).
3. Yüksek fiyatlı uygulamalar daha çok trial başlatıyor (%9,8 vs %4,3) ve 7 kat daha yüksek yıllık LTV üretiyor.
4. Yıllık planlar 12 ayda ~%44 retention; aylık %17; haftalık %3,4. İlk yenileme en büyük churn noktası.
5. Yıllık aboneliklerin ~%30'u ilk ayda iptal ediliyor.
6. Uygulamaların %35'i abonelik + consumable/lifetime karışımı kullanıyor (hibrit model yükseliyor).
7. App Store'da D60 RPI medyanı $0,38, Google Play'de $0,14. iOS'ta önce çıkmak mantıklı.
8. Google Play'de iptallerin %28'i billing hatası (App Store'da %15).
9. Yeni çıkan uygulamaların yalnızca ~%20'si 2 yılda 1.000 $ MRR'a ulaşıyor; medyan süre 60 gün.
10. Hard paywall'lar D35 dönüşümü ve RPI'ı yükseltiyor ama iade oranını da (%5,8 vs %3,4).

Cevaplarını her zaman bu benchmark'larla kıyaslayarak ve somut, uygulanabilir adımlar halinde ver.
Emin olmadığın bir sayı varsa uydurma; "raporda bu kırılım yok" de.
```

---

## 1. Onboarding ve Trial Stratejisi

### Rapordan kritik veriler
- Trial başlangıçlarının %80+'i Day 0'da; onboarding'in son ekranı = paywall olmalı.
- P90 uygulamalar trial start'ta medyandan 3 kat iyi (%20,3 vs %6,2), trial→paid'de sadece 2 kat iyi. **En büyük kaldıraç trial başlatmak.**
- 17-32 günlük trial'lar en yüksek dönüşümü veriyor (%45,7); ≤4 gün en düşük. Ama 3-7 günlük trial'larda Day 0-1 iptali çok yüksek.
- Trial sonuna doğru iptal zirvesi var (kullanıcılar hatırlatıcı kuruyor).
- Health & Fitness ve Education uzun trial (5-9+ gün), Gaming çok kısa (%96 ≤4 gün).
- Trial süresi 5-9 gün olan uygulamalar %52 ile en yaygın.
- Kaldıraçlar: SSO ile kayıt (Apple/Google), kısa onboarding quiz'i, paywall görüntülenme oranını maksimize etmek, "reverse trial" (kart istemeden tam erişim).
- Ladder örneği: trial'da 2 antrenman tamamlayanlar çok daha yüksek oranda dönüşüyor → **aktivasyon metriğini tanımla.**

### Prompt'lar

**1.1 Onboarding akışı tasarımı**
```
[UYGULAMA] için 5-7 ekranlık bir onboarding akışı tasarla. Kurallar:
- Trial'ların %80'i Day 0'da başladığı için son ekran paywall olacak.
- Kayıt Apple/Google SSO ile tek dokunuş.
- 2-3 soruluk bir kişiselleştirme quiz'i ekle; quiz cevapları paywall'daki mesajı değiştirsin.
- Paywall'dan önceki ekran "kullanıcı zaten karar vermiş olmalı" ilkesiyle değer gösterecek.
Her ekran için: amaç, başlık metni, alt metin, CTA, ve toplanacak analitik event'i yaz.
```

**1.2 Trial süresi kararı**
```
[KATEGORİ] kategorisinde, [FİYAT] yıllık fiyatla [UYGULAMA] için 3, 7, 14 ve 30 günlük trial
seçeneklerini raporun verileriyle karşılaştır (dönüşüm, erken iptal riski, trial sonu iptal zirvesi).
Kullanıcının "değeri gördüğü an"ın ne olduğunu benim tanımlamamı iste, sonra bir öneri ver ve
bu öneriyi test edecek A/B deney planı yaz (hipotez, KPI, örneklem, süre).
```

**1.3 Aktivasyon metriği**
```
[UYGULAMA] için Ladder'ın "2 antrenman tamamlama" mantığına benzer bir aktivasyon metriği öner.
Trial süresi içinde kullanıcının hangi 1-3 eylemi yapması dönüşümü en çok yordar? Bunları ölçmek
için event şeması ve trial içinde kullanıcıyı bu eylemlere iten 3 push/in-app mesaj taslağı yaz.
```

**1.4 Reverse trial değerlendirmesi**
```
[UYGULAMA] için "reverse trial" (kart bilgisi istemeden X gün tam premium erişim, sonra free tier'a düşürme)
modelini standart trial ile karşılaştır. Hangi koşullarda mantıklı? Uygulamamda premium özellikleri
kısıtlarken loss aversion'ı nasıl kullanırım? Kod tarafında entitlement yönetimini nasıl kurmalıyım?
```

---

## 2. Paywall Tasarımı ve Dönüşüm

### Rapordan kritik veriler
- Kullanıcı paywall'da değil, paywall'dan **önce** karar veriyor.
- Loss aversion: kullanıcıya onboarding'de premium özellikleri kurdur, sonra "bunları kaybedeceksin" de.
- Çok ekranlı paywall'lar (özellikler / trial detayı / premium faydalar ayrı ayrı) daha iyi performans veriyor.
- Hard paywall: D35 download→paid medyanı çok daha yüksek, D14 RPI ~8 kat; ama iade %5,8.
- Freemium'da dönüşüm haftalara yayılıyor; iyi freemium uygulamalar yine Day 0'da güçlü.
- App Store'da işlemlerin %17,6'sı bir teklif (intro offer) içeriyor, Google Play'de %7,3.
- Kontekstüel tetikleyiciler (özellik kullanımı sonrası upsell) kesintili pop-up'lardan daha iyi.

### Prompt'lar

**2.1 Paywall metin ve yapı**
```
[UYGULAMA] için çok ekranlı (3 ekran) bir paywall tasarla:
Ekran 1: değer önerisi + kullanıcının onboarding'de seçtiği hedefe göre kişiselleştirilmiş başlık
Ekran 2: özellik karşılaştırma (free vs premium) + sosyal kanıt alanı
Ekran 3: plan seçimi (yıllık varsayılan seçili, aylık ikincil), trial detayı, CTA, iptal güvencesi.
Her ekran için Türkçe ve İngilizce metin, dikkat çeken 1 istatistik, ve "kapat" butonunun nerede
olması gerektiğini yaz. Apple'ın abonelik UI kurallarına uygun olsun.
```

**2.2 Freemium vs hard paywall kararı**
```
[UYGULAMA], [AŞAMA] aşamasında. Raporun verilerine göre freemium mı hard paywall mı seçmeliyim?
Şunları değerlendir: nakit akışı ihtiyacım, ürün-pazar uyumu netliği, kategori benchmark'ları,
iade riski, uzun vadeli retention. Karar matrisi ver ve seçilen modelde ilk 30 günün başarı
kriterlerini yaz.
```

**2.3 Kontekstüel upsell noktaları**
```
[UYGULAMA]'nın özellik listesi: [ÖZELLİKLER]. Freemium kullanıcı için en iyi 5 upsell tetikleme
noktasını belirle (hangi özelliğe dokunduktan sonra, hangi mesajla, hangi teklifle). Kesintili
pop-up yerine akışa gömülü tasarım olsun. Her biri için event adı ve gösterim frekans sınırı yaz.
```

**2.4 Paywall A/B test planı**
```
Mevcut paywall dönüşümüm: trial start %[X], trial→paid %[Y]. Raporda medyan %6,2 / ~%40, P90 %20,3.
Beni P75'e taşıyacak 5 A/B test hipotezi öner; her biri için beklenen etki, ölçüm metriği,
minimum örneklem ve önce A/A test gerekip gerekmediğini belirt. Öncelik sırasına koy.
```

**2.5 Kod: paywall implementasyonu**
```
[FRAMEWORK] ile RevenueCat kullanarak remote-config edilebilir bir paywall ekranı yaz.
Gereksinimler: offering'leri çek, yıllık planı varsayılan seç, intro offer varsa göster,
satın alma ve restore akışı, hata yönetimi, analitik event'leri (paywall_view, plan_selected,
purchase_started, purchase_completed, purchase_failed). Kodu açıkla.
```

---

## 3. Fiyatlandırma ve Plan Yapısı

### Rapordan kritik veriler
- Medyan fiyatlar: haftalık $4,99, aylık $9,99, yıllık $29,99. Üst dilimler yükseliyor (P90 yıllık $89,99).
- Yıllık, aylıkx12'ye göre ortalama %67 indirimli.
- Yüksek fiyat → yüksek trial start, yüksek D35 dönüşüm (%2,7 vs %1,5) ve ~7x yıllık LTV ($55 vs $8).
- Ama: düşük fiyatlı **aylık** planlar daha iyi retention (12 ayda %22,5 vs %12,2 yüksek fiyatlı).
- Yıllık plan payı: Health & Fitness %67, Travel %65; Gaming %78 haftalık.
- Bölge: Kuzey Amerika en yüksek ($8,99 aylık, $35,99 yıllık); IN/SEA, LatAm çok düşük; emerging pazarlarda Google Play fiyatları ~%40 düşük.
- Uyarı: aylık planı kaldırma; kategori ve bölgeye göre plan karışımı değişiyor.
- Fiyat testi: dönüşüm değil ARPU ile ölç; 6-9 aydır test yapmadıysan yap.

### Prompt'lar

**3.1 Fiyat aralığı önerisi**
```
[UYGULAMA] ([KATEGORİ], hedef: [BÖLGE]) için haftalık/aylık/yıllık fiyat önerisi yap.
Raporun kategori ve bölge medyanlarını referans al, sonra "premium konumlanma" seçeneğini
(medyanın 1,5-2 katı) ve olası etkilerini (trial start ↑, LTV ↑, aylık retention ↓, iade ↑) tartış.
Yıllık planı aylığa göre %60-70 indirimli konumlandır. Son olarak Türkiye için TL fiyat önerisi
ve App Store fiyat kademelerine uygun değerler ver.
```

**3.2 Plan karışımı**
```
[KATEGORİ] için raporun "share of subscriptions sold" verisine göre hangi plan sürelerini
sunmalıyım? Haftalık plan eklemeli miyim (retention'ı %3,4 ama reactivation'ı yüksek)?
Lifetime eklemeli miyim? Her seçeneğin gelir, retention ve iade etkisini tabloyla karşılaştır.
```

**3.3 Bölgesel fiyatlandırma**
```
[UYGULAMA] için 7 bölgeye (NA, W.Europe, APAC, IN/SEA, MEA, LatAm, ROW) bölgesel fiyat matrisi
oluştur. Big Mac endeksi değil, raporun bölgesel medyanlarını ve iOS/Android kullanıcı profili
farkını temel al. Google Play'de emerging pazarlarda %40 düşük fiyat ve taksit/alternatif ödeme
seçeneklerini değerlendir.
```

**3.4 Fiyat testi tasarımı**
```
Mevcut fiyat: [FİYAT]. %25 ve %50 zam ile bir fiyat testi tasarla. Başarı metriği ARPU olsun,
dönüşüm değil. A/A test, örneklem hesabı, süre, mevcut abonelerin grandfathering'i,
App Store/Play'de fiyat değişikliği yaparken dikkat edilecekler ve kod tarafında offering
segmentasyonunu nasıl yapacağımı yaz.
```

---

## 4. Hibrit Monetizasyon (Abonelik + Consumable + Lifetime)

### Rapordan kritik veriler
- Uygulamaların %35'i sadece abonelikle yetinmiyor. Gaming %62, Social & Lifestyle %39 hibrit.
- AI uygulamalarında kredi/consumable modeli hem maliyet kontrolü hem yüksek harcayan kullanıcıları yakalıyor.
- Emerging pazarlarda tek seferlik satın alma tercih ediliyor.
- Consumable'lar mevcut aboneliği yamyamlamadan alıcı sayısını artırıyor.
- Teklifler (offers) sadece %13 uygulamada kullanılıyor; Health & Fitness %22.

### Prompt'lar

**4.1 Hibrit model tasarımı**
```
[UYGULAMA] için abonelik + consumable + lifetime içeren bir hibrit monetizasyon modeli tasarla.
Hangi özellikler abonelikte, hangileri kredi/tek seferlik, lifetime fiyatı yıllığın kaç katı olmalı?
Yamyamlaşma riskini nasıl önlerim? Her SKU için StoreKit/Play Billing ürün tipi ve RevenueCat
entitlement yapısını yaz.
```

**4.2 Kredi sistemi (özellikle AI uygulamaları)**
```
[UYGULAMA] AI özellikleri için API maliyeti oluşturuyor. Kullanıcı başı maliyet ~[$X]/işlem.
Abonelikle birlikte çalışan bir kredi sistemi tasarla: aylık kredi kotası, ek kredi paketleri,
fiyatlandırma, kötüye kullanım önleme, kredi bakiyesinin sunucu tarafında güvenli yönetimi.
Kod mimarisi ve veri modeli öner.
```

**4.3 Teklif stratejisi**
```
[UYGULAMA] için intro offer, promotional offer, offer code ve win-back offer stratejisi oluştur.
Hangi segmente hangi teklif, ne zaman? App Store'da teklif kullanımı %17,6, Google Play'de %7,3;
her platformun teklif mekanizmalarını karşılaştır ve uygulama planı yaz.
```

---

## 5. Retention ve Churn

### Rapordan kritik veriler
- 12 aylık retention: yıllık %44,1, aylık %17,0, haftalık %3,4 (hepsi geçen yıla göre düştü).
- İlk yenileme en kritik: haftalıkta %30-50, aylıkta %15-40 churn. 3. yenilemeye ulaşanlar %77+ kalıyor.
- Yıllık aboneliklerin ~%30'u ilk ay iptal ediyor ("unutulmuş yenileme" endişesi).
- İptal nedeni #1 (Google anketi): "yeterince kullanmadım" %32-47; #2 maliyet %35.
- Google Play'de billing hatası iptallerin %28'i → ödeme hatası kurtarma şart.
- Aktif yenileme oranı: haftalık planlarda %30'un altı; kullanıcı yenilemeler arasında uygulamayı açmıyor.
- Uygulamalar İçi Kanıt: Kuzey Amerika daha iyi dönüştürüyor ama Avrupa/APAC aynı derecede iyi tutuyor.

### Prompt'lar

**5.1 İlk yenileme koruması**
```
[UYGULAMA] için ilk yenileme öncesi (aylık: 3-4. hafta; yıllık: ilk 30 gün) churn önleme programı
tasarla. Yıllık abonelerin %30'u ilk ayda iptal ediyor. İlk 7/14/30 gün için engagement hedefleri,
push/e-posta akışı, "değer hatırlatma" ekranları ve yenileme öncesi bildirim stratejisi yaz.
```

**5.2 İptal akışı (cancellation flow)**
```
Uygulama içi iptal akışı tasarla: iptal nedeni anketi (yeterince kullanmadım / pahalı / daha iyi
uygulama buldum / teknik sorun), her nedene özel karşı teklif (indirim, plan düşürme, pause),
ve bu verinin analitik olarak nasıl saklanacağı. iOS'ta Apple'ın iptal akışına nasıl
bağlanacağımı da yaz.
```

**5.3 Billing hatası kurtarma**
```
Google Play'de iptallerin %28'i billing hatasından. [UYGULAMA] için grace period, account hold,
ödeme yöntemi güncelleme bildirimi ve RevenueCat billing issue webhook'larını kullanan bir
kurtarma akışı tasarla. Kod örneği ver.
```

**5.4 Retention analizi**
```
Kohort verilerimi paylaşıyorum: [VERİ]. Raporun [KATEGORİ] benchmark'larıyla (1./2./3. yenileme,
6 ay, 12 ay) kıyasla. Erken dönemde kalan kullanıcıların farklı yaptığı 3 şeyi bulmam için
hangi analizleri yapmalıyım? SQL/Python ile örnek analiz kodu yaz.
```

---

## 6. Reaktivasyon ve Win-back

### Rapordan kritik veriler
- Churn eden kullanıcıların yıl içinde geri dönme oranı: aylık %13+, haftalık %9,4, yıllık %4,6.
- Yüksek fiyatlı planlar daha çok geri dönüyor (%11,9).
- Duolingo: en iyi pencere ilk 3-4 gün; 7 gün günlük hatırlatma, sonra dur. Son etkileşimden 23,5 saat sonra bildirim.
- Uzun süreli inaktifler için sosyal reaktivasyon (arkadaş daveti, liderlik tablosu) uygulama bildirimlerinden iyi.
- Kişiselleştirilmiş, kademeli indirimler; toplu indirim yok (kullanıcılar sistemi oynar).
- Esnek planlar: pause, kısa süreli plan.

### Prompt'lar

**6.1 Win-back kampanyası**
```
[UYGULAMA] için churn sonrası 30 günlük win-back kampanyası tasarla. Gün 0-4 yoğun, 7. günden
sonra seyrelen bildirim takvimi; segmentlere göre (fiyat hassasiyeti, kullanım düzeyi, plan tipi)
farklı teklif; App Store win-back offer ve Play'de karşılığı. Her mesaj için metin ve tetikleyici yaz.
```

**6.2 Bildirim zamanlaması**
```
Sabit saat yerine kullanıcının son etkileşimine göre (örn. +23,5 saat) tetiklenen bir bildirim
zamanlama sistemi tasarla. [FRAMEWORK] ve [BACKEND] için mimari, yerel bildirim vs push tercihi,
frekans sınırı ve etkinlik düşünce durdurma mantığını kodla.
```

**6.3 Sosyal reaktivasyon**
```
[UYGULAMA]'ya uzun süreli inaktif kullanıcıları geri getirecek sosyal mekanik öner (arkadaş
daveti, haftalık liderlik tablosu, ortak hedef). Kategorime uygun 3 seçenek, her biri için
ürün spesifikasyonu ve ölçüm planı.
```

---

## 7. İade (Refund) Yönetimi

### Rapordan kritik veriler
- En yüksek iade: Education %4,86, Health & Fitness %4,71; en düşük Travel %1,51.
- Hard paywall %5,8 vs freemium %3,4. Düşük fiyat %2,2.
- Çoğu iade "pişmanlık", teknik sorun değil. Apple'a kullanım verisi gönderilebilir (RevenueCat Refund Handling).
- AI uygulamalarında iade daha maliyetli (compute maliyeti zaten harcandı).

### Prompt
```
[UYGULAMA] ([KATEGORİ]) için iade oranını düşürecek 5 önlem öner: beklenti yönetimi (paywall
metni), onboarding'de değer teslimi, trial hatırlatmaları, Apple'a kullanım verisi gönderme
(RevenueCat consumption request), ve müşteri desteği akışı. Ayrıca iade oranımı [%X] olarak
kategori benchmark'ıyla kıyasla.
```

---

## 8. Platform Stratejisi: iOS vs Android

### Rapordan kritik veriler
- App Store D60 RPI medyanı $0,38 vs Google Play $0,14; her bölgede iOS önde.
- Uygulamaların %67+'si gelirinin %80+'ini iOS'tan alıyor; sadece %10-14'ü tamamen Android.
- Google Play ilk yenilemede daha iyi, App Store 2-3. yenilemede yakalıyor.
- Google Play komisyonu %15 (Apple ilk yıl %30, sonra %15) → daha düşük ARPU ama daha yüksek marj.
- Android: emerging pazarlar, B2B/productivity kullanıcısı; iOS: ABD ve premium pazarlar, fotoğraf (30x).
- Trial adoption Google Play'de düşük (P90 %14,2 vs %22,6).
- Öneri: iOS'ta başla, Android'i global ölçek için ekle; Android'de consumable ve yerel fiyat.

### Prompt'lar

**8.1 Lansman sırası**
```
[UYGULAMA] için önce iOS mu, Android mi, ikisi birden mi? Kategorim, hedef pazarım ve ekip
kapasitem: [BİLGİ]. Raporun platform verileriyle (RPI, LTV, trial adoption, komisyon, billing
hatası) gerekçeli bir lansman planı ve ikinci platforma geçiş kriterleri yaz.
```

**8.2 Android'e özel strateji**
```
Google Play sürümü için: bölgesel fiyat (%40 düşük), consumable IAP ekleme, alternatif ödeme,
billing hatası kurtarma, düşük trial adoption'a karşı yaklaşım. Play Console'da hangi
ayarları/araçları kullanmalıyım? Adım adım checklist ver.
```

---

## 9. Framework Seçimi (Native / Flutter / React Native)

### Rapordan kritik veriler
- D35 download→paid: React Native medyan %2,2 (en yüksek), P90 %11,2.
- D60 RPI: RN medyan $0,44; Flutter P90'da Native'i geçiyor ($2,29 vs $1,53).
- Yıl 1 LTV/payer: RN $22,80 medyan (en yüksek); Native $16,15; Flutter $13,81.
- Retention: Flutter ve RN, Native'e göre biraz zayıf (deneyim/ödeme optimizasyonu etkisi olabilir).
- Expo + AI araçları (Bolt, Replit) RN'i çok hızlandırdı.

### Prompt
```
[UYGULAMA] için Native, Flutter ve React Native (Expo) arasında seçim yapmama yardım et.
Kriterler: tek başıma/küçük ekiple Claude ile geliştiriyorum, iOS öncelikli, [ÖZELLİK
GEREKSİNİMLERİ]. Raporun framework benchmark'larını (dönüşüm, RPI, LTV, retention) ve
geliştirme hızı/bakım maliyetini birlikte değerlendir. Seçilen framework için proje iskeleti
ve RevenueCat entegrasyon adımlarını yaz.
```

---

## 10. Kullanıcı Edinme (Acquisition) ve Web-to-App

### Rapordan kritik veriler
- iOS CPI Kuzey Amerika'da Play'in ~3 katı; Photo & Video en pahalı (üst dilim $14+); AI uygulamaları iOS'ta $10+ CPI, Android NA'da $4'ün altı.
- Web-to-app funnel'lar (landing page + web abonelik) yüksek niyetli kullanıcı yakalıyor, platform komisyonunu atlıyor, esnek fiyat testi sağlıyor.
- Apple Search Ads view-through attribution destekliyor; Reddit yükselen kanal.
- Web billing: Business kategorisi en düşük churn (-3,7%/ay), medyan tahmini LTV $255; NA $224.
- Web tarafında: pause, para iade garantisi, indirimli yenileme gibi mağazada olmayan retention araçları var.

### Prompt'lar

**10.1 UA kanal planı**
```
[UYGULAMA] için aylık [BÜTÇE] ile kullanıcı edinme planı yap. Kategorimin CPI/CPPU
benchmark'larını dikkate al. Apple Search Ads, Meta, TikTok, Reddit ve organik/ASO kanallarını
karşılaştır; "kaliteli trial" optimizasyonu için hangi event'i ad platformlarına geri
göndermeliyim? İlk 90 gün için haftalık plan ve durdurma kriterleri yaz.
```

**10.2 Web-to-app funnel**
```
[UYGULAMA] için web landing page + web abonelik (Stripe/Paddle + RevenueCat Web Billing) akışı
tasarla: quiz → sonuç → fiyat → ödeme → uygulama indirme → hesap eşleştirme. Landing page
metnini, teknik mimariyi ve Apple'ın dış ödeme kurallarına uyumu yaz.
```

**10.3 ASO / mağaza listesi (raporun kapsadığı kadarıyla)**
```
[UYGULAMA] için App Store ürün sayfası taslağı hazırla: başlık (30 kr), alt başlık (30 kr),
promosyon metni, açıklama, anahtar kelime alanı (100 kr), 6-8 ekran görüntüsü senaryosu.
Ekran görüntüleri onboarding'deki değer önerisiyle ve paywall'daki vaatle tutarlı olsun
(indirmeden trial'a geçiş oranını artırmak için). Ayrıca 3 Custom Product Page fikri ver.
```

---

## 11. AI Uygulamaları

### Rapordan kritik veriler
- AI uygulamaları D60 RPI $0,63+ (genel medyan $0,31'in 2 katı), Health & Fitness ile aynı seviyede.
- Dönüşüm oranları benzer ama abone başı gelir daha yüksek: kullanıcılar anlamlı AI deneyimine daha çok ödüyor.
- Sadece %14'ü trial sunuyor; trial start medyanı %9,6 → trial eklemek fırsat.
- D35 download→paid medyan %2,8. LTV 1 yıl ~$37; Google Play P90'da daha iyi ($91,80).
- Google Play'de yıllık ödeyen retention'ı daha iyi (%11,5 vs %9,2).
- İade AI'da daha maliyetli; kredi/virtual currency ile "erişim değil kullanım" satışı öneriliyor.
- "Sadece AI eklemek yetmez, farklılaşma şart."

### Prompt'lar

**11.1 AI uygulaması monetizasyon planı**
```
[UYGULAMA] bir AI uygulaması ([NE YAPIYOR], API maliyeti işlem başına ~[$X]). Raporun AI
bölümüne göre: trial sunmalı mıyım (sadece %14 sunuyor), abonelik + kredi karışımı nasıl olmalı,
fiyat premium mu olmalı, iade maliyetini nasıl sınırlarım? Birim ekonomisi (CAC, RPI, API
maliyeti, marj) tablosu ve 3 fiyatlandırma senaryosu ver.
```

**11.2 Farklılaşma**
```
[UYGULAMA] için "sadece AI wrapper" olmaktan çıkaracak 5 farklılaşma fikri öner: veri/kişiselleştirme,
iş akışı entegrasyonu, topluluk, offline değer, alışkanlık döngüsü. Her fikir için retention'a
etkisi ve geliştirme maliyeti tahmini.
```

---

## 12. Metrik Takibi, Benchmark ve Analitik Altyapısı

### Rapordan kritik veriler — Kendini kıyasla
| Metrik | Medyan | Üst çeyrek | P90 |
|---|---|---|---|
| Trial start rate | %6,2 | — | %20,3 |
| Trial → paid | ~%40 | — | ~%65-70 (kategoriye göre) |
| D35 download → paid (tümü) | ~%2 | — | ~%8-10 |
| D14 RPI (tümü) | ~$0,19 | ~$0,5 | ~$1,1-1,5 |
| D60 RPI (tümü) | $0,31 | — | — |
| D60 RPI (Health & Fitness) | $0,63 | — | $4,19 |
| Yıl 1 LTV/payer (tümü) | ~$16-20 | — | — |
| 12 ay retention — yıllık / aylık / haftalık | %44 / %17 / %3,4 | | |
| 1. yenileme (medyan, tümü) | %61,7 | | |
| İade oranı | ~%3 | | |
| 1.000 $ MRR'a ulaşma | %20 (2 yılda), medyan 60 gün | | |
| 10.000 $ MRR'a ulaşma | %5 | | |

Raporun Self-Evaluation Calculator'ında ölçülen 9 metrik: trial start rate, trial→paid, download→paid, D14 RPI, 1 ay LTV/payer, 1. yenileme (aylık), 1. yenileme (yıllık), 6 ay retention, 12 ay retention.

### Prompt'lar

**12.1 Analitik event şeması**
```
[UYGULAMA] için raporun 9 temel metriğini hesaplamaya yetecek analitik event şeması tasarla
(event adı, parametreler, ne zaman ateşlenir). RevenueCat webhook'ları + [ANALİTİK ARACI]
kombinasyonuyla nasıl kurarım? Kod örneği ver.
```

**12.2 Benchmark karşılaştırması**
```
Metriklerim: [LİSTE]. Bunları raporun [KATEGORİ] ve [BÖLGE] benchmark'larıyla kıyasla; her
metrik için çeyreklik konumumu (Q1/medyan/Q3/P90) tahmin et ve en büyük kaldıraç sırasına göre
3 öncelikli aksiyon öner.
```

**12.3 Haftalık dashboard**
```
Kurucu olarak her hafta bakmam gereken 8 metrikli bir dashboard tanımla; her metrik için
hesaplama formülü, uyarı eşiği (benchmark'a göre) ve düştüğünde ilk kontrol edilecek şey.
[ARAÇ] ile nasıl kurulacağını anlat.
```

**12.4 Lansman sonrası yol haritası**
```
[UYGULAMA] yeni çıktı. Medyan uygulama 60 günde 1.000 $ MRR'a ulaşıyor; %5'i 10.000 $'a ulaşıyor.
İlk 12 ay için ay ay hedefler, her ayda test edilecek 1 hipotez ve "pivot/devam" karar noktaları
içeren bir yol haritası çıkar.
```

---

## 13. Kategori Hızlı Referans (Category Breakouts)

Prompt'larda `[KATEGORİ]` yerine kullanırken Claude'a şu ipuçlarını da ver:

| Kategori | Ayırt edici bulgular |
|---|---|
| **Health & Fitness** | En yüksek RPI ve LTV (D14 $0,44, LTV/payer $16,44); %67 yıllık plan; %56 mixed trial; uzun trial; iade %4,7 yüksek; NA D60 RPI $1,00. Yüksek fiyat medyan LTV $70. |
| **Productivity** | Yıllık ~$27 (aylığın 3x); Day 0 dönüşüm %60+; yüksek fiyat LTV $47; MEA'da aylık baskın. |
| **Education** | Yıllık $44 (aylığın 5x); yüksek iade %4,9; D35 dönüşüm düşük (ön yatırım gerekiyor); NA/W.Europe trial→paid %38+. |
| **Utilities** | Emerging pazarlarda %50 haftalık; yıllık $22 (aylığın 2,7x); 3. yenileme %81; yüksek fiyat LTV $55. |
| **Photo & Video** | En yüksek başarı oranı (2 yılda %27,6'sı 1.000 $ MRR); P95 aylık gelir $15k; iOS'ta 30x gelir; CPI en pahalı; haftalık $5,18 premium. |
| **Social & Lifestyle** | LatAm'da %67 haftalık; %39 hibrit; düşük retention; ilk haftalık yenileme %40 → ikincisi %70. |
| **Media & Entertainment** | Aylık plan baskın (NA %50); trial→paid %44 (2. en yüksek); W.Europe LTV $17; D35 dönüşüm düşük (reklam alternatifi). |
| **Gaming** | %78 haftalık, %96 trial ≤4 gün; %62 hibrit; en yüksek P95 gelir $18k; düşük retention; iade düşük. |
| **Business** | LTV P90 $52; yıllık yenileme en yüksek; web billing'de en düşük churn ve en yüksek LTV ($255). |
| **Travel** | Trial→paid en yüksek %48,7; iade en düşük %1,5; %65 yıllık. |
| **Shopping** | Medyan gelir en düşük ($34/ay) ama P95 $10k; haftalık reaktivasyon %18. |
| **AI** | Bkz. Bölüm 11. |

**Kategori özel prompt:**
```
[KATEGORİ] kategorisinde [UYGULAMA] geliştiriyorum. Raporun bu kategori için verdiği plan
dağılımı, fiyat, trial, dönüşüm, RPI, LTV ve yenileme verilerini özetle; kategorinin "tuzakları"
(örn. Education'da yüksek iade, Gaming'de düşük retention) için önleyici tasarım kararları öner.
```

---

## Ek: Claude ile çalışırken pratik ipuçları

- **Bağlamı bir kere ver, sonra kısa sor.** Bölüm 0 prompt'unu Project talimatı olarak kaydedersen her sohbette tekrar yapıştırman gerekmez.
- **Sayı iste, ama kaynağını iste.** "Raporda bu var mı?" diye sor; Claude'un uydurmasını engeller.
- **Kod + strateji ayrı sohbetlerde.** Paywall stratejisi bittikten sonra "şimdi bunu [FRAMEWORK]'te kodla" diye yeni bir sohbet aç; bağlam daha temiz kalır.
- **Her karar için A/B test iste.** Rapor boyunca tekrarlanan mesaj: kategori değil uygulama farkı belirleyici; en iyi %10 medyanın 2-3 katını yapıyor.
- **Öncelik sırası:** Trial start rate (en büyük kaldıraç) → paywall/ilk oturum → fiyat/plan yapısı → ilk yenileme → win-back.
