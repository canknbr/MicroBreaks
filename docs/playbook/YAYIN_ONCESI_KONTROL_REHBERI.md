# Yayın Öncesi Kontrol Rehberi

Bir uygulamayı mağazaya göndermeden önce "hata var mı" diye kontrol ettirirken izlenecek yol. Hangi uygulama olursa olsun kullanılabilir. Claude ile çalışırken ne isteyeceğini, cevabı nasıl okuyacağını ve neye güvenmeyeceğini anlatır.

---

## 1. En önemli ayrım: iki ayrı soru var

"Uygulamada hata var mı?" sorusu aslında iki farklı sorudur ve ikisi ayrı yöntemle cevaplanır.

| Soru | Nasıl cevaplanır | Kim cevaplayabilir |
|---|---|---|
| **Çalışıyor mu?** Çöküyor mu, veri kaybediyor mu, sunucu reddediyor mu, hesaplar tutarlı mı | Tip denetimi, testler, kod incelemesi | Claude, büyük ölçüde tek başına |
| **Mantıklı mı?** Bir insan bu ekrana bakınca ne olacağını anlıyor mu, düğme sandığı şeyi yapıyor mu | Uygulamayı gerçekten kullanarak | Önce Claude "ilk kullanıcı turu" ile, son söz **sende** |

Birinci sorunun cevabı "evet" olabilir ve uygulama yine de yayına hazır olmayabilir. Çünkü testler, kodun *tasarlandığı gibi* çalıştığını kanıtlar; tasarımın doğru olduğunu kanıtlamaz. Yanlış bir tasarım için yazılmış test de "geçti" der.

**Kural:** Claude "hata yok" ya da "hazır" derse, hangi soruya cevap verdiğini sor. Yalnızca birinciye cevap vermişse kontrol yarımdır.

---

## 2. Kontrolün sırası

Sıra önemli; her adım bir öncekinin bulamayacağını bulur.

### Adım A — Otomatik kapılar
Tip denetimi, lint, testlerin tamamı, üretim paketinin derlenmesi, CI.

- **Kanıtladığı:** kod derleniyor, mevcut testler geçiyor.
- **Kanıtlamadığı:** testi yazılmamış her şey ve tasarımın kendisi.
- Süre: dakikalar. Kırmızı bir şey varsa önce o düzelir.

### Adım B — Kod incelemesi
Son test edilen sürümden beri değişen kodun, bağımsız bir gözle okunması.

- Neye bakılır: çökme yolları, veri kaybı, saat dilimi ve gece yarısı hataları, bildirimlerin yanlış zamanda gelmesi, sunucunun reddedeceği yazmalar, çeviri eksikleri.
- **Mutlaka sor:** "Son gerçek cihazda denenen build'den beri neler değişti ve bunların hangisi bir cihazda denendi?" Denenmemiş kod en riskli koddur.
- Bulgular "engelleyici / düzeltilmeli / küçük" diye sıralanmalı ve her biri için "şu girdi → şu yanlış sonuç" diye somut bir senaryo olmalı.

### Adım C — İlk kullanıcı turu
Uygulamayı ilk kez gören biri gibi, ekran ekran gezmek. Bu rehberin asıl konusu; ayrıntısı Bölüm 3'te.

### Adım D — Senin turun
Sen simülatörde ya da telefonda on dakika kullanırsın. **Bu adım atlanamaz ve build'den önce yapılır.** On dakikalık gerçek kullanım, saatlerce süren kod kontrolünün bulamadığını bulur.

### Adım E — Yalnızca gerçek cihazda denenebilenler
Satın alma ve geri yükleme, Apple ile giriş, e-posta kodu, bildirimlerin gerçekten gelmesi, çevrimdışı kullanım, kamera. Simülatör bunları kanıtlamaz. TestFlight turu atlanırsa bunlar ilk kez Apple'ın incelemesinde denenmiş olur.

---

## 3. İlk kullanıcı turu nasıl yapılır

### Yöntem
Her ekran için, dokunulabilen her şeyi (düğme, satır, "+", ikon, anahtar, kaydırma) ve ekranda yazan her sayı ile durumu listele. Her biri için üç soru:

1. **Beklenti:** Yalnızca etiketine, ikonuna ve yerine bakan biri buna basınca ne olacağını sanar?
2. **Gerçek:** Basınca ne oluyor? Ne kaydediliyor, nereye gidiliyor, ne bildirim çıkıyor, ekrandaki sayılar nasıl değişiyor?
3. **Tutuyor mu?** Tutmuyorsa bulgudur. "Böyle tasarlanmış" bir cevap değildir.

### Bir kez basmak yetmez
Her kontrol için şunlar da denenir:

- **İki kez, on kez bas.** Sınırsız ekliyor mu?
- **İş zaten yapılmışken bas.** Ne oluyor?
- **Hiç veri yokken bas.** Boş ekran ne yapılacağını söylüyor mu?
- **Yetkisi olmayan biri olarak bas** (bakıcı, izleyici, hesabı olmayan kullanıcı).
- **Geri al.** Yanlış basılan şey nasıl düzeltilir, bu bulunabiliyor mu?

### Somut günler yürü
Soyut bakmak yerine gerçek bir kullanıcının gününü baştan sona canlandır:

- Uygulamayı az önce kurmuş, hiç kaydı olmayan biri.
- Bir yıldır kullanan, verisi dolu biri.
- İşi başka bir ekrandan yapan biri (ana sayfadan değil, ayrıntı sayfasından).
- Gün ortasında kuran biri: sabahki işler "gecikti" diye görünüyor mu?
- Gece yarısını geçen biri.

Her adımda ekranda ne yazdığını söyle ve "bu bir insana mantıklı gelir mi" diye sor.

---

## 4. İlkeler: bunlara aykırı her şey bulgudur

Bunlar gerçek bir yayın öncesi kontrolde, kod kontrollerinden geçmiş ama kullanınca yanlış çıkan şeylerden derlendi.

1. **Uygulama, kullanıcının girmediği bir sayıyı yazmaz ve göstermez.** Tek dokunuşla "1 kap", "250 ml", "15 dakika" gibi uydurulmuş miktarlar kaydedilmez. Uygulamanın kendi koyduğu hedefler ("günde 500 ml") de sorgulanır.
2. **Etiket bir sözdür.** Düğme, üstünde yazanı ve ikonunun gösterdiğini yapar. "Hızlı işlemler" bir sayfaya götürüyor gibi okunuyorsa, sessizce kayıt oluşturmamalıdır.
3. **Hiçbir şey kullanıcının haberi olmadan kaydedilmez.** Bildirim neyin kaydedildiğini adıyla söyler; "Kaydedildi!" yetmez.
4. **Sınırsız basılabilen ve her basışta ekleyen düğme hatadır.** On beş dokunuşla anlamsız bir toplam oluşmamalı.
5. **Dokununca kıpırdamayan sayaç, bozuk düğme gibi okunur.** "+" basıldıysa "1/2" değişmelidir.
6. **Aynı şey iki yerde farklı sayı ya da kelimeyle görünmez.** Üstteki kart "gecikti", alttaki kutu "tamam" diyemez.
7. **Sistem uyarısı menü olarak kullanılmaz.** Birkaç seçenekli gri iOS penceresi uygulamaya yabancı durur; uygulamanın kendi penceresi kullanılır. Basit "emin misin" onayları hariç.
8. **Ekran açıklama gerektirmez.** Anlaşılmayan terim, aynı işi yapan iki düğme, sonucu başka ekranda görünen işlem, ne yapılacağını söylemeyen boş ekran bulgudur.
9. **Yıkıcı işlem neyin gideceğini önceden söyler.** Silme, çıkış, hesap kapatma.
10. **Geri alma bulunabilir olmalıdır.** Yanlış dokunuşun dönüşü dört saniyelik bir bildirimle sınırlı kalmaz.
11. **Ücretli özellik, işin ortasında sürprizle çıkmaz.** Kullanıcı formu doldurduktan sonra değil, başlamadan önce bilir.
12. **Bildirime dokununca doğru yere gidilir.** Doğru kayıt, doğru sekme, birden fazla profil varsa doğru profil.
13. **Çeviri taşmaz ve sızmaz.** Türkçe metin kutuya sığar; araya İngilizce ya da ham anahtar girmez.
14. **Hassas durumlarda dil değişir.** Örneğin anma modundaki bir kayıt için "bol bol sevgi zamanı" denmez.

---

## 5. Claude'dan nasıl istenir

Aşağıdakiler olduğu gibi kopyalanıp kullanılabilir.

### Tam kontrol isteği
> Bu uygulamayı yayınlamadan önce kontrol et. İki ayrı şeye bak ve ayrı ayrı raporla:
> 1. Çalışıyor mu: tip denetimi, testler, üretim paketi ve son gerçek cihazda denenen build'den beri değişen kodun incelemesi.
> 2. Mantıklı mı: uygulamayı ilk kez gören biri gibi her ekranı gez. Her düğme için "kullanıcı ne olacağını sanar, ne oluyor" diye bak; iki kez ve on kez bas, veri yokken bas.
>
> "Böyle tasarlanmış" diye hiçbir şeyi kapatma; uyuşmayan her şeyi bana liste olarak getir, kararı ben vereyim. Neyi doğruladığını ve neyi doğrulayamadığını ayrı yaz. Ben simülatörde bakıp tamam demeden build alma.

### Yalnızca ilk kullanıcı turu
> Şu ekranı ilk kez gören biri gibi gez: [ekran adı]. Dokunulabilen her şeyi ve ekrandaki her sayıyı listele. Her biri için: kullanıcı ne sanar, gerçekte ne olur, tutuyor mu. İkinci ve onuncu dokunuşta ne olduğunu da yaz. Kod okuyarak emin olduklarını ve ekranda bakılması gerekenleri ayır.

### "Hazır mı" diye sorarken
> Hazır mı diye sormuyorum; şunları ayrı ayrı söyle: (1) ekranda gözünle gördüğün, (2) yalnızca testle kanıtlı olan, (3) hiç doğrulayamadığın, (4) yalnızca gerçek cihazda denenebilecek olan.

### Bir düzeltmeden sonra
> Bu düzeltmeyi simülatörde bana göster. Düzeltmenin, benim beklediğim yönde mi yoksa ters yönde mi çalıştığını kendi cümlelerinle anlat.

---

## 6. Cevabı nasıl okumalı

Şu cümleler tek başına yeterli değildir; arkasını sor:

| Claude böyle derse | Sor |
|---|---|
| "Hata yok" / "Engelleyici yok" | Hangi tür hataya baktın? Ekranı kullandın mı, yoksa kodu mu okudun? |
| "Testlerin tamamı geçiyor" | Bu testler doğru davranışı mı sınıyor, yoksa mevcut davranışı mı sabitliyor? |
| "Tasarlandığı gibi çalışıyor" | Tasarım bir kullanıcıya mantıklı mı? Bunu kim denedi? |
| "Simülatörde doğruladım" | Tam olarak hangi ekranda neye bastın, ne gördün? Bir kez mi bastın? |
| "Kod tarafında iş kalmadı" | Mantıklı olup olmadığına kim baktı? Ben baktım mı? |
| "Küçük, engellemiyor" | Neden düzeltmedin? Adı konmuş gerçek bir sebep var mı? |

İyi bir rapor şunları ayrı ayrı içerir: gözle görülen, testle kanıtlanan, doğrulanamayan, cihaz gerektiren.

---

## 7. Simülatörde birlikte çalışırken

- **Canlıya dokunma.** Denemeler yerel emülatöre karşı yapılır; canlı veritabanına test hesabı yazılmaz. Yazılması gerekiyorsa önce sorulur.
- **Simülatör, çalışma kopyasına canlı bağlıdır.** Sen ekranı kullanırken Claude dosya düzenlerse, yarım kalmış bir düzenleme ekranında kırmızı hata olarak görünür. Bu bir build hatası değildir, ama güven sarsar. Kural: sen bakarken düzenleme tek seferde ve tip denetimiyle birlikte yapılır, ya da sana önceden haber verilir.
- **Simülatörü Claude sürecekse haber verir.** İkiniz aynı anda dokunursanız sonuç yanıltıcı olur.
- **Eski deneme verisi yanıltır.** Düzeltmeden önce oluşturulmuş kayıtlar ekranda kalır. Emin olmak için uygulama sıfırlanır.
- **Ücretli özellikler** simülatörde satın alınamaz; geliştirme için bir "ücretli gibi davran" anahtarı gerekir ve bu anahtarın yayın derlemesinde reddedildiği doğrulanır.

---

## 8. Bulgu listesi şablonu

Her bulgu bu biçimde yazılırsa karar vermek kolaylaşır:

| # | Ekran / düğme | Kullanıcı ne sanar | Ne oluyor | Neden sorun | Öneri | Karar |
|---|---|---|---|---|---|---|
| 1 | Ana sayfa / "Su" | Su sayfası açılır | 250 ml kaydedilip sayfa açılıyor | Girmediğim bir sayı kaydedildi | Yalnızca sayfayı aç | Düzelt |

"Karar" sütunu senindir: **Düzelt / Sonraki sürüm / Böyle kalsın**. "Sonraki sürüm" denen her şeyin yanında adı konmuş bir sebep olmalı; "küçük" bir sebep değildir.

---

## 9. Yayın kararı: ne zaman "hazır"

Aşağıdakilerin hepsi "evet" ise hazır:

- [ ] Otomatik kapılar ve CI yeşil.
- [ ] Son cihazda denenen sürümden beri değişen kod incelendi; bulunanlar düzeltildi ya da sebebiyle ertelendi.
- [ ] Her ekran için ilk kullanıcı turu yapıldı; bulgu listesi bana geldi ve her satır için karar verdim.
- [ ] Düzeltmeleri simülatörde **ben** gördüm.
- [ ] Sunucuda yapılması gereken bir güncelleme varsa yapıldı ve canlıda doğrulandı.
- [ ] Yalnızca cihazda denenebilenler gerçek bir telefonda denendi, ya da denenmediğini bilerek kabul ettim.
- [ ] Mağazaya gidecek build, bütün bu düzeltmeleri içeren build.

Son madde göründüğünden önemlidir: testçilerdeki eski build ile düzeltilmiş kod aynı şey değildir. Hangi build'in hangi düzeltmeyi içerdiği her zaman sorulur.

---

## 10. Sık düşülen tuzaklar

- **Testlerin yanlışı sabitlemesi.** Test "tek dokunuş 250 ml yazar" diyorsa ve bu davranış yanlışsa, test geçmeye devam eder. Testin varlığı davranışın doğruluğunu göstermez.
- **"Tasarlandığı gibi" körlüğü.** Ekranda "250/500 ml" yazısını gören inceleyici "çalışıyor" der; kullanıcı "ben bunu girmedim" der. İkisi aynı ekrana bakıyor.
- **Ters yönde düzeltme.** Bir inceleme "ek öğün planlı öğünü erken işaretliyor" der, düzeltme dokunuşu "ara öğün" sayar; kullanıcı ise sayacın artmasını bekliyordur. Düzeltmenin kullanıcının beklediği yönde olduğu ekranda görülmeden kapatılmaz.
- **Tek dokunuşla test.** "+" düğmesine bir kez basıp geçmek, on beş kez basınca ne olduğunu göstermez.
- **Build'i erken almak.** Sahip uygulamayı kullanmadan alınan build, büyük olasılıkla çöpe gider.
- **"Küçük, engellemiyor" diye bırakmak.** Küçük bulgular birikir ve kullanıcının güvenini büyük bir hatadan daha çabuk yıpratır.
- **Yarım özellik.** Seçilebilen ama iş görmeyen bir seçenek, hiç olmamasından daha kötü görünür.

---

## 11. Tek sayfalık kısa liste

**Kontrol istemeden önce**
- Son cihazda denenen build hangisi, ondan beri ne değişti?
- Denemeler canlıya değil emülatöre karşı mı?

**Kontrol sırasında**
- İki soru ayrı ayrı cevaplanıyor mu: çalışıyor mu, mantıklı mı?
- Her ekran ilk kullanıcı gözüyle gezildi mi; her düğmeye birden fazla kez basıldı mı?
- Bulgular liste olarak bana geldi mi, yoksa "sorun yok" diye mi kapatıldı?

**Düzeltmelerden sonra**
- Düzeltmeyi ekranda ben gördüm mü?
- Doğrulanan ile doğrulanamayan ayrı yazıldı mı?

**Build'den önce**
- Ben "tamam" dedim mi?
- Bu build bütün düzeltmeleri içeriyor mu?
- Cihaz gerektirenler denendi mi, ya da riskini bilerek mi atlıyorum?
