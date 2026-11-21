# Sosyal medya rehberi: bir uygulamayı TikTok, Reels ve Shorts'a çıkarmak

Herhangi bir uygulama için kullanılır. İki okuyucusu var: sen (kurucu) ve o uygulamanın
reposunda çalışan Claude. Dosya kendi kendine yeter; başka bir projeye ya da dosyaya bağlı değildir.

**Nasıl kullanılır:** uygulamanın reposunda Claude'a şunu yaz:

> `/Users/can/Desktop/SOSYAL-MEDYA-REHBERI.md` dosyasını baştan sona oku ve bu uygulama için
> uygula. Önce 1. bölümdeki uygulama kartını repodan doldur, dolduramadıklarını bana sor.

**Ne kadar kanıtlı:** bu düzen bir uygulamada kuruldu ve bu yazılırken yalnızca iki gün
uygulanmıştı; hangi açılış cümlesinin kazandığına dair veri henüz yok. Yöntem ve 4.6'daki
tuzaklar yaşanmış şeylerdir. Paylaşım saati ve 6. bölümdeki karar kuralları ise tahmindir ve
öyle işaretlidir. Bir uygulamada sonuç alınca 6. bölümün sonuna yaz.

---

## 1. Uygulama kartı (Claude doldurur, kurucu onaylar)

Claude: bunları repodan çıkar (mağaza metinleri, ekran görüntüleri, App Preview, marka notları).
Repoda olmayanı tahmin etme, kurucuya sor. Kartı uygulamanın reposuna kaydet
(ör. `store/social/APP-CARD.md`); sonraki günlerde oradan okunur.

| Alan | Değer |
| --- | --- |
| Uygulamanın adı | |
| App Store bağlantısı | `https://apps.apple.com/app/id…` |
| Tek cümleyle ne yapar | |
| Kategori kelimesi (insanların aradığı) | ör. "habit tracker", "budget app" |
| Görsel imza: uygulamanın en çarpıcı 10 saniyesi | |
| Kime (tek bir kitle) | |
| Video dili | varsayılan: İngilizce, tek dil |
| Marka sesi | ör. sakin, hafif alaycı, suçlamayan |
| Asla söylenmeyecekler | ör. kanıtsız iddia, kullanıcıyı suçlayan dil |
| Kullanıcı adı (üç platformda aynı) | |
| Elde hazır ham malzeme | App Preview'un ham kaydı, kod ile render edilebilen sahneler, ekran görüntüleri |
| Bağımsız ölçüm kaynağı | ör. Sentry release health, App Store Connect Analytics |

Görsel imza en önemli satırdır. Videoların tamamı o 10 saniyenin üzerine kurulur: izlemesi hoş,
kendi kendine ilerleyen, ilk saniyede ne olduğu anlaşılan bir an. Uygulamada böyle bir an
bulamıyorsan video üretmeye başlama, önce kurucuyla konuş.

---

## 2. Claude'a görev tanımı

**Amaç:** uygulamaya mağaza dışından trafik getirmek. Yeni bir uygulamada mağaza araması trafik
getirmez, çünkü sıralamayı indirme ve puan belirler; yeni çıkan bir uygulama çoğu zaman yalnızca
kendi adıyla bulunur. Kısa dikey video, sıfır takipçiyle izlenme alabilen ücretsiz kanaldır.

**İlk hafta neyi öğrenmek istiyoruz:** hangi açılış cümlesi insanları tutuyor. Bu yüzden ilk üç
video aynı görüntüdür, yalnızca üstündeki cümle değişir; fark cümleden gelsin diye.

**İş bölümü:**
- Claude: malzemeyi bulur, cümleleri yazar, videoları üretir, her gün o günün dosyasını ve
  metinlerini verir, paylaşım günlüğünü tutar, sayıları karşılaştırır.
- Kurucu: hesapları açar, kendi telefonundan ya da masaüstü webden paylaşır, uygulamanın
  editöründen ses ekler, izlenme sayılarını Claude'a yazar. Claude paylaşım yapamaz.

**Bitti sayılması için:**
1. Üç adet 15 saniyelik döngü ve bir demo videosu, 1080×1920, tek bir klasörde hazır.
2. Her video için üç platformun metni yazılmış.
3. Paylaşım günlüğü açılmış (5. bölüm).
4. Üç döngü paylaşıldıktan 48 saat sonra bir karşılaştırma ve kazanan cümleden üç yeni video.

**Her gün kurucuya verilecek şey:** dosyanın tam yolu, üç platformun metni kopyalanabilir
bloklar halinde, bir sonraki günün ne olduğu. Başka bir şey ekleme.

**Sınırlar:**
- Dün hangi videonun paylaşıldığını dosyalardan anlayamazsın. Günlükte yoksa kurucuya sor,
  varsayma; yanlış varsayım o gün için yanlış videonun metnini yazdırır.
- Kullanılmış bir açıklama satırını tekrar kullanma; günlükte durur.
- Uygulamanın yapmadığı bir şeyi videoda ya da metinde söyleme.
- Ölçemediğin şeyi söyleme. "Bu cihaz videodan geldi" denemez; "bugün yeni bir cihaz açtı" denir.
- Videoları üretmeden önce her birinden birkaç kare çıkarıp gözle bak (yazı taşması, boş kutu,
  renk farkı). Bakmadan teslim etme.

---

## 3. Hesaplar (kurucu, bir kere)

- Üç platformda aynı kullanıcı adı. Görünen ad: `Uygulama · Kategori kelimesi`.
  Profil fotoğrafı uygulamanın ikonu.
- **Instagram: Creator hesabı.** Business hesabı müzik kütüphanesini kısıtlıyor.
- **TikTok: kişisel hesap**, aynı sebeple. Web sitesi alanı kilitli olabilir; biyografiye
  `Search <Uygulama> on the App Store` yaz.
- **YouTube:** App Store bağlantısı kanalın Links alanına. Shorts açıklamasındaki bağlantılar
  tıklanmıyor ama yine de yazılır.
- Her uygulamaya ayrı hesap mı, hepsine tek bir stüdyo hesabı mı: kurucunun kararı. Claude
  sormadan seçmesin.

---

## 4. Videolar

### 4.1 Teknik ölçü

- 1080×1920, 30 fps, H.264 High, bt709, `+faststart`. Sessiz bir AAC ses kanalı bulunsun.
- **Ses eklenmez.** Her uygulamanın editöründen seçilen trend ses, videoya gömülü sesten daha
  uzağa gider. Kurucu paylaşırken sakin bir ses seçer, ses düzeyi düşük.
- **Güvenli alan:** yazı üstteki %10'a ve alttaki %22'ye girmez; uygulamalar oraya kendi
  sekmelerini, açıklamayı ve düğmeleri basar. Yazı sütunu ortada, 880 px'ten geniş değil;
  sağdaki düğmelere çarpmasın.
- Açılış cümlesi en fazla üç satır, büyük (1080 genişlikte ~100 px) ve dengeli: son satırda
  tek kelime kalmasın.

### 4.2 Üç döngü (15 saniye, aynı görüntü, üç ayrı cümle)

- Görüntü: uygulama kartındaki görsel imza, 15 saniye, sonu başına bağlanacak şekilde
  (son yarım saniyede ilk kareye geri çözülür).
- Zamanlama: cümle 0–11,3 sn · uygulama adı ve `Free on the App Store` 11,65–13,85 sn ·
  cümle 14,35 sn'de geri gelir, böylece son kare ilk kareye akar.
- Dosya adı cümlenin kimliği olsun: `loop-<cümle-kimliği>.mp4`. Günlük ve karşılaştırma bu
  kimlikle yapılır.

### 4.3 Demo (15–30 saniye)

- App Preview'un ham kaydından (ya da yeni bir simülatör kaydından) kesilir: uygulama ekranı
  küçültülüp yazının altına yerleştirilir, her ekranda yazı değişir, sonda uygulama adı ve
  çağrı 2–3 saniye durur.
- Hızlandırılmış bir bölüm varsa ekranda küçük bir etiketle söylenir (ör. `Time-lapse ×150`).
- Üç döngüden sonra paylaşılır.

### 4.4 Açılış cümleleri

Üç cümle üç ayrı açıdan yazılır:

| Açı | Kalıp |
| --- | --- |
| Sonucu gösterir | `This is what <sonuç> looks like` |
| Kategori kelimesi + beklenmedik nesne | `My <kategori kelimesi> is a <beklenmedik şey>` |
| Kuralı söyler | `It only <olur> while you <yaparsın>` |

Kurallar: birinci tekil ya da doğrudan gözlem, somut, kısa (dokuz kelime civarı), markanın
sesiyle, uygulamanın gerçekten yaptığı bir şey. Kalıplar başlangıçtır; uygulamaya oturmuyorsa
aynı üç açıdan kendi cümleni yaz. Cümleler ve videodaki bütün yazılar tek bir dosyada durur
(ör. `scripts/social/copy.json`), videolar oradan üretilir; yeni cümle eklemek dosyaya bir
satır eklemek olsun.

### 4.5 Döngüyü birleştiren komut

Yazılar ayrı, tam kare (1080×1920) saydam PNG'ler olarak çizilir: `cumle.png` (açılış cümlesi)
ve `cagri.png` (uygulama adı + `Free on the App Store`). Aşağıdaki komut bu makinede denendi;
15 saniyelik kaynağın üstüne 4.2'deki zamanlamayla bindirir:

```sh
ffmpeg -nostdin -loglevel error -y -i kaynak.mp4 \
  -framerate 30 -loop 1 -t 15 -i cumle.png \
  -framerate 30 -loop 1 -t 15 -i cagri.png \
  -framerate 30 -loop 1 -t 15 -i cumle.png \
  -f lavfi -i anullsrc=r=48000:cl=stereo \
  -filter_complex "[0:v]fps=30,scale=1080:1920,setsar=1[v];\
[1:v]format=rgba,fade=t=out:st=11.3:d=0.35:alpha=1[h1];\
[2:v]format=rgba,fade=t=in:st=11.65:d=0.35:alpha=1,fade=t=out:st=13.85:d=0.35:alpha=1[c];\
[3:v]format=rgba,fade=t=in:st=14.35:d=0.5:alpha=1[h2];\
[v][h1]overlay=0:0:format=rgb:enable='lt(t,11.65)'[a];\
[a][c]overlay=0:0:format=rgb:enable='between(t,11.65,14.2)'[b];\
[b][h2]overlay=0:0:format=rgb:enable='gte(t,14.35)',scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[out]" \
  -map "[out]" -map 4:a -t 15 \
  -c:v libx264 -profile:v high -level:v 4.1 -preset slow -crf 16 -maxrate 16M -bufsize 32M -g 60 -r 30 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 128k -ac 2 -ar 48000 -movflags +faststart loop-KIMLIK.mp4
```

Kaynak 9:16 değilse `scale=1080:1920` görüntüyü ezer; önce kırp ya da 9:16 olarak yeniden üret.

### 4.6 Bu makinede karşılaşılan tuzaklar

- Buradaki ffmpeg yazı çizemiyor (`drawtext` yok). Yazı ayrı bir saydam PNG olarak çizilir
  (Skia, CoreText ya da tarayıcı) ve videonun üstüne bindirilir.
- ffmpeg `overlay` varsayılan olarak yuv420'de birleştirir; aynı olması gereken iki koyu ton
  farklı çıkar. Her `overlay` `format=rgb` ile çalışsın, renk dönüşümü en sonda bir kere yapılsın.
- Zincirleme `overlay`, girdilerin piksel oranı (SAR) farklıysa "Invalid argument" verir:
  `setsar=1`.
- Yazı tipinde olmayan bir karakter boş kutu olarak çıkar (●, ok, özel tırnak gibi). Üretilen
  videodan kare çıkarıp gözle bak.
- Simülatör kaydı değişken kare hızlıdır, 1–3 saniye geç başlar ve ekran durunca yazmayı keser.
  Kaydı görünür bir kesime hizala, son kareyi uzat (`tpad`).
- Kaydı proje klasörünün dışına yaz; içine yazılırsa geliştirme sunucusunun "Refreshing"
  şeridi filme girer.
- Dynamic Island kayıtta görünür; üstten kırp.
- Uygulamanın zemin rengi ekrandan ekrana değişebilir; demo videosunda arka planı sabit bir
  renk yerine uygulamanın kendi kenarından al.

---

## 5. Günlük düzen

**Sıra:** günde bir video, aynı gün üç platforma da aynı video. 1., 2., 3. gün üç döngü, sonra demo.

**Her video için metinler** (videonun dili neyse o dilde):

- **TikTok:** bir satır + `Search <Uygulama> on the App Store.` + 5 etiket.
- **Instagram Reels:** aynı satır + `<Uygulama> is free on the App Store. Link in bio.` + 5 etiket.
- **YouTube Shorts:** başlık = videodaki cümle + bir emoji + 2 etiket (100 karakteri geçmez);
  açıklama = tek cümlelik tanım + App Store bağlantısı.

Açıklama satırı videodaki cümleyi tekrar etmez, yanına bir şey koyar: videoda sonuç varsa
açıklamada his ya da karşıtlık (`No <rakiplerde olan>. No <rakiplerde olan>. Just <bizdeki>.`).
Etiketler üç türden seçilir: kategori (`#habittracker`), topluluk (TikTok'ta `#…tok`,
Instagram'da `#…gram`), niyet (`#productivity`).

**Paylaşırken (kurucu):** editörden sakin bir trend ses, kapak olarak cümlenin tam okunduğu bir
kare. Saat için veri yok; İngilizce içerikte 19:00–22:00 (TR) ABD gündüzüne denk geldiği için
makul bir tahmin.

**Paylaşım günlüğü.** Claude her paylaşımdan sonra işler; uygulamanın reposunda tek bir dosya
(ör. `store/social/LOG.md`):

| Tarih | Dosya | Açıklama satırı | Platformlar | 48 saatte izlenme (IG / TT / YT) |
| --- | --- | --- | --- | --- |
| | | | | |

**Kurucunun günlük cümleleri:**
- "bugünkü paylaşıma geçelim" → Claude günlüğe bakar, sıradaki dosyayı ve metinleri verir.
- "paylaştım, üçüne de yükledim" → Claude günlüğe işler, yarını söyler.
- "sayılar şöyle: …" → Claude günlüğe yazar ve 6. bölüme göre karşılaştırır.

---

## 6. Ölçüm ve karar

**Kurucu 48 saat sonra her video için yazar:** platform başına izlenme; gösteriyorsa ortalama
izlenme süresi ya da izlenme yüzdesi, kaydetme ve paylaşma sayısı.

**Claude ayrıca bakar:** bağımsız kaynaktan uygulamayı açan cihaz sayısı ve App Store Connect →
Analytics → Sources. Sentry release health kullanılıyorsa sorguya mutlaka `project=` süzgeci
konur; aynı organizasyondaki öbür uygulamaların aynı sürüm numarası toplamı kirletir. Bu
sayılar videoyla aynı günlere denk gelse bile hangi videodan geldiği söylenemez.

**Karar (tahmin; veri geldikçe güncellenecek):**
- Bir cümle iki ya da üç platformda birden öndeyse kazanan odur: aynı kalıpta üç yeni cümle
  yazılır, aynı görüntüyle üretilir.
- Fark yalnızca tek platformdaysa kazanan ilan edilmez; yeni hesaplarda sayılar küçük ve
  oynaktır.
- Üçü de her platformda aynı düşük düzeyde kaldıysa sorun büyük olasılıkla cümlede değil,
  görüntünün ilk saniyesindedir: görüntüyü değiştir.
- İkinci dil ancak bir kazanan belli olduktan sonra eklenir.

**Uygulamalardan sonuçlar** (her karşılaştırmadan sonra bir satır: uygulama, tarih, kazanan açı,
sayılar):

- henüz yok
