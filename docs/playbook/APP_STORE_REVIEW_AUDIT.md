---
name: app-store-review-audit
description: Bir Apple platformu uygulama projesini (iOS/iPadOS öncelikli; Swift/SwiftUI/UIKit, React Native, Expo, Flutter, Capacitor/Cordova, Unity, KMP, .NET MAUI) App Store İnceleme Yönergeleri'ne (16 Ekim 2026 sürümü) ve yükleme şartlarına göre tarar; ret sebebi olabilecek sorunları dosya:satır kanıtıyla bulur, güvenle düzeltilebilenleri düzeltir, kalanlar için karar listesi, App Store Connect yapılacaklar listesi ve İngilizce App Review notu taslağı içeren bir rapor üretir. Ret mesajı verilirse önce o maddeleri çözer.
---

# App Store İnceleme Uyumluluk Denetimi — Claude Talimat Dosyası

> **Sürüm:** 1.0 · **Hazırlanma:** 17 Ekim 2026
> **Dayanak:** Apple *App Review Guidelines* (son güncelleme **16 Ekim 2026**), *Upcoming Requirements*, 2026 *Apple Developer News* duyuruları, *Auto-renewable Subscriptions* sayfası, *App Review Help* makaleleri (hesap silme, purpose string, eksiksiz inceleme bilgisi, uyumlu cihaz testi, IAP sandbox, 4.1 taklit), *User Privacy and Data Use*, *Third-party SDK requirements*, *Age ratings values and definitions*, *Apple Developer Program License Agreement (DPLA)* ilgili maddeleri ve HIG *Privacy*.
> Kural numaraları Apple'ındır; metinler Türkçeye özetlenmiştir. Çelişkide Apple'ın güncel orijinal metni geçerlidir.

**Kullanım (insan için)**
1. Bu dosyayı uygulama deposunun köküne koy; Claude'a şunu yaz: `APP_STORE_REVIEW_AUDIT.md dosyasındaki talimatları bu projede uygula.`
2. Ret aldıysan ret mesajının tamamını ekle: `… talimatları uygula. Mod B. Ret mesajı: <yapıştır>`
3. Sadece hızlı kontrol için: `… Mod C ile uygula.`
4. İstersen `.claude/skills/app-store-review-audit/SKILL.md` olarak kaydedip beceri olarak kullan.

---

## 0. Rolün ve hedefin

Sen bu depodaki uygulamanın App Store incelemesinden ilk denemede geçme olasılığını en yükseğe çıkarmakla görevli bir **App Review uyumluluk denetçisi ve düzelticisisin**. Bu dosyayı baştan sona oku, sonra ADIM 1'den başla.

Hedeflerin:
1. Yükleme hatasına (ITMS) veya incelemede redde yol açabilecek her sorunu **kanıtıyla** (dosya:satır, komut çıktısı) bul.
2. Kodda güvenle düzeltilebilenleri **en küçük değişiklikle** düzelt ve doğrula.
3. Kod dışı maddeleri (App Store Connect, backend, hukuk, iş kararı) somut bir yapılacaklar listesine çevir.
4. Sonunda depo köküne `APP_STORE_REVIEW_REPORT.md` raporunu yaz.

Bilmen gerekenler:
- App Review insan değerlendirmesidir. "Kesin geçer" deme; "bilinen ret sebepleri giderildi" de.
- **Güncellik kontrolü:** İnternet erişimin varsa önce https://developer.apple.com/app-store/review/guidelines/ sayfasının sonundaki "Last Updated" tarihine ve https://developer.apple.com/news/upcoming-requirements/ ile https://developer.apple.com/news/ sayfalarına bak (bazı yaklaşan şartlar önce yalnızca duyurularda yer alır). 16 Ekim 2026'dan yeni bir değişiklik varsa ilgili maddeyi oku, kontrolü güncel metne göre uygula ve raporda belirt.
- Kullanıcıyla Türkçe konuş; rapor Türkçe; Apple'a gidecek metinler (Review Notes, ret yanıtı) İngilizce.
- Kabuk erişimin yoksa Ek A'daki kalıpları kendi dosya arama aracınla uygula.

## 1. Çalışma modları

- **Mod A — Tam denetim (varsayılan):** ADIM 1–6'nın tamamı.
- **Mod B — Ret çözümü:** Kullanıcı bir ret mesajı verdiyse: (1) mesajdaki guideline numaralarını, ITMS kodlarını ve açıklamaları çıkar; (2) Ek E'den ilgili modülleri bul ve önce onları çalıştır; (3) kök nedeni bul, düzelt, doğrula; (4) aynı kök nedenin başka yerlerde tekrarlanıp tekrarlanmadığını tara; (5) sonra yeni bir ret riskini azaltmak için kalan modülleri hızlıca tara; (6) Bölüm 12'deki şablonla İngilizce Resolution Center yanıt taslağı yaz. Uygulama zaten mağazadaysa ve yalnızca hata düzeltmesi gönderiliyorsa, Apple'ın "Bug Fix Submissions" yolunu (yasal/güvenlik dışı ihlallerde hata düzeltmeleri bekletilmez) kullanıcıya hatırlat. İnceleme sonucuna katılmıyorsa App Review Board'a itiraz seçeneğini belirt.
- **Mod C — Hızlı ön kontrol:** Yalnızca M0 (tamamı), M1.1, M1.4, M1.5, M2.1, M4.4, M4.6, M4.12, M5.1, M6.1–M6.3, M6.5, M6.6; UGC varsa M7.2; yapay zekâ varsa M8.1.

## 2. Değişmez kurallar

1. **Önce keşif, sonra değişiklik.** ADIM 1–3 bitmeden dosya değiştirme.
2. **Geri alınabilir çalış.** Git varsa `git switch -c appstore-review-fixes` ile yeni dal aç; düzeltmeleri modül bazında küçük commit'lerle kaydet (ör. `fix(appstore): 5.1.1(v) uygulama içi hesap silme`). Kullanıcının commit edilmemiş değişikliklerine dokunma, onları commit etme veya stash'leme; raporda belirt.
3. **İş modelini, ürün davranışını ve hukuki metni tek başına değiştirme.** Ödeme yöntemi, fiyat, giriş yöntemleri, özellik veya SDK kaldırma, uygulama adı/ikon/marka, hukuki metin → `[KARAR]`: seçenekleri sun, onay bekle, bu sırada diğer maddelere devam et.
4. **Uydurma yok.** URL, e-posta, şirket bilgisi, demo hesap, API anahtarı, hukuki taahhüt uydurma. Gerekirse `TODO(appstore): …` yer tutucusu koy ve raporda 🔴 olarak listele (gönderimde yer tutucu metin kalması kendi başına 2.1 ret sebebidir).
5. **İnceleme sürecini kandırmaya yönelik hiçbir kod yazma:** inceleme tespiti, özellik gizleme, obfuscation, inceleme sonrası uzaktan davranış değiştirme. Bunlar 2.5.19 ve Geliştirici Davranış Kuralları ihlalidir; hesap kapatma sebebidir. Mevcutsa kaldırılmasını öner.
6. **Kanıt göster, gürültü üretme.** Her arama eşleşmesini bağlamında oku; doğrulanmamış eşleşmeyi bulgu yapma. Üçüncü taraf koddaki (Pods, node_modules, xcframework) sorunlar için SDK güncellemesi öner; vendor koduna yama yapma.
7. **Minimal ve yerel değişiklik.** Projenin mimarisine, kod stiline, tasarım sistemine, durum yönetimine ve yerelleştirme yapısına uy. Yeni bağımlılığı yalnızca gerekçeliyse ekle (ör. resmi Sign in with Apple paketi).
8. **Yerelleştirme.** Eklediğin her kullanıcıya görünen metni uygulamanın desteklediği tüm dillerde ekle (Localizable.strings/.xcstrings, ARB, i18n JSON). Purpose string'ler için `InfoPlist.strings`/`InfoPlist.xcstrings` veya yığının eşdeğeri.
9. **Bağımlılık komutları** (`pod install/update`, `npm/yarn/pnpm install`, `flutter pub upgrade`, `npx expo install`) yalnızca ilgili düzeltme için; lock dosyası farklarını raporla. Major sürüm yükseltmesi `[KARAR]`.
10. **Yıkıcı komut yok:** `rm -rf`, `pod deintegrate`, `git reset --hard`, `git clean`, `expo prebuild --clean` (ios/ klasörü commit'liyse) vb. onaysız çalıştırılmaz.
11. **İlerlemeyi görünür tut:** Görev listesi aracın varsa her modülü bir görev yap ve bitirdikçe işaretle.
12. **Soru sayısını sınırla:** ADIM 2 sonunda yanıtı düzeltmeleri değiştirecek en fazla 5 soruyu tek seferde sor; yanıt gelmezse güvenli varsayımla devam et ve varsayımı rapora yaz.

## 3. Önem seviyeleri ve etiketler

| Seviye | Anlamı |
|---|---|
| 🔴 BLOCKER | Yükleme hatası veya neredeyse kesin ret. Gönderimden önce çözülmeli. |
| 🟠 YÜKSEK | Sık görülen ret sebebi; incelemecinin fark etmesi muhtemel. |
| 🟡 ORTA | İncelemeciye/bağlama göre ret veya sonradan kaldırılma riski. |
| 🔵 DÜŞÜK | En iyi uygulama; ret olasılığı düşük. |

| Etiket | Kim yapar |
|---|---|
| `[KOD]` | Sen düzeltirsin. |
| `[BACKEND]` | Sunucu değişikliği gerekir. Depodaysa öner ve onayla uygula; değilse görev tanımı yaz. |
| `[ASC]` | Kullanıcı App Store Connect'te yapar; sen talimat ve taslak metin hazırlarsın. |
| `[KARAR]` | İş/ürün kararı; seçenekleri sun, onay bekle. |
| `[HUKUK]` | Hukuki inceleme gerekir; yalnızca "taslak" olarak işaretli metin hazırlarsın. |

---

## 4. ADIM 1 — Keşif

Çalıştır ve sonuçları not et:

```bash
uname -s; command -v xcodebuild flutter node npx pod ruby python3 rg
git status --short 2>/dev/null; git log --oneline -5 2>/dev/null
find . -maxdepth 4 \( -name "*.xcodeproj" -o -name "*.xcworkspace" -o -name "Package.swift" -o -name "pubspec.yaml" -o -name "app.json" -o -name "app.config.*" -o -name "eas.json" -o -name "capacitor.config.*" -o -name "config.xml" -o -name "Podfile" -o -name "*.csproj" -o -name "ProjectVersion.txt" \) -not -path "*/node_modules/*" -not -path "*/Pods/*" 2>/dev/null
find . \( -name "Info.plist" -o -name "*.entitlements" -o -name "PrivacyInfo.xcprivacy" -o -name "InfoPlist.strings" -o -name "InfoPlist.xcstrings" \) -not -path "*/Pods/*" -not -path "*/node_modules/*" -not -path "*/build/*" -not -path "*/DerivedData/*" 2>/dev/null
rg -n 'PRODUCT_BUNDLE_IDENTIFIER|IPHONEOS_DEPLOYMENT_TARGET|TARGETED_DEVICE_FAMILY|SUPPORTS_MACCATALYST|SDKROOT' -g '*.pbxproj' -g '*.xcconfig' . | sort -u | head -100
find . -path "*fastlane/metadata*" -name "*.txt" 2>/dev/null | head -50
ls -d .github/workflows codemagic.yaml bitrise.yml fastlane ci_scripts .xcode-version 2>/dev/null || true
```

**Yığını belirle:**

| İşaret | Yığın |
|---|---|
| `*.xcodeproj`/`*.xcworkspace`, `Package.swift` (başka işaret yoksa) | Native (Swift/SwiftUI/UIKit/Obj-C) |
| `pubspec.yaml` + `ios/Runner` | Flutter |
| `package.json` içinde `react-native`, `ios/` commit'li | React Native (bare) |
| `app.json`/`app.config.*` içinde `expo` | Expo (CNG/managed: `ios/` genellikle .gitignore'da) |
| `capacitor.config.*` | Capacitor/Ionic |
| `config.xml` + Cordova | Cordova |
| `ProjectSettings/ProjectVersion.txt` | Unity |
| `iosApp/` + `shared/` + Gradle | Kotlin Multiplatform |
| `*.csproj` içinde `net*-ios` | .NET MAUI |

**Topla:**
- Tüm hedefler (ana uygulama, widget, bildirim/paylaşım uzantıları, klavye, App Clip, watchOS, Safari uzantısı, macOS/visionOS/tvOS) ve her birinin Bundle ID'si.
- Info.plist'ler, entitlement'lar, privacy manifest'ler, purpose string yerelleştirmeleri.
- Bağımlılık listeleri (`Podfile.lock`, `Package.resolved`, `pubspec.lock`, `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`, `*.xcframework`).
- İkon ve açılış ekranı varlıkları.
- Uygulamanın desteklediği diller.
- CI yapılandırması ve kullanılan Xcode sürümü.
- Depoda meta veri varsa (fastlane `metadata/`, `screenshots/`).
- Monorepo ise backend kodu (hesap silme, moderasyon, makbuz doğrulama uç noktaları) ve web içeriği (sarmalayıcı uygulamalarda `www/`, `dist/`).
- Derleme yapabilir misin (macOS + Xcode)? Yapamıyorsan statik analizle devam edeceğini rapora yaz.

## 5. ADIM 2 — Uygulama profili

Her satırı kanıtla doldur (Evet/Hayır + dosya:satır). "Hayır" olan özelliklere bağlı modülleri "Uygulanamaz — gerekçe" diye işaretle.

| # | Özellik | Etkilenen modüller |
|---|---|---|
| 1 | Hesap oluşturma/giriş | M4.5, M4.6, M5.1, M1.4 |
| 2 | Üçüncü taraf/sosyal giriş (Google, Facebook, X, LinkedIn, Amazon, WeChat…) | M5.1, M4.7 |
| 3 | Dijital içerik/özellik satışı (IAP, abonelik, sanal para) | M6.1–M6.7, M1.5, M0.10 |
| 4 | Fiziksel ürün/hizmet satışı | M6.8 |
| 5 | Harici ödeme bağlantısı/butonu/web checkout | M6.2 |
| 6 | Reklam SDK'sı | M3.18, M4.12, M11.1 |
| 7 | Analitik/atıf/izleme SDK'ları | M4.12, M4.13, M4.21, M0.3–M0.4 |
| 8 | UGC: gönderi, yorum, profil, sohbet, yükleme | M7.2, M7.3, M11.1 |
| 9 | Yapay zekâ: LLM, görsel/ses üretimi, sohbet botu | M8, M7.2 |
| 10 | Çocuklara yönelik / Kids Category | M7.4, M4.18 |
| 11 | Sağlık/tıbbi/fitness, HealthKit | M7.5, M4.16, M4.17 |
| 12 | Konum | M4.19, M3.7 |
| 13 | Kamera, mikrofon, fotoğraf, kişiler, takvim, Bluetooth, yerel ağ, hareket, Face ID | M0.5, M4.3, M4.4 |
| 14 | Push bildirimleri (pazarlama dahil) | M9.6, M4.14, M0.9 |
| 15 | WebView ağırlıklı arayüz veya uygulama içi tarayıcı | M9.2, M3.9, M11.1 |
| 16 | OTA güncelleme, uzaktan kod, eklenti, mini uygulama | M3.6, M9.7 |
| 17 | Uzantılar (widget, klavye, Safari, App Clip, bildirim, paylaşım) | M3.16, M9.5, M3.18 |
| 18 | Kripto/NFT/finans/kredi/yatırım/sigorta | M6.9, M6.10, M4.10 |
| 19 | Kumar, çekiliş, yarışma, ganimet kutusu | M10.3, M6.4, M11.1 |
| 20 | VPN, ağ uzantısı, MDM | M10.4, M10.5 |
| 21 | Arka plan modları | M3.7 |
| 22 | Apple Pay / Wallet | M6.11, M7.6 |
| 23 | Ses/ekran/kamera kaydı | M3.14 |
| 24 | Üçüncü taraf içerik, marka, medya indirme | M10.1 |
| 25 | macOS (Mac App Store) hedefi | M3.4, M0.12 |
| 26 | Aynı kodla birden çok Bundle ID (white-label) | M9.4, M9.3 |
| 27 | Düzenlenmiş alan (bankacılık, sağlık hizmeti, kumar, havacılık, kripto borsası) | M4.10 |

**Bilinmeyenler (gerekirse tek seferde sor, en fazla 5):** yayın yapılacak storefront'lar (ABD, AB, Türkiye…); geliştirici hesabı türü (bireysel/kurumsal); Kids Category hedefi; demo hesap durumu; App Store Connect'te tanımlı IAP ürün ID'leri.

---

## 6. ADIM 3 — Denetim modülleri

Her kontrolün biçimi: **ID Başlık** — seviye · etiket · *kural kaynağı*, ardından **Kural / Ara / Düzelt**. Arama kalıpları Ek A'da modül bazında toplanmıştır.

### M0 — Yükleme ve binary engelleri (her projede çalıştır)

**M0.1 Xcode ve SDK sürümü** — 🔴 · `[KOD]`/`[ASC]` · *Upcoming Requirements*
- **Kural:** 28 Nisan 2026'dan beri App Store Connect'e yüklenen derlemeler Xcode 26 veya üstüyle, iOS/iPadOS/tvOS/visionOS/watchOS 26 SDK'larıyla derlenmiş olmalı.
- **Yaklaşan (Apple duyuruları, 9 Eylül ve 5 Ekim 2026):** Nisan 2027'den itibaren iOS/iPadOS uygulamaları iOS 27 ve iPadOS 27 SDK'sıyla (tvOS, visionOS, watchOS uygulamaları kendi 27 SDK'larıyla) derlenmiş olmalı; aynı tarihten itibaren gönderilen uygulamalar iPhone Duo ekran görüntüleri de içermeli `[ASC]`. Raporda tarih ve hazırlık durumunu belirt.
- **Ara:** `.xcode-version`, `.github/workflows/*`, `codemagic.yaml`, `bitrise.yml`, `eas.json` (`image`), `fastlane/Fastfile`, `ci_scripts/`; yerelde `xcodebuild -version`.
- **Düzelt:** CI imajını/Xcode sürümünü 26+ yap. Flutter, React Native, Expo SDK, Capacitor, Unity sürümünün Xcode 26 uyumunu kontrol et; yükseltme gerekiyorsa `[KARAR]`.

**M0.2 Minimum dağıtım hedefi** — 🔴 · `[KOD]` · *Upcoming Requirements*
- **Kural:** 9 Eylül 2026'dan beri iOS/iPadOS uygulamaları en az iOS 13'ü hedeflemeli.
- **Ara:** `IPHONEOS_DEPLOYMENT_TARGET` (pbxproj, xcconfig), Podfile `platform :ios`, `Package.swift` `platforms`, Flutter `ios/Podfile` ve `ios/Flutter/AppFrameworkInfo.plist` (`MinimumOSVersion`), Expo `expo-build-properties` → `ios.deploymentTarget`, Capacitor `ios/App/Podfile`.
- **Düzelt:** Yalnızca 13'ün altındaysa uzantılar dahil tüm hedeflerde en az 13'e yükselt; gerekirse Podfile `post_install` içinde Pod hedeflerini eşitle.

**M0.3 Uygulamanın privacy manifest'i (Required Reason API)** — 🔴 · `[KOD]` · *DPLA 3.3.3(B), Upcoming Requirements*
- **Kural:** Uygulama kodu Ek C'deki "required reason" API'lerinden birini kullanıyor ve `PrivacyInfo.xcprivacy` içinde onaylı gerekçesi yoksa yükleme reddedilir (ITMS-91053; 1 Mayıs 2024'ten beri). Gerekçeler gerçek kullanımı yansıtmalı; bu API'ler ve türetilen veri izleme için kullanılamaz. Required reason API kullanan her yürütülebilir dosya/dinamik kütüphanenin paketinde manifest bulunmalı.
- **Ara:** `rg --files . | rg 'PrivacyInfo\.xcprivacy$'`; Ek A/M0 kalıbıyla uygulama kodundaki API kullanımları (UserDefaults ve `@AppStorage` neredeyse her projede vardır).
- **Düzelt:** Ana uygulama hedefinde (ve required reason API kullanan kendi framework/uzantı hedeflerinde) manifest oluştur veya güncelle (şablon Ek C). Dosya hedefin kaynaklarına (Copy Bundle Resources) dahil olmalı; Xcode 16+ "synchronized folder" yapısında klasöre koymak yeterlidir. `NSPrivacyTracking`, `NSPrivacyTrackingDomains` ve `NSPrivacyCollectedDataTypes` alanlarını M4.21'deki gerçek veri akışıyla tutarlı doldur. Yığına özel konumlar Ek F'de.

**M0.4 Üçüncü taraf SDK manifest'i ve imzası** — 🔴 · `[KOD]`/`[KARAR]` · *Third-party SDK requirements, DPLA 3.3.3(B)*
- **Kural:** Ek D'deki SDK'lardan biri (veya onu yeniden paketleyen bir SDK) yeni bir uygulamada ya da onu ekleyen bir güncellemede bulunuyorsa SDK'nın kendi privacy manifest'i olmalı; ikili (binary) bağımlılıksa imzası da. Eksikse yükleme ITMS-91061 gibi hatalarla döner. Bir SDK'nın beyanını senin manifest'in düzeltemez.
- **Ara:** Lock dosyaları ve `*.xcframework`'ler; ilgili SDK paketinde `PrivacyInfo.xcprivacy` var mı.
- **Düzelt:** Manifest içeren sürüme yükselt (patch/minor → uygula ve derle; major → `[KARAR]`). Bakımı bırakılmış SDK için alternatifi rapora yaz.

**M0.5 Purpose string'ler (izin açıklamaları)** — 🔴 · `[KOD]` · *5.1.1(ii), App Review Help*
- **Kural:** Korumalı bir kaynağa erişen her API için Info.plist'te ilgili `NS…UsageDescription` bulunmalı; eksikse yükleme hatası (ITMS-90683) veya çalışma anında çökme olur. Metin, kaynağın hangi özellik için kullanıldığını somut bir örnekle anlatan, etken çatılı, tek ve tam bir cümle olmalı. "Daha iyi bir deneyim için" gibi belirsiz ya da yalnızca kaynağın adını tekrarlayan metinler reddedilir. Uygulama birden çok dili destekliyorsa purpose string'ler de yerelleştirilmeli. Bir SDK'nın referans verdiği API'ler de senin sorumluluğundadır: kullanım geçerliyse açıklama ekle; değilse o API referansını ikiliden çıkar.
- **Ara:** Kodda kullanılan korumalı API'leri mevcut anahtarlarla eşleştir (Ek B tablosu, Ek A/M0 ve M4 kalıpları).
- **Düzelt:** Eksik anahtarları ekle, belirsizleri Ek B kalıbıyla yeniden yaz, yerelleştir. Bir anahtarı yalnızca ilgili API ikilide hiç yoksa kaldır. React Native `react-native-permissions` ve Flutter `permission_handler` kullanıyorsan yalnızca kullanılan izin modüllerini etkinleştir (Ek F).

**M0.6 UIWebView** — 🔴 · `[KOD]` · *2.5.1*
- **Kural:** Apple, UIWebView referansı içeren uygulamaları kabul etmez (ITMS-90809).
- **Ara:** Kaynak kodda `UIWebView`; derlenmiş framework'ler için `grep -rl UIWebView ios Pods 2>/dev/null`.
- **Düzelt:** Kendi kodunda `WKWebView`'e geç; SDK'daysa güncelle veya değiştir.

**M0.7 İkon ve açılış ekranı** — 🔴 · `[KOD]`
- **Kural:** Klasik `AppIcon.appiconset` kullanılıyorsa 1024×1024 App Store ikonu saydamlık/alfa kanalı içermemeli (ITMS-90717). Açılış ekranı `UILaunchStoryboardName` veya `UILaunchScreen` ile tanımlı olmalı.
- **Ara:** macOS'ta `sips -g hasAlpha <png>`; Linux'ta Pillow varsa `python3 -c "from PIL import Image;print(Image.open('icon.png').mode)"` (RGBA → alfa var).
- **Düzelt:** Alfasız ikon üret; açılış ekranı tanımını ekle. Icon Composer (`.icon`) kullanılıyorsa Xcode 26 arşiv doğrulamasının sonucunu raporla.

**M0.8 iPad yönelimleri ve pencere davranışı** — 🟠 · `[KOD]` · *2.4.1*
- **Kural:** iPad'i destekleyen uygulama Xcode arşiv doğrulamasından geçmeli; çoklu görev için tüm yönelimler (aksi halde geçerli bir tam ekran gerekçesi) beklenir — eski tipik hata ITMS-90474. iPadOS 26'da pencereler yeniden boyutlandırılabilir; düzen her boyutta çalışmalı.
- **Ara:** `UISupportedInterfaceOrientations~ipad`, `UIRequiresFullScreen`, `TARGETED_DEVICE_FAMILY`.
- **Düzelt:** Yönelim listesini tamamla; sabit genişlik varsayımlarını kaldır (M3.1).

**M0.9 Entitlement ve capability tutarlılığı** — 🟠 · `[KOD]`/`[ASC]` · *2.5.1, Upcoming Requirements*
- Push kaydı yapılıyorsa `aps-environment` olmalı (yoksa ITMS-90078 uyarısı gelir, push çalışmaz).
- Game Center özellikleri varsa Game Center entitlement'ı ve App Store Connect'te Game Center yapılandırması gerekir (16 Ağustos 2023'ten beri gönderim şartı).
- Sign in with Apple varsa `com.apple.developer.applesignin`.
- HealthKit, HomeKit, NFC, Siri, CarPlay vb. entitlement'lar gerçekten kullanılan ve açıklamada belirtilen özelliklerle eşleşmeli; kullanılmayanları kaldır (2.5.1: framework'ler amacına uygun kullanılmalı ve açıklamada belirtilmeli).

**M0.10 Satın alma doğrulaması** — 🟠 · `[KOD]`/`[BACKEND]` · *2.1(b), Upcoming Requirements*
- **Kural:** Cihaz üzerinde makbuz doğrulayan uygulamalar SHA-256 ara sertifikasını desteklemeli (SHA-1 ara sertifikası 24 Ocak 2025'te sona erdi). İnceleme sandbox ortamında yapılır; sunucu tarafı doğrulama sandbox işlemlerini de kabul etmeli.
- **Düzelt:** Tercihen StoreKit 2 `Transaction`/`AppTransaction` doğrulaması veya App Store Server API. Eski `verifyReceipt` kullanılıyorsa production yanıtı "sandbox makbuzu" (21007) dediğinde sandbox uç noktasına düşen mantık ekle.

**M0.11 Şifreleme ihracat beyanı** — 🔵 · `[KOD]`/`[ASC]`
- `ITSAppUsesNonExemptEncryption` yoksa her derlemede soru sorulur. Uygulama yalnızca işletim sisteminin sağladığı HTTPS/TLS gibi standart şifrelemeyi kullanıyorsa genellikle `NO` uygundur. Başka bir şifreleme kullanımı varsa anahtarı ekleme; `[ASC]`/`[HUKUK]` olarak raporla.

**M0.12 macOS hedefleri** — 🔴 (varsa)
- Mac App Store ve TestFlight macOS derlemelerinde hiçbir dosyada `com.apple.quarantine` özniteliği bulunmamalı (18 Şubat 2025'ten beri yükleme şartı). Diğer Mac kuralları M3.4'te.

**M0.13 Arşiv doğrulaması** — 🔵
- macOS, Xcode ve imzalama erişimin varsa arşivle ve doğrula. Yoksa kullanıcının yapılacaklar listesine Xcode Organizer'da **Validate App** ve **Generate Privacy Report** adımlarını ekle.

### M1 — Uygulama bütünlüğü ve kararlılık (2.1, 2.2)

**M1.1 Çökme ve takılma riskleri** — 🔴 · `[KOD]` · *2.1(a), DPLA 3.3.1(E)*
- **İnceleme koşullarını varsay:** gerçek cihaz; gerçek ağ (IPv6 dahil); iPad (iPhone uygulaması uyumluluk modunda bile); temiz kurulum; tüm izinlerin reddedilmesi; ağ yok/yavaş; boş hesap; arka plana alıp geri dönme.
- **Ara:** Açılış yolu ve ilk ekranlar; izin reddi dalları; ağ hata yönetimi; kritik akışlarda `!`, `try!`, `as!`, `fatalError`, `precondition`; Dart'ta `!` ve başlatılmamış `late`; JavaScript'te yakalanmamış Promise reddi ve `undefined` erişimi.
- **iPad'e özgü bilinen çökmeler:** `UIActivityViewController` veya `.actionSheet` stilli `UIAlertController`, `popoverPresentationController` için `sourceView`/`sourceRect` ya da `barButtonItem` verilmeden sunulursa iPad'de çöker. Flutter `share_plus` iPad'de `sharePositionOrigin` ister; React Native `ActionSheetIOS` ve `Share.share` iPad'de `anchor` ister.
- **Düzelt:** Güvenli açma, hata ve boş durum ekranları, zaman aşımları, popover kaynakları.

**M1.2 Yer tutucu ve yarım içerik** — 🟠 · `[KOD]`/`[KARAR]` · *2.1(a)*
- Lorem ipsum, "Yakında/Coming soon", boş sekme veya ekran, hiçbir şey yapmayan buton, test verisi, kırık bağlantı (gizlilik, koşullar, destek dahil), boş web sayfası. Ön siparişe açılan sürüm de final olmalı.
- **Düzelt:** Metinleri düzelt; bağlantıları doğrula (erişim varsa `curl -sSIL <url>`; yoksa listele). Bitmemiş özelliği release derlemesinden **derleme zamanında** çıkar (`#if`, flavor, build config) — uzaktan açılabilen "uyuyan" özellik olarak bırakma (2.5.19). Özellik kaldırmak `[KARAR]`.

**M1.3 Ortam ve test kalıntıları** — 🟠 · `[KOD]`
- Release'te localhost/staging uç noktaları, test anahtarları, açık debug menüleri, sahte giriş, sabit test kullanıcıları, hassas veri loglama.
- **Düzelt:** Release yapılandırmasının production'a baktığını doğrula (xcconfig, scheme, flavor, `.env.production`, `app.config` `extra`); debug araçlarını `#if DEBUG` veya eşdeğerinin arkasına al.

**M1.4 İncelemeciye tam erişim** — 🔴 · `[ASC]`/`[BACKEND]` · *2.1(a), Before You Submit, App Review Help*
- Giriş varsa çalışan demo hesap; birden çok hesap türü varsa (yönetici, kullanıcı…) her biri için ayrı hesap; otomatik yenilenen abonelik varsa **süresi dolmuş aboneliği olan** bir demo hesap; giriş ek kod (OTP/SMS/2FA) istiyorsa kod Review Notes'ta önceden verilmeli — aksi halde telefon görüşmesi gerekebilir ve genellikle 3–5 iş günü sürer.
- QR kod gerekiyorsa örnek QR kod; uygulama çalışmak için donanım gerektiriyorsa uygulamanın fiziksel bir Apple cihazında o donanımla eşleşip çalıştığını gösteren bir video (ekran kaydı değil).
- Demo hesap yasal/güvenlik nedeniyle verilemiyorsa, tüm özellikleri gösteren uygulama içi demo modu ancak Apple'ın ön onayıyla kullanılabilir.
- **Kodda kontrol:** Demo hesap normal akışla giriş yapabiliyor mu (cihaz/ülke/IP kısıtı, davet kodu, SMS zorunluluğu)? Sabit OTP gerekiyorsa yalnızca o test hesabı için `[BACKEND]` öner ve Review Notes'ta açıkça belirt — belgelenmiş test hesabı, gizli arka kapı değil.
- Backend inceleme boyunca canlı olmalı; erişilemezse uygulama çökmemeli, anlaşılır hata göstermeli.

**M1.5 IAP'ler görünür ve çalışır** — 🔴 · `[KOD]`/`[ASC]` · *2.1(b), App Review Help*
- App Store Connect'te tanımlı her IAP uygulamada bulunabilir, güncel ve satın alınabilir olmalı; bulunamayan varsa nedeni Review Notes'ta yazmalı. Ürün bilgisi StoreKit'ten çekilmeli (fiyat/ad sabit yazılmamalı). Ücretli IAP'lerin çalışması için **Paid Apps Agreement** aktif olmalı; IAP'ler "Ready for Review" durumuna gelince incelemeye gönderilmeli (uygulamanın ilk IAP'leri yeni bir uygulama sürümüyle birlikte gönderilir); IAP'lerin incelemede çalışması için önceden onaylanmış olmaları gerekmez; storefront/cihaz kısıtları notlarda belirtilmeli.
- **Ara:** Koddaki ürün ID'lerini ASC listesiyle (kullanıcıdan veya StoreKit Configuration dosyasından) karşılaştır.

**M1.6 Beta/demo ifadeleri** — 🟠 · `[KOD]` · *2.2*
- Uygulamanın kendisini "beta", "test sürümü", "demo version" olarak tanıtan ad veya arayüz metinleri (bunlar TestFlight'a aittir). 3.1.1'deki "XX-day Trial" IAP adlandırması istisnadır.

### M2 — Gizli özellik yasağı ve doğru meta veri (2.5.19, 2.3)

**M2.1 Gizli, uyuyan veya belgelenmemiş özellik** — 🔴 · `[KOD]`/`[KARAR]` · *2.5.19 (16 Ekim 2026'da 2.3.1'den ayrılarak eklendi), 2.3.1(a), DPLA 3.2*
- **Kural:** Uygulamada gizli, uyuyan veya belgelenmemiş özellik olamaz; işlevler kullanıcıya ve App Review'a açık olmalı. Özellikleri obfuscation vb. yöntemlerle ikilide saklamak uygulamanın kaldırılması ve geliştirici hesabının kapatılması sebebidir. İnceleme sonrası değişikliklerle ürünün kimliği/amacı/davranışı hakkında yanıltmak DPLA'ya da aykırıdır. 2.5.19, incelemede uygulamanın ne yaptığını yanlış gösterip onaydan sonra değişmeyi de açıkça kapsar: incelemeye gönderilen sürümde olmayan özellik veya işlevi onaydan sonra eklemek ("bait-and-switch"; ör. onaydan sonra açılan "nudification" özelliği) App Store'dan ve Apple Developer Program'dan çıkarılma sebebidir (Apple duyurusu, 16 Ekim 2026). OTA güncellemeler ve uzaktan yapılandırma da bu kapsamdadır (M3.6).
- **Ara:** İnceleme tespiti (`isReview`, `reviewMode`, Apple IP aralığı `17.x` kontrolü, Cupertino/ABD konum kontrolü, sandbox makbuzuna göre farklı içerik); tarih/sürüm/ülke bazlı gizli açılımlar; uzaktan yapılandırmayla (Firebase Remote Config, LaunchDarkly, Statsig, GrowthBook…) açılan ve incelemede kapalı tutulan özellikler; gizli "admin/dev" ekranları; kodda kodlanmış/şifrelenmiş URL veya ekran adları.
- **Düzelt:** İnceleme tespitini kaldır. Uzaktan bayraklı bir özellik varsa ya incelemede açık ve erişilebilir olsun ve Review Notes'ta spesifik anlatılsın ya da release'ten derleme zamanında çıkarılsın `[KARAR]`. Uygulamanın amacını değiştirmeyen A/B sunum farklarını notlarda belirt.

**M2.2 Yanıltıcı pazarlama ve sahte işlev** — 🟠 · `[KOD]`/`[ASC]` · *2.3.1(a), 1.1.6*
- iOS'ta yapılamayan işlevler ("virüs/zararlı yazılım tarayıcı", "RAM temizleyici", "pil doktoru"); gerçekte olmayan içerik/hizmet vaadi; sahte fiyat veya indirim — App Store içinde veya dışında. "Sadece eğlence amaçlı" ibaresi sahte işlevi meşrulaştırmaz.

**M2.3 Diğer platform referansları** — 🟠 · `[KOD]` · *2.3.10*
- Onaylı etkileşimli işlev yoksa uygulama içinde veya meta veride başka mobil platformların ya da alternatif uygulama pazarlarının adı, ikonu, rozeti.
- **Ara:** Kullanıcıya görünen metinler, görsel varlık adları (`google_play*`, `android*`, `play_store*`), sarmalayıcı uygulamalarda web içeriğindeki "Google Play'den indir" rozetleri. `android/` klasörünü hariç tut.
- **Düzelt:** iOS derlemesinde gösterme (platforma göre koşullu render; web içeriğinde platform tespiti).

**M2.4 Ad, ikon ve meta veri tutarlılığı** — 🟠 · `[KOD]`/`[ASC]` · *2.3.2, 2.3.7, 2.3.8, 2.3.12*
- App Store adı en fazla 30 karakter; ad, alt başlık ve ekran görüntülerinde fiyat veya meta veri türüne uymayan ifade yok; anahtar kelimelerde marka, popüler uygulama adı, fiyat yok; alt başlık başka uygulamalara atıf yapmamalı ve doğrulanamaz iddia içermemeli.
- Cihazdaki ad (`CFBundleDisplayName`) ve ikonlar (küçük, büyük, Apple Watch, alternatif ikonlar) mağazadakiyle karışıklık yaratmayacak kadar benzer olmalı. İkon, IAP ikonu, ekran görüntüsü ve önizlemeler uygulamanın derecesi yüksek olsa bile 4+ uygun olmalı. "Çocuklar için/For Kids/For Children" ifadeleri yalnızca Kids Category'de.
- **Depoda fastlane/metadata varsa** doğrudan denetle ve düzelt: `name.txt` (≤30), `subtitle.txt`, `keywords.txt`, `description.txt` (ek satın alma gerektiren öğeler belirtilmeli; abonelik varsa Kullanım Koşulları/EULA bağlantısı — M6.5), `release_notes.txt` (önemli değişiklikler spesifik yazılmalı), `privacy_url.txt`, `support_url.txt`.

**M2.5 Mağaza görselleri ve diğer alanlar** — 🟡 · `[ASC]` · *2.3.3, 2.3.4, 2.3.5, 2.3.9, 2.3.11, 2.3.13, 2.3.14*
- Ekran görüntüleri uygulamayı kullanımda göstermeli (yalnızca başlık görseli, giriş veya açılış ekranı değil). Önizlemeler yalnızca uygulamanın ekran kayıtları olmalı. Gerçek kişi verisi yerine kurgusal hesap bilgisi; görsellerdeki tüm materyallerin kullanım hakkı. En uygun kategori.
- Ön sipariş: yayınlanan sürüm ön siparişte tanıtılandan esaslı olarak farklı olmamalı; iş modeli değişirse ön satış yeniden başlatılmalı.
- In-app event meta verisi etkinliğe özgü, tarih/saatleri doğru, derin bağlantısı doğru yere gitmeli.
- **Creative asset'ler (2.3.14, yeni):** uygulamanın içeriği/işlevi veya markasıyla ilgili, tüm kitlelere uygun; yanıltma amaçlı başka uygulama referansı, doğrulanamaz iddia, belirli veya indirimli fiyat bilgisi yok.

### M3 — Donanım ve yazılım gereksinimleri (2.4, 2.5)

**M3.1 iPad uyumluluğu** — 🔴 · `[KOD]` · *2.4.1, DPLA 3.3.1(E), App Review Help*
- iPhone uygulaması iPhone'a özgü bir donanıma bağımlı değilse iPad'den indirilebilir. 2.4.1'e göre iPhone uygulamaları mümkün olduğunca iPad'de çalışmalı; DPLA 3.3.1(E)'ye göre uyumluluk modunda **iPhone'daki özellik ve işlevlerin en azından aynısını** sunmalı (cihazda bulunmayan donanıma bağlı özellikler hariç); orada çökmemeli veya kullanılamaz hale gelmemeli. Xcode'da iPad'i desteklenen hedeflerden çıkarmak bunu engellemez. `UIRequiredDeviceCapabilities` yalnızca gerçek donanım bağımlılıkları için kullanılmalı, dağıtım tercihi için değil.
- **iPhone Duo** (23 Ekim 2026'dan itibaren satışta, iOS 27.1): Apple uygulamaları Xcode 27.1 ile yeniden derleyip farklı pozlarda ve yönelimlerde Device Hub ile kontrol etmeyi öneriyor; sabit boyut ve yönelim varsayımları burada da düzeni bozar.
- **Ara:** Sabit ekran boyutu varsayımları, sabit genişlikli düzenler, yönelim kilitleri, `userInterfaceIdiom == .pad` dallarında eksik işlev, popover çökmeleri (M1.1), iPad'de bulunmayabilecek donanım (telefon, bazı sensörler) için alternatif yol.

**M3.2 Pil, ısı, cihaz kaynakları** — 🟡 · *2.4.2*
- Reklamlar dahil ilgisiz arka plan işlemi (ör. kripto madenciliği) yok; aşırı disk yazımı, gereksiz sürekli GPS/sensör kullanımı, durmayan timer/animasyon yok; cihazı yastık/şilte altında şarj etmeyi öneren yönlendirme yok.

**M3.3 Yeniden başlatma veya sistem ayarı isteme** — 🟡 · *2.4.4*
- Kullanıcıdan cihazı yeniden başlatmasını veya temel işlevle ilgisiz sistem ayarlarını değiştirmesini isteme (Wi-Fi'yi kapat, güvenlik özelliğini devre dışı bırak vb.). Uygulamanın kendi ayar sayfasına (`openSettingsURLString`) yönlendirmek serbesttir.

**M3.4 Mac App Store hedefi** — 🔴 (varsa) · *2.4.5*
- Uygun sandbox; Xcode ile paketleme, üçüncü taraf yükleyici yok; tek, kendi kendine yeterli paket; onaysız oturum açılışında başlatma veya uygulama kapandıktan sonra çalışan süreç yok; Dock/masaüstüne otomatik kısayol yok; işlev ekleyen ek kod/uygulama/kext indirme yok; root yetkisi veya setuid yok; açılışta lisans ekranı, lisans anahtarı veya kendi kopya koruması yok; güncellemeler yalnızca Mac App Store'dan (**Sparkle vb. kendi güncelleyicileri kaldır**); Java gibi kullanımdan kalkmış/isteğe bağlı teknolojiler yok; tüm yerelleştirmeler tek pakette.

**M3.5 Yalnızca genel (public) API ve zararlı kod** — 🔴 · `[KOD]` · *2.5.1, 2.5.3, DPLA 3.3.1(A)*
- Özel API kullanımı (`_` önekli seçiciler, `valueForKey:@"_…"`, `LSApplicationWorkspace`, sistem framework'ünü `dlopen`/`dlsym` ile yükleme vb.); kaldırılacak teknolojilerin kullanımı. Framework'ler amacına uygun kullanılmalı (HealthKit sağlık/fitness ve Sağlık uygulamasıyla entegrasyon, HomeKit ev otomasyonu için) ve bu entegrasyon açıklamada belirtilmeli. İşletim sisteminin veya push bildirimleri, Game Center gibi donanım/hizmet özelliklerinin normal çalışmasına zarar verebilecek virüs, dosya veya kod iletmek yasaktır (2.5.3).

**M3.6 İndirilen/çalıştırılan kod ve OTA güncellemeler** — 🔴 · `[KOD]`/`[KARAR]` · *2.5.2, DPLA 3.3.1(B), 4.7*
- **Kural:** Uygulama paketinin içinde kendi kendine yeterli olmalı ve kendisine ayrılan kapsayıcı (container) alanı dışında veri okuyup yazamaz; özellik ekleyen veya değiştiren kodu indirip kuramaz/çalıştıramaz. Yorumlanan kod (ör. JavaScript) ancak uygulamanın incelenen ana amacını değiştirmiyorsa, imza/sandbox/güvenlik özelliklerini atlatmıyorsa ve başka uygulamalar için mağaza oluşturmuyorsa indirilebilir. Programlama öğreten uygulamalar sınırlı istisnadır (kaynak kod kullanıcıya tamamen görünür ve düzenlenebilir olmalı).
- **Ara:** JSPatch/Rollout benzeri yama sistemleri; indirilen ikilinin `dlopen` ile yüklenmesi; uzaktan JS'in `JSContext`/`eval` ile çalıştırılması; Expo Updates/EAS Update, CodePush türevleri, Shorebird; uzaktan yüklenen web paketinin native köprülere erişmesi; Capacitor `server.url`'ün production'da uzak siteye bakması.
- **Düzelt/raporla:** OTA mekanizması kalabilir; ancak yalnızca hata düzeltme ve içerik için kullanılmalı, yeni özellik veya amaç değişikliği incelemeden geçen bir sürümle gelmeli — bu politikayı rapora açıkça yaz. Capacitor `server.url` production'da tanımlıysa kaldır ve web varlıklarını pakete göm `[KARAR]` (ayrıca M9.2).

**M3.7 Arka plan modları** — 🟠 · `[KOD]` · *2.5.4, DPLA 3.3.1(F)*
- `UIBackgroundModes` içindeki her değer gerçek bir özelliğe karşılık gelmeli: `audio` → arka planda ses çalma/kayıt; `location` → arka planda konum özelliği (Always izni ve gerekçe); `voip` → PushKit + CallKit; `fetch`/`processing` → `BGTaskScheduler` ve `BGTaskSchedulerPermittedIdentifiers`; `remote-notification` → sessiz push işleme; `bluetooth-central`/`bluetooth-peripheral`, `external-accessory`, `nearby-interaction` vb. ilgili özellik.
- **Düzelt:** Kullanılmayan modları kaldır; kalanların nasıl test edileceğini Review Notes'a ekle.

**M3.8 IPv6** — 🟠 · `[KOD]` · *2.5.5*
- Uygulama yalnızca IPv6 (NAT64) ağda tam çalışmalı. Sabit IPv4 adresleri (`http://1.2.3.4`), `inet_addr`, `gethostbyname`, yalnızca `AF_INET` soketleri, IPv4 adresle `SCNetworkReachability` sorun çıkarır.
- **Düzelt:** Alan adıyla `URLSession`/`Network.framework` (`NWConnection`, `NWPathMonitor`); IP sabitlerini alan adına çevir (`[BACKEND]` DNS gerekebilir).

**M3.9 Web tarama motoru** — 🔴 · *2.5.6*
- Web'de gezinme sunan uygulamalar uygun WebKit framework'ünü ve WebKit JavaScript'i kullanmalı (`WKWebView`, `SFSafariViewController`). Alternatif tarayıcı motoru yalnızca ilgili entitlement ile (AB ve Japonya).

**M3.10 Sistem davranışlarını değiştirme** — 🟠 · *2.5.8, 2.5.9*
- Alternatif masaüstü/ana ekran ortamı oluşturma yok. Ses açma/kısma tuşları, zil/sessiz anahtarı ve diğer yerel arayüz öğe/davranışları değiştirilmemeli veya devre dışı bırakılmamalı; diğer uygulamalara giden bağlantılar engellenmemeli. Kamera deklanşörü için ses tuşu gerekiyorsa `outputVolume` gözleme hileleri yerine `AVCaptureEventInteraction` (iOS 17.2+) kullan.

**M3.11 Siri, Kısayollar, App Intents** — 🟡 · *2.5.11*
- Yalnızca uygulamanın başka bir uygulamaya ihtiyaç duymadan karşılayabildiği ve kullanıcının beklediği niyetler; plist'teki sözlük ve takma adlar uygulama veya şirket adıyla ilgili olmalı (genel terim veya başka uygulama/hizmet adı değil); istek ile sonuç arasında reklam/pazarlama yok; belirsizlik giderme sorusu yalnızca gerektiğinde.

**M3.12 Çağrı/SMS engelleme ve spam tespiti** — 🔴 (varsa) · *2.5.12*
- CallKit veya SMS Fraud Extension yalnızca doğrulanmış spam numaraları engellemeli; engelleme/spam özelliği ve ölçütleri pazarlama metninde açıklanmalı; bu araçlarla erişilen veri uygulamanın işletimi/iyileştirilmesi dışında (izleme, profil oluşturma, satış) kullanılamaz.

**M3.13 Yüz tanımayla kimlik doğrulama** — 🔴 (varsa) · *2.5.13*
- Hesap kimlik doğrulamasında mümkünse `LocalAuthentication` (ARKit veya başka yüz tanıma değil); 13 yaş altı kullanıcılar için alternatif doğrulama yöntemi.

**M3.14 Kayıt göstergesi ve açık onay** — 🔴 · `[KOD]` · *2.5.14, DPLA 3.3.3(A)*
- Kamera, mikrofon, ekran kaydı veya diğer kullanıcı girdilerini kaydeden/loglayan her özellik açık kullanıcı onayı almalı ve kayıt sürerken açık görsel ve/veya işitsel gösterge sunmalı. Başkalarını habersiz kaydetmeye yönelik tasarım yasak.

**M3.15 Dosya seçiciler** — 🟡 · *2.5.15*
- Dosya görüntüleme/seçme sunan uygulamalar Dosyalar uygulamasındaki öğeleri ve iCloud belgelerini de sunmalı (`UIDocumentPickerViewController`, SwiftUI `.fileImporter`).

**M3.16 Widget, uzantı, bildirim, App Clip** — 🟠 · *2.5.16, 4.4*
- Uygulamanın içeriği ve işleviyle ilgili olmalı. App Clip'teki tüm özellik ve işlevler ana uygulamada da bulunmalı; App Clip'te reklam olamaz.

**M3.17 Matter** — 🔴 (varsa) · *2.5.17*
- Eşleştirme Apple'ın Matter destek framework'üyle başlatılmalı; Apple'ın Matter SDK'sı dışındaki Matter bileşenleri CSA sertifikalı olmalı.

**M3.18 Reklamlar** — 🔴 · `[KOD]` · *2.5.18*
- Görüntülü reklam yalnızca ana uygulama ikilisinde olmalı; uzantı, App Clip, widget, bildirim, klavye ve watchOS uygulamasında olmamalı.
- Reklamlar yaş derecesine uygun olmalı; kullanıcı, uygulamadan çıkmadan kendisini hedeflemek için kullanılan tüm bilgileri görebilmeli; sağlık/tıbbi (ör. HealthKit), okul (ör. ClassKit) verisi veya çocuklardan (Kids Category) gelen veriyle hedefli/davranışsal reklam yok.
- Deneyimi kesen (interstitial) reklamlar reklam olduğunu açıkça belirtmeli, kullanıcıyı tıklamaya kandırmamalı ve kolay erişilen, görünür, yeterince büyük kapat/geç düğmesi sunmalı.
- Uygunsuz veya yaşa uygun olmayan reklamları **bildirme imkânı** olmalı.
- **Düzelt:** Uzantı hedeflerinden reklam SDK'sını kaldır; "Uygunsuz reklamı bildir" girişi ekle (ayarlardan form/e-posta veya ağın kendi bildirim aracı); kapatma gecikmesi ve yanıltıcı yerleşimleri düzelt.

**M3.19 Diğer platformlar** — 🟡 (varsa) · *2.4.3, 2.5.18*
- tvOS: Siri Remote veya üçüncü taraf oyun kumandası dışında donanım gerektirmemeli; kumanda zorunluysa meta veride belirt. watchOS uygulamasında reklam yok. visionOS/macOS için ilgili purpose string'ler (Ek B).

### M4 — Gizlilik, veri ve güvenlik (5.1, 1.6)

**M4.1 Gizlilik politikası** — 🔴 · `[ASC]`/`[KOD]`/`[HUKUK]` · *5.1.1(i), DPLA 3.3.3(C)*
- Bağlantı hem App Store Connect'teki Privacy Policy alanında hem uygulama içinde kolay erişilebilir yerde olmalı (Ayarlar/Hakkında; kayıt ve ödeme ekranlarında da önerilir).
- Politika açıkça şunları içermeli: hangi verilerin nasıl toplandığı ve tüm kullanım amaçları; verinin paylaşıldığı üçüncü tarafların (analitik, reklam ağları, SDK'lar, ana/bağlı şirketler) aynı veya eşdeğer koruma sağlayacağının teyidi; saklama/silme politikası; rızanın nasıl geri alınacağı ve verilerin silinmesinin nasıl isteneceği.
- **Düzelt:** Uygulama içi bağlantı yoksa ekle. Politikaya erişebiliyorsan M4.11 ve M4.21'deki gerçek veri akışıyla karşılaştır; eksik bölümleri listele, gerekirse `docs/privacy-policy-draft.md` taslağı üret (`[HUKUK]`). Türkiye'deki kullanıcılar için KVKK aydınlatma yükümlülüğü ve yurt dışına veri aktarımı (ör. ABD'deki bulut/AI sağlayıcıları) ayrıca hukukçuyla değerlendirilmeli.

**M4.2 Rıza ve rızayı geri alma** — 🟠 · `[KOD]` · *5.1.1(ii)*
- Kullanıcı veya kullanım verisi toplayan uygulamalar, veri toplandığı anda anonim sayılsa bile rıza almalı. Ücretli işlevler bu verilere erişim iznine bağlanamaz. Rızayı geri almanın kolay ve anlaşılır bir yolu olmalı (ör. Ayarlar'da analitik/kişiselleştirme anahtarları). GDPR'daki "meşru menfaat" dayanağıyla rızasız veri toplanıyorsa yasanın tüm şartlarına uyulmalı.

**M4.3 Veri minimizasyonu ve sistem seçicileri** — 🟠 · `[KOD]` · *5.1.1(iii)*
- Yalnızca temel işlev için gereken veriye erişim. Mümkünse tam erişim yerine süreç dışı seçiciler: fotoğraflar için `PHPickerViewController`/SwiftUI `PhotosPicker` (okuma izni gerektirmez; Fotoğraflar'a kaydetmek için yalnızca `NSPhotoLibraryAddUsageDescription`), kişiler için `CNContactPickerViewController`, dosyalar için belge seçici, paylaşım için share sheet.
- **Düzelt:** Tam erişimi yalnızca seçim için kullanan akışları seçicilere taşı; artık gereksiz olan izin anahtarlarını kaldır.

**M4.4 İzin isteme deneyimi** — 🔴 · `[KOD]` · *5.1.1(iv), HIG Privacy*
- Kullanıcının izin kararına saygı; gereksiz veri erişimine kandırma veya zorlama yok. Örnek: fotoğraf paylaşmak için mikrofon izni şart koşulamaz. Reddedilirse mümkün olan alternatifi sun (ör. konum yerine adresi elle girme).
- **Sistem izin uyarısından önce özel bir açıklama ekranı gösteriyorsan** (App Review'un sık ret sebebi):
  - Ekranda tek bir düğme olmalı ve "Devam"/"İleri" (Continue/Next) gibi adlandırılmalı; "İzin ver/Allow" ya da benzeri **kullanma**.
  - Ekranı kapatıp sistem isteğini erteleyen **"Şimdi değil"/"İptal"/X gibi çıkış düğmesi olmamalı**; mesajdan sonra kullanıcı her zaman sistem isteğine ilerlemeli.
  - İzin karşılığı teşvik (kredi, indirim, içerik) sunma; sistem uyarısını taklit eden veya seçimi etkilemeye çalışan tasarım kullanma.
- İzni ilgili özellik kullanılacağı anda iste; açılışta toplu izin isteme. Reddedilince uygulamanın geri kalanı çalışmalı; o özellik için Ayarlar'a yönlendiren açıklama göster.
- **Ara:** `requestAuthorization`, `requestAccess`, `requestWhenInUseAuthorization`, `requestTrackingAuthorization` ve izin kütüphanelerinin çağrıldığı yerler; bu çağrılardan hemen önce gösterilen ekran/diyalog bileşenleri ve düğme metinleri.
- **Düzelt:** Düğme metnini değiştir, çıkış düğmesini kaldır veya özel ön ekranı tamamen kaldır; teşvikleri kaldır.

**M4.5 Gereksiz giriş zorunluluğu ve kişisel bilgi** — 🟠 · `[KARAR]` · *5.1.1(v), 5.1.1(x)*
- Önemli hesap tabanlı özellik yoksa uygulama girişsiz kullanılabilmeli. Hesap gerektirmeyen içerik/işlevlere (katalog gezme, okuma, hesaplama…) açılışta zorunlu kayıt duvarı ret sebebidir.
- Temel işlevle doğrudan ilgili değilse veya yasa gerektirmiyorsa kişisel bilgi zorunlu tutulamaz. Ad ve e-posta gibi temel iletişim bilgileri istenebilir ancak isteğe bağlı olmalı ve özellikler buna bağlanmamalı (çocuklardan bilgi toplama sınırları dahil).
- Temel işlev belirli bir sosyal ağla ilgili değilse uygulamaya o ağın girişi olmadan erişilebilmeli; temel profil bilgisi çekmek, ağda paylaşmak veya arkadaş davet etmek temel işlev sayılmaz.

**M4.6 Uygulama içi hesap silme** — 🔴 · `[KOD]`/`[BACKEND]` · *5.1.1(v), App Review Help*
- Hesap oluşturmayı destekleyen her uygulama, hesabın silinmesini **uygulamanın içinden başlatma** imkânı sunmalı:
  - Seçenek kolay bulunmalı (genellikle hesap ayarları).
  - Yalnızca geçici devre dışı bırakma yetmez: hesap kaydı ve yasal olarak saklanması gerekmeyen tüm ilişkili kişisel veri silinmeli — başkalarıyla paylaşılmış kullanıcı içeriği (fotoğraf, video, gönderi, değerlendirme) dahil.
  - Silme web'de tamamlanıyorsa doğrudan silme sayfasına giden bağlantı verilmeli.
  - Düzenlenmiş sektörler (5.1.1(ix)) dışında telefon, e-posta, sohbet desteği gibi destek akışları şart koşulamaz. Kimlik doğrulama/onay adımı eklenebilir; gereksiz zorlaştırma ret sebebidir.
  - İşlem zaman alıyorsa ne kadar süreceği söylenmeli ve tamamlanınca onay verilmeli; yasa gereği saklanacak veri varsa kullanıcıya bildirilmeli.
  - Otomatik oluşturulan "misafir" hesaplar da silinebilmeli.
  - Yalnızca belirli bölgeler (GDPR, CCPA, KVKK) için yapılmış silme akışı herkese açılmalı.
  - Otomatik yenilenen aboneliği olan kullanıcıya faturalandırmanın Apple üzerinden devam edeceği bildirilmeli ve önce iptal etmesi istenmeli: `showManageSubscriptions(in:)` veya `https://apps.apple.com/account/subscriptions`; iade için `beginRefundRequest` veya `https://support.apple.com/118223`. Silme abonelik bitimine planlanabilir ama hemen silme seçeneği de olmalı.
  - Sign in with Apple kullanılıyorsa silmede **Sign in with Apple REST API ile token iptali** yapılmalı; hesap değişiklikleri için sunucudan sunucuya bildirimler işlenmeli.
- **Düzelt:** Ayarlar > Hesap > "Hesabı sil" akışı: açıklama → (gerekirse yeniden kimlik doğrulama) → kesin onay → API çağrısı → yerel veri ve oturum temizliği → onay mesajı. Silme uç noktası yoksa `[BACKEND]` görev tanımı yaz (hesap, içerik, depolama, üçüncü taraf hesapları, SIWA token iptali).

**M4.7 Sosyal ağ kimlik bilgileri** — 🟠 · *5.1.1(v)*
- Uygulama içinden sosyal ağ bağlantısını kaldırma ve veri erişimini kesme yolu olmalı. Sosyal ağ kimlik bilgileri/token'ları cihaz dışında saklanamaz ve yalnızca uygulama kullanımdayken doğrudan o ağa bağlanmak için kullanılabilir.

**M4.8 SafariViewController** — 🟠 · *5.1.1(vii)*
- `SFSafariViewController` bilgiyi görünür biçimde sunmak için kullanılmalı; gizlenemez, başka görünüm veya katmanlarla örtülemez; kullanıcının bilgisi ve rızası olmadan izleme için kullanılamaz (görünmez SFSafariViewController ile çerez/atıf eşleme yok).

**M4.9 Gizli veri toplama ve başka kaynaklardan kişisel bilgi derleme** — 🔴 · *5.1.1(vi), 5.1.1(viii)*
- Doğrudan kullanıcıdan gelmeyen veya kullanıcının açık rızası olmadan, kamuya açık veritabanları dahil herhangi bir kaynaktan kişisel bilgi derleyen uygulamalar kabul edilmez (kişi arama, veri kazıma vb.). Uygulamalarını gizlice parola veya başka özel verileri ele geçirmek için kullanan geliştiriciler programdan çıkarılır.

**M4.10 Düzenlenmiş alanlar** — 🔴 · `[ASC]`/`[KARAR]` · *5.1.1(ix), 3.2.1(viii)*
- Bankacılık/finans, sağlık hizmeti, kumar, yasal kenevir, havacılık, kripto borsası gibi yüksek düzenlemeli alanlarda veya hassas kullanıcı bilgisi gerektiren uygulamalar hizmeti sunan **tüzel kişi** tarafından gönderilmeli, bireysel geliştirici tarafından değil. Finansal işlem, yatırım veya para yönetimi uygulamaları hizmeti veren finans kuruluşunca gönderilmeli ve gerekli lisanslara sahip olmalı. Yasal kenevir satışı ilgili yargı bölgesine coğrafi olarak sınırlanmalı.
- **Aksiyon:** Geliştirici hesabı türünü kullanıcıya sor. Gerekli belgeleri (kripto borsası lisansı ve ortaklık belgeleri, kredi lisansı ve lisanslı kurumla anlaşma, tıbbi düzenleyici onay, kumar lisansı, marka izni vb.) Review Notes ekleri olarak hazırlat.

**M4.11 Üçüncü taraflarla paylaşım ve üçüncü taraf yapay zekâ** — 🔴 · `[KOD]` · *5.1.2(i)*
- Yasanın izin verdiği durumlar dışında kişisel veri izinsiz kullanılamaz, iletilemez, paylaşılamaz; verinin nasıl ve nerede kullanılacağı bilgisine erişim sağlanmalı. **Kişisel verinin üçüncü taraflarla — üçüncü taraf yapay zekâ dahil — paylaşılacağı yer açıkça bildirilmeli ve paylaşımdan önce açık izin alınmalı.** Uygulamadan toplanan veri üçüncü taraflarla yalnızca uygulamayı iyileştirmek veya reklam sunmak için paylaşılabilir. AI ayrıntıları M8'de.

**M4.12 İzleme ve App Tracking Transparency (ATT)** — 🔴 · `[KOD]`/`[ASC]` · *5.1.2(i), DPLA 3.3.3(E), User Privacy and Data Use*
- **İzleme nedir:** Uygulamadan toplanan kullanıcı/cihaz verisini, diğer şirketlerin uygulama, web sitesi veya çevrimdışı mülklerinden toplanan verilerle hedefli reklam veya reklam ölçümü için ilişkilendirmek ya da veri simsarıyla paylaşmak. Örnekler: başka şirketlerin verisine dayalı hedefli reklam; konum veya e-posta listesini veri simsarıyla paylaşmak; reklam ağına yeniden hedefleme için ID/e-posta listesi vermek; topladığı veriyi diğer geliştiricilerin verisiyle birleştiren bir SDK'yı uygulamaya koymak (sen o amaçla kullanmasan bile). Uygulamalar arası ortak kimlik oluşturan üçüncü taraf (ertelenmiş) derin bağlantı/atıf araçları ve uygulama işlevi için kullanılan web görünümleri içindeki izleme de kapsamdadır. İstisnalar: yalnızca cihazda kalan eşleştirme; yalnızca dolandırıcılık önleme/güvenlik; kredi değerlendirmesi için tüketici raporlama kuruluşuyla paylaşım.
- **Kurallar:** İzlemeden ve IDFA'ya erişmeden önce ATT izni ve `NSUserTrackingUsageDescription`. İzin yoksa hashlenmiş e-posta/telefon gibi başka bir tanımlayıcıyla da izleme yapılamaz. İşlevi izne bağlamak veya izin için teşvik vermek yasak. ATT öncesi açıklama ekranı şeffafsa serbesttir ama M4.4 kurallarına uymalı. Ayrı rıza yönetim (CMP) ekranları ATT kararını geçersiz kılamaz; uygulama her zaman ATT yanıtına uymalı. Kullanıcı ayrı bir rıza ekranında ilgili tüm yasal onayları reddettiyse ona ATT istemini gösterme. IDFV, aynı geliştiricinin uygulamaları arasında analitik için ATT'siz kullanılabilir ama başka şirketlerin verisiyle birleştirilemez. AB'de iOS/iPadOS 27.2 ile "Additional Information" düğmeli alternatif ATT istemi kullanılabilir (Almanya, Fransa, İtalya, Polonya ve Romanya'da yalnızca bu sürüm sunulur); izin şartları aynıdır.
- **Ara:** İzleme/atıf/reklam SDK'ları (Ek A/M4), `ASIdentifierManager`, `requestTrackingAuthorization`, manifest'te `NSPrivacyTracking`/`NSPrivacyTrackingDomains`.
- **Düzelt:** İzleme yapan SDK'lar varsa ATT istemini ekle, izin gelmeden SDK'ların izleme/IDFA özelliklerini başlatma (SDK'ların consent/ATT bekleme ayarları) ve izleme alan adlarını `NSPrivacyTrackingDomains`'e yaz `[KARAR]`. İzleme gerekmiyorsa SDK'ların izleme özelliklerini kapat ve gizlilik etiketinde "Used to Track You" işaretleme. **App Privacy etiketi izleme beyan ediyor ama uygulama ATT istemi göstermiyorsa (veya tersi) bu sık bir ret sebebidir**: etiket, manifest ve kod tutarlı olmalı. ATT isteminin ne zaman göründüğünü Review Notes'a yaz.

**M4.13 Parmak izi (fingerprinting) yasağı** — 🔴 · *DPLA 3.3.3(B), User Privacy and Data Use*
- Kullanıcı izin verse bile cihazı veya kullanıcıyı benzersiz tanımlamak için cihazdan veri türetmek yasaktır (tarayıcı/cihaz yapılandırması, konum, ağ bağlantısı gibi sinyallerden kimlik oluşturma). Bunu yapan SDK'lara (reklam ağları, atıf, analitik) referans bile ret sebebi olabilir. Required reason API'leri yalnızca beyan edilen amaçla kullanılabilir.

**M4.14 Sistem işlevlerini şart koşma** — 🟠 · `[KOD]` · *5.1.2(i), 4.5.4*
- İşleve veya içeriğe erişim ya da ödül (hediye kartı, kod dahil) için push bildirimlerini, konum servislerini veya izlemeyi açmayı zorunlu kılma. Push bildirimleri uygulamanın çalışması için zorunlu olamaz.

**M4.15 Amaç dışı kullanım, profil çıkarma, rehber ve yüklü uygulamalar** — 🟠 · *5.1.2(ii)–(v)*
- Bir amaçla toplanan veri yeni rıza olmadan başka amaçla kullanılamaz. Gizlice profil oluşturma, anonim/kümelenmiş veriden kimlik tespiti yasak.
- Kişiler, Fotoğraflar vb. ile kendi kullanımın için veya satış için kişi veritabanı oluşturma yok. Analitik/reklam amacıyla cihazda yüklü uygulamaları tespit etme yok (çok uzun `LSApplicationQueriesSchemes` listesi + `canOpenURL` taraması kırmızı bayraktır).
- Rehber veya Fotoğraflar'dan alınan bilgilerle kişilere yalnızca kullanıcının tek tek başlattığı eylemle ulaşılabilir: **"Tümünü seç" seçeneği ve varsayılan olarak tümünün seçili gelmesi yasak**; göndermeden önce mesajın alıcıya nasıl görüneceği (metin, gönderen) gösterilmeli.

**M4.16 Hassas framework verileri** — 🔴 · *5.1.2(vi), 5.1.2(vii)*
- HomeKit, HealthKit, Clinical Health Records, MovementDisorder, ClassKit veya derinlik/yüz haritalama araçlarından (ARKit, kamera/fotoğraf API'leri) gelen veri pazarlama, reklam veya kullanım tabanlı veri madenciliği için kullanılamaz (üçüncü taraflar dahil). Apple Pay ile edinilen kullanıcı verisi yalnızca mal/hizmet teslimini sağlamak veya iyileştirmek için üçüncü taraflarla paylaşılabilir.

**M4.17 Sağlık ve sağlık araştırması** — 🔴 · `[KOD]`/`[HUKUK]` · *5.1.3*
- Sağlık, fitness ve tıbbi araştırma bağlamında toplanan veri (Clinical Health Records, HealthKit, Motion & Fitness, MovementDisorder, sağlıkla ilgili insan deneği araştırması) reklam, pazarlama veya kullanım tabanlı veri madenciliği için kullanılamaz/üçüncü taraflara açıklanamaz; yalnızca sağlık yönetimini iyileştirme veya izinli sağlık araştırması için. Kullanıcıya doğrudan fayda (ör. sigorta primi indirimi) ancak faydayı sağlayan kuruluş uygulamayı gönderiyorsa ve veri üçüncü tarafla paylaşılmıyorsa. Cihazdan toplanan belirli sağlık verileri açıklanmalı.
- HealthKit'e veya başka sağlık uygulamalarına yanlış/hatalı veri yazılamaz. **Kişisel sağlık bilgisi iCloud'da saklanamaz** (CloudKit, iCloud Drive, `NSUbiquitousKeyValueStore` senkronizasyonunu kontrol et).
- İnsan deneği araştırması: katılımcıdan (reşit değilse veliden) amaç, süre, prosedür, risk/fayda, gizlilik ve veri paylaşımı, iletişim noktası ve çekilme sürecini içeren onam; bağımsız etik kurul onayı.

**M4.18 Çocukların verisi** — 🔴 · *5.1.4, 1.3*
- COPPA, GDPR ve ilgili yasalara uyum. Doğum tarihi ve ebeveyn iletişim bilgisi yalnızca bu yasalara uymak için istenebilir; uygulama yaştan bağımsız olarak işe yarar olmalı. Öncelikle çocuklara yönelik uygulamalarda üçüncü taraf analitik ve reklam olmamalı (1.3'teki sınırlı istisnalar hariç).
- Kids Category'deki veya reşit olmayanlardan kişisel bilgi (ad, adres, e-posta, konum, fotoğraf, video, çizim, sohbet imkânı, bunlarla birlikte kullanılan kalıcı tanımlayıcılar) toplayan/paylaşma kabiliyeti olan uygulamalar gizlilik politikası içermeli ve çocuk gizliliği yasalarına uymalı. Ebeveyn kapısı (parental gate), yasal ebeveyn onayının yerine geçmez.
- Kids Category dışındaki uygulamalar ad, alt başlık, ikon, ekran görüntüsü veya açıklamada ana kitlenin çocuklar olduğunu ima edemez.

**M4.19 Konum** — 🟠 · `[KOD]` · *5.1.5, DPLA 3.3.3(F)*
- Konum yalnızca uygulamanın özellik ve hizmetleriyle doğrudan ilgiliyse kullanılmalı; toplamadan, iletmeden veya kullanmadan önce bildirim ve onay; amacı uygulama içinde açıkla. "Always" izni için izin anında açık gerekçe ve kullanıcı faydası sun. Konum tabanlı API'ler acil durum hizmetleri veya araç/uçak/cihazların otonom kontrolü için kullanılamaz (hafif drone ve oyuncak gibi küçük cihazlar istisna).

**M4.20 Veri güvenliği** — 🟠 · `[KOD]`/`[BACKEND]` · *1.6, DPLA 3.3.3(C)*
- Token/parola Keychain'de (UserDefaults, AsyncStorage, SharedPreferences'ta düz metin değil); tüm trafik HTTPS (gereksiz `NSAllowsArbitraryLoads` istisnalarını kaldır); uygulamaya gömülü gizli anahtar yok (özellikle LLM, ödeme, bulut yönetici anahtarları → sunucu tarafına taşı); kişisel veri loglanmasın; hassas veriler için dosya koruması.

**M4.21 App Privacy etiketi taslağı** — 🔴 · `[ASC]` · *2.3 (gizlilik bilgisi dahil meta veri doğruluğu), 5.1.2*
- Kod, SDK'lar ve manifest'lerden toplanan veri türlerini çıkar; her biri için: veri türü, kaynağı (kod/SDK), amacı (App Functionality, Analytics, Product Personalization, Developer's Advertising, Third-Party Advertising, Other), kimliğe bağlı mı, izleme için mi. Raporda tablo olarak ver; SDK'ların kendi beyanlarını hesaba kat (Xcode Organizer → Generate Privacy Report).

### M5 — Giriş servisleri (4.8)

**M5.1 Eşdeğer giriş seçeneği (Sign in with Apple)** — 🔴 · `[KOD]`/`[BACKEND]`/`[ASC]` · *4.8, 5.1.1(v)*
- **Kural:** Kullanıcının birincil hesabını kurmak veya doğrulamak için üçüncü taraf/sosyal giriş (Facebook, Google, X, LinkedIn, Amazon, WeChat vb.) kullanan uygulama, eşdeğer seçenek olarak şu özelliklere sahip başka bir giriş servisi daha sunmalı: veri toplamayı ad ve e-posta ile sınırlar; kullanıcının e-postasını gizli tutmasına izin verir; rıza olmadan uygulamadaki etkileşimleri reklam amacıyla toplamaz. Pratikteki karşılığı **Sign in with Apple**.
- **İstisnalar:** Uygulama yalnızca şirketin kendi hesap sistemini kullanıyor; alternatif uygulama pazarı (veya oradan dağıtılan uygulama) pazara özgü giriş kullanıyor; mevcut eğitim/kurumsal hesapla giriş gerektiren eğitim, kurumsal veya iş uygulaması; devlet veya sektör destekli vatandaş kimliği/e-kimlik; kullanıcının içeriğine erişmek için doğrudan o üçüncü taraf hesabına (posta, sosyal medya vb.) giriş yaptığı istemci uygulama.
- **Uygulama ayrıntıları:**
  - Düğme diğer sağlayıcılarla aynı ekranda ve eşdeğer görünürlükte; Apple'ın resmi düğmesi (`ASAuthorizationAppleIDButton`/`SignInWithAppleButton`) ve HIG kurallarıyla.
  - Gizli e-posta (Private Relay) adresleriyle çalışmalı; bu adreslere e-posta gönderiyorsan relay yapılandırması `[ASC]`/`[BACKEND]`. Yeni relay adresleri `private.icloud.com` alan adıyla veriliyor, mevcut `privaterelay.appleid.com` adresleri çalışmaya devam ediyor (Apple duyurusu, 24 Ağustos 2026): e-posta doğrulama kuralları ve izin listeleri iki alan adını da kabul etmeli.
  - Giriş sonrası adı/e-postayı yeniden zorunlu isteme (SIWA bu bilgileri sağlar; yeniden istemek ret sebebi olabiliyor). Ad yalnızca ilk yetkilendirmede gelir — sunucuda sakla.
  - Hesap silmede REST API ile token iptali (M4.6). Açılışta `getCredentialState` ile oturum kontrolü önerilir.
  - Entitlement: `com.apple.developer.applesignin` (Apple Developer hesabında capability de açılmalı `[ASC]`).
- **Yığınlar:** Swift `AuthenticationServices`; Expo `expo-apple-authentication`; RN `@invertase/react-native-apple-authentication`; Flutter `sign_in_with_apple`; Firebase/Supabase/Auth0 kullanılıyorsa onların Apple sağlayıcısı + native akış.

### M6 — Ödemeler ve iş modeli (3.1, 3.2, 4.9, 4.10)

**M6.1 Dijital içerik ve özellik kilidi = IAP** — 🔴 · `[KARAR]`/`[KOD]` · *3.1.1, 3.1.3(b)*
- Uygulama içinde özellik, işlev veya içerik kilidi açmak (abonelik, oyun içi para, seviye, premium içerik, tam sürüm) IAP ile yapılmalı. Lisans anahtarı, AR işaretçisi, QR kod, kripto para/cüzdan gibi kendi kilit açma mekanizmaları yasak. Kendi "kod gir" ekranın premium açıyorsa App Store offer code'larına geç (`AppStore.presentOfferCodeRedeemSheet`, SwiftUI `.offerCodeRedemption`).
- Apple Pay veya kartla **dijital** içerik satılamaz (Apple Pay fiziksel mal/hizmet içindir — 3.1.3(e)). İstisna: Apple'ın bölgesel koşullarıyla IAP dışı ödeme işlemeye izin verdiği yerler (ör. AB ve iOS 26.5'ten itibaren Brezilya); bu yol bölgeye özel şart ve sözleşme gerektirir → `[KARAR]`, güncel bölgesel koşulları oku.
- Çok platformlu hizmet (3.1.3(b)): Web'de veya başka platformda edinilen içeriğe uygulamada erişim serbesttir, **ancak bu öğeler uygulamada da IAP olarak sunuluyorsa** (reader app istisnası hariç, M6.8).

**M6.2 Harici satın alma yönlendirmesi (buton, bağlantı, çağrı)** — 🔴 · `[KARAR]` · *3.1.1, 3.1.1(a), 3.1.3*
- **ABD storefront'u:** Uygulamada ve meta veride IAP dışı satın alma yöntemlerine yönlendiren buton, harici bağlantı veya çağrı serbest; entitlement gerekmez.
- **Diğer storefront'lar:** Yalnızca belirli bölgelerde, StoreKit External Purchase Link Entitlement (izin verilen yerlerde müzik yayın hizmetleri için olanı dahil) ile izin verilen bir hedefe bağlantı; bağlantı, öğelerin nerede/nasıl ve daha düşük fiyata alınabileceğini söyleyebilir. Bunun dışında uygulama ve meta veride IAP dışı satın almaya yönlendirme **yasak**. Reader app'ler hesap oluşturma/yönetme için External Link Account Entitlement'a başvurabilir (3.1.3(a)). Uygulama dışından (ör. e-posta) kullanıcılarına başka ödeme yöntemlerini bildirmek serbest.
- Entitlement ile yanıltıcı pazarlama, dolandırıcılık veya sahtekârlık uygulamanın kaldırılmasına yol açar.
- **Ara:** Ödeme sağlayıcıları ve web checkout bağlantıları (Stripe, PayPal, Braintree, Adyen, Paddle, Lemon Squeezy, Gumroad; Türkiye: iyzico, PayTR, Param, Craftgate, Papara), "web sitemizden daha ucuza al" türü metinler.
- **Seçenekler `[KARAR]`:** (a) Yönlendirmeyi kaldır ve IAP kullan; (b) yalnızca ABD storefront'unda göster (StoreKit `Storefront.current` → `countryCode == "USA"` ile koşullu; storefront değişikliğini dinle); (c) ilgili bölgelerde entitlement'a başvur ve StoreKit External Purchase API'leriyle uygula. Onay gelene kadar güvenli varsayılan: ABD dışı storefront'larda gizle.

**M6.3 Satın alımları geri yükleme** — 🔴 · `[KOD]` · *3.1.1*
- Geri yüklenebilir satın alımlar (tüketilemeyen ürünler, abonelikler) için görünür bir **"Satın Alımları Geri Yükle"** düğmesi (paywall'da ve/veya ayarlarda). StoreKit 2 `AppStore.sync()`; StoreKit 1 `restoreCompletedTransactions()`; RevenueCat `restorePurchases()`; Flutter `InAppPurchase.instance.restorePurchases()`; react-native-iap `getAvailablePurchases()`.

**M6.4 Sanal para, hediye, bahşiş, ganimet kutusu, deneme, NFT** — 🔴/🟠 · `[KOD]` · *3.1.1, 3.2.1(vii)*
- IAP ile alınan kredi ve oyun içi para **süresi dolamaz** (son kullanma mantığını kaldır).
- IAP'e uygun öğeler başkalarına hediye edilebilir; iade yalnızca satın alana yapılır, takas edilemez.
- Geliştiriciye veya dijital içerik sağlayıcılarına "bahşiş" IAP para birimiyle verilebilir. Bireyler arası para hediyesi IAP olmadan yapılabilir, ancak tamamen isteğe bağlıysa ve paranın %100'ü alıcıya gidiyorsa; dijital içerik veya hizmetle bağlantılı hediye IAP gerektirir.
- **Ganimet kutusu** (rastgele sanal öğe satışı): satın almadan **önce her öğe türünün olasılığı** gösterilmeli.
- Dijital ürün/hizmet için kullanılan dijital hediye kartı, kupon ve sertifikalar yalnızca IAP ile satılabilir; postayla gönderilen fiziksel hediye kartı başka yöntemle satılabilir.
- Abonelik olmayan uygulamalarda ücretsiz süreli deneme: fiyatı Tier 0 olan ve "XX-day Trial" adlandırmasını izleyen tüketilemeyen IAP; deneme başlamadan önce süre, deneme bitince erişilemeyecek içerik/hizmet ve tam işlev için ödenecek ücretler açıkça gösterilmeli.
- NFT: IAP ile NFT ve ilgili hizmetler (basma, listeleme, transfer) satılabilir; kullanıcının kendi NFT'lerini göstermek serbest ama sahiplik uygulamada özellik açamaz; başkalarının koleksiyonlarına göz atılabilir ancak IAP dışı satın almaya yönlendirme yalnızca ABD storefront'unda serbest.

**M6.5 Abonelik bilgileri (3.1.2(c) ve DPLA Schedule 2)** — 🔴 · `[KOD]`/`[ASC]`
- Abone olmadan önce kullanıcının fiyat karşılığında **tam olarak ne alacağı** açıkça anlatılmalı (kaç içerik, ne kadar depolama, hizmete ne tür erişim).
- **Uygulama içinde (abone olma ekranında):** aboneliğin adı ve süresi; abonelik süresince sunulan içerik veya hizmet; yerel para biriminde **açık ve belirgin tam yenileme fiyatı** (uygunsa birim başı fiyat); mevcut abonelerin giriş yapması veya satın alımları geri yüklemesi için bir yol; **Gizlilik Politikası ile Kullanım Koşulları (EULA) için çalışan bağlantılar** (DPLA Schedule 2; Apple *Auto-renewable Subscriptions* sayfası).
- Taahhütlü bir satın alma seçeneği (ör. 12 ay taahhütlü aylık abonelik) sunuyorsan taahhüt süresini ve iptal koşullarını satın almadan önce açıkça göster (3.1.2(c)).
- **Meta veride `[ASC]`:** Privacy Policy alanında gizlilik bağlantısı; Kullanım Koşulları (EULA) bağlantısı uygulama açıklamasında veya App Store Connect'teki özel EULA alanında. Apple'ın standart EULA'sını kullanıyorsan açıklamaya `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/` bağlantısını ekle.
- Fiyatları her zaman StoreKit'ten yerelleştirilmiş olarak göster (`Product.displayPrice` veya SDK eşdeğeri); sabit yazma.

**M6.6 Paywall dürüstlüğü** — 🔴 · `[KOD]` · *3.1.2(a), 3.1.2(c), 5.6*
- **Faturalandırılacak toplam tutar, satın alma akışındaki en belirgin fiyat öğesi olmalı** (yazı tipi, boyut, renk ve konum açısından). Ücretsiz deneme, tanıtım fiyatı ve "aylık ₺X'e denk gelir" gibi hesaplanmış fiyatlar ona göre ikincil konumda ve boyutta olmalı. Yıllık planı ağırlıklı olarak aylık karşılığıyla göstermek bilinen bir ret sebebidir. (Kaynak: Apple *Auto-renewable Subscriptions* sayfasındaki "Billing amount" kuralı ve App Review'un 3.1.2 ret mesajları.)
- Ücretsiz deneme varsa: deneme süresi, deneme bitince faturalandırılacak tutar ve dönem, otomatik yenilenme ve istenildiğinde iptal edilebileceği açıkça yazmalı (ör. "7 gün ücretsiz, ardından yıllık ₺X; otomatik yenilenir, istediğin zaman iptal edebilirsin.").
- Tanıtım teklifine uygun olmayan (daha önce denemiş) kullanıcıya "ücretsiz dene" gösterme (`Product.SubscriptionInfo.isEligibleForIntroOffer` veya SDK eşdeğeri).
- Kullanıcıyı aldatan tasarımlar: gizli, geç beliren veya zor görülen kapatma düğmesi; sahte geri sayım/stok; belirsiz fiyatla ön seçili pahalı plan; masum görünen "Devam" düğmesiyle satın alma başlatma. Kullanıcıyı yanıltarak abonelik sattırmaya çalışan uygulamalar mağazadan kaldırılır ve geliştirici programdan çıkarılabilir (3.1.2(a), 5.6).
- İsteğe bağlı: StoreKit `SubscriptionStoreView` fiyat ve şart sunumunu standartlaştırır.

**M6.7 Abonelik kuralları** — 🟠 · `[KOD]`/`[ASC]` · *3.1.2(a), 3.1.2(b)*
- Otomatik yenilenen abonelik en az 7 günlük olmalı, sürekli değer sunmalı ve kullanıcının uygulamanın bulunduğu tüm cihazlarında çalışmalı.
- Ödenen hizmeti almak için ek görev (sosyal medyada paylaşma, rehber yükleme, belirli sayıda giriş) şart koşulamaz.
- Aboneliğe geçen uygulama, daha önce ödeme yapmış kullanıcıların satın aldığı ana işlevi geri alamaz: eski "tam sürüm" ürün ID'lerinin kodda hâlâ yetki verdiğini doğrula.
- Yükseltme/düşürme sorunsuz olmalı; kullanıcı aynı şeyin birden çok varyasyonuna yanlışlıkla abone olamamalı (aynı abonelik grubu `[ASC]`).
- App Store'da tanıtılan IAP'ler (2.3.2) için açılışta işlem gözlemcisi: StoreKit 1 `SKPaymentTransactionObserver` (`paymentQueue(_:shouldAddStorePayment:for:)`), StoreKit 2 `Transaction.updates` dinleyicisi ve `PurchaseIntent.intents`.

**M6.8 Diğer satın alma yöntemleri (istisnalar)** — 🟠 · *3.1.3(a)–(g), 3.1.4*
- (a) **Reader:** dergi, gazete, kitap, ses, müzik, video için önceden satın alınmış içeriğe veya aboneliğe erişim; ücretsiz katman için hesap oluşturma ve mevcut müşteriler için hesap yönetimi.
- (b) **Çok platformlu hizmet:** M6.1.
- (c) **Kurumsal:** yalnızca kurumlara/gruplara doğrudan satılıyorsa; tüketici, tek kullanıcı veya aile satışları IAP.
- (d) **Kişiden kişiye gerçek zamanlı hizmet** (birebir özel ders, tıbbi danışmanlık, emlak turu, kişisel antrenman): IAP dışı ödeme serbest; bire-birkaç ve bire-çok gerçek zamanlı hizmetler IAP.
- (e) **Uygulama dışında tüketilen fiziksel mal/hizmet** (e-ticaret, yemek, ulaşım, bilet): **IAP kullanılmamalı**; Apple Pay veya kart ile (iyzico, Stripe vb.) tahsil edilmeli.
- (f) VoIP, bulut depolama, e-posta, web barındırma gibi ücretli bir web aracının ücretsiz yardımcı uygulaması: uygulamada satın alma veya dışarıda satın almaya çağrı yoksa IAP gerekmez.
- (g) Yalnızca reklam kampanyası satın alma/yönetme uygulamaları IAP gerektirmez; ama aynı uygulamada gösterilecek reklam veya "boost" satışı IAP.
- Bu istisnalardaki uygulamalar da uygulama içinde IAP dışı yöntemi teşvik edemez (ABD storefront'u, 3.1.1(a) ve 3.1.3(a) hariç).
- 3.1.4: Belirli donanıma bağlı özellikler IAP'siz açılabilir; onaylı bir fiziksel ürünle isteğe bağlı çalışan özellikler için IAP seçeneği de sunulmalı; ilgisiz ürün satın alma veya reklam/pazarlama faaliyeti şartı koşulamaz.

**M6.9 Kripto** — 🔴 (varsa) · *3.1.5*
- Cüzdan: kurum olarak kayıtlı geliştirici. Cihazda madencilik yok (bulut tabanlı olabilir). Borsa işlemleri yalnızca lisans/izin bulunan ülke ve bölgelerde. ICO, kripto vadeli işlemleri ve benzeri menkul kıymet işlemleri yalnızca yerleşik bankalar, aracı kurumlar veya onaylı finans kuruluşlarından. Başka uygulama indirme, başkalarını indirmeye teşvik, sosyal ağda paylaşım gibi görevler karşılığında kripto verilemez.

**M6.10 Kabul edilmeyen iş modelleri** — 🔴/🟠 · *3.2.2, 3.2.1*
- App Store benzeri veya genel amaçlı üçüncü taraf uygulama/uzantı/eklenti vitrini.
- Reklam gösterim/tıklamalarını yapay artırma veya esas olarak reklam göstermek için tasarlanmış uygulama.
- Onaylı kâr amacı gütmeyen kuruluş değilsen uygulama içinde bağış toplama (uygulama ücretsiz olmalı, bağış Safari/SMS ile uygulama dışında). Onaylı kuruluşlar Apple Pay desteğiyle ve fonların kullanımını açıklayarak bağış toplayabilir.
- Kullanıcıları konum veya operatör gibi keyfi ölçütlerle kısıtlama.
- Başka hizmetlerde görünürlük/sıralama manipülasyonu (o hizmet izin vermedikçe).
- İkili opsiyon (binary options) yasak; CFD/forex için her yargı bölgesinde lisans.
- **Kişisel kredi:** tüm şartlar (eşdeğer en yüksek yıllık faiz oranı/APR, vade tarihi dahil) açık ve belirgin; APR masraflar dahil en fazla %36; 60 gün veya daha kısa sürede tam geri ödeme şartı yok.
- **3.2.2(x):** İşleve, içeriğe veya kullanıma erişim için uygulamayı puanlamaya, yorum yazmaya, başka uygulama indirmeye veya benzeri mağaza eylemlerine **zorlama** yok. Uygulama içi eylemleri (seviye bitirme, reklam izleme) teşvik etmek serbest.
- Sigorta uygulamaları ücretsiz olmalı ve IAP kullanamaz. Kiralık içerik (film, dizi, müzik, kitap) dışında satın alınan öğe ve hizmetler süresi dolacak şekilde satılamaz.
- Wallet kartları ödeme yapma/alma, teklif iletme veya kimlik (bilet, kupon, VIP kimliği) için kullanılabilir; başka kullanımlar ret ve Wallet yetkisinin iptaline yol açabilir (3.2.1(iv)).

**M6.11 Apple Pay** — 🟠 · *4.9*
- Satıştan önce tüm önemli satın alma bilgileri; Apple Pay markası ve arayüz öğeleri Apple Pay Marketing Guidelines ve HIG'e uygun (`PKPaymentButton`). Tekrarlayan ödemelerde en azından: yenileme süresi ve iptal edilene kadar devam edeceği, her dönemde ne sağlanacağı, faturalandırılacak gerçek tutar, nasıl iptal edileceği.

**M6.12 Yerleşik yetenekleri paraya çevirme** — 🟠 · *4.10*
- Push bildirim, kamera, jiroskop gibi donanım/işletim sistemi yetenekleri veya Apple Music erişimi, iCloud depolama, Screen Time API'leri gibi Apple hizmetleri için ücret alınamaz.

**M6.13 Anlaşılır iş modeli ve makul fiyat** — 🟡 · `[ASC]` · *Bölüm 3 girişi*
- İş modeli açık değilse meta veride ve Review Notes'ta açıkla; IAP'ler hemen görünmüyorsa nerede olduklarını yaz. Mantıksız derecede yüksek fiyatla kullanıcıyı aldatmaya çalışan uygulama/IAP'ler reddedilir.

### M7 — Güvenlik ve içerik (Bölüm 1, Bölüm 5 girişi)

**M7.1 Sakıncalı içerik** — 🔴 · *1.1.1–1.1.7*
- Din, ırk, cinsel yönelim, cinsiyet, ulusal/etnik köken veya diğer hedef gruplara karşı karalayıcı, ayrımcı, aşağılayıcı içerik (profesyonel siyasi hiciv genelde muaf).
- İnsan veya hayvanların öldürülmesi, sakatlanması, işkence görmesinin gerçekçi tasviri veya şiddeti teşvik; oyunlarda "düşman" yalnızca belirli bir ırkı, kültürü, gerçek hükümeti, şirketi veya gerçek bir varlığı hedef alamaz.
- Silah ve tehlikeli nesnelerin yasa dışı/pervasız kullanımını teşvik veya ateşli silah/mühimmat satın almayı kolaylaştırma.
- Açık cinsel veya pornografik içerik ("hookup" uygulamaları, fuhuşu veya insan ticaretini kolaylaştırabilecek uygulamalar dahil).
- Kışkırtıcı dini yorum veya dini metinlerden yanlış/yanıltıcı alıntı.
- Yanlış bilgi ve sahte işlev (sahte konum takipçisi, yanlış cihaz verisi; "eğlence amaçlı" ibaresi kurtarmaz); anonim veya şaka amaçlı arama/SMS/MMS sağlayan uygulamalar reddedilir.
- Savaş, terör saldırısı, salgın gibi güncel olaylardan çıkar sağlamaya çalışan içerik.

**M7.2 Kullanıcı tarafından oluşturulan içerik (UGC)** — 🔴 · `[KOD]`/`[BACKEND]` · *1.2*
- **Kapsam:** Sosyal medya, UGC platformları ve **AI içerik üretim uygulamaları** dahil, kullanıcıların içerik oluşturduğu, ürettiği, yüklediği, paylaştığı her uygulama.
- **Zorunlu:** (1) sakıncalı içeriğin yayınlanmasını önleyen **filtreleme**; (2) rahatsız edici içeriği **bildirme** mekanizması ve bildirimlere zamanında yanıt; (3) taciz eden kullanıcıları hizmetten **engelleme**; (4) kullanıcıların kolayca ulaşabileceği **yayınlanmış iletişim bilgisi**.
- **App Review'un 1.2 ret mesajlarında tipik olarak ayrıca beklenenler** (resmi guideline metni değil; güvenli varsayılan olarak uygula): içerik paylaşmadan önce kullanıcının sakıncalı içeriğe ve taciz eden kullanıcılara **sıfır tolerans** belirten koşulları (EULA) kabul etmesi; bildirimlere 24 saat içinde içeriği kaldırıp ilgili kullanıcıyı çıkararak yanıt verilmesi; engellemenin geliştiriciye bildirim göndermesi ve engellenen kullanıcının içeriğini engelleyenin akışından anında kaldırması.
- Esas olarak pornografi, Chatroulette tarzı deneyim, **rastgele veya anonim sohbet**, gerçek kişileri nesneleştirme ("hot-or-not"), fiziksel tehdit veya zorbalık için kullanılır hale gelen uygulamalar App Store'a ait değildir ve uyarısız kaldırılabilir. Web tabanlı bir hizmetten gelen UGC'deki rastlantısal yetişkin (NSFW) içerik varsayılan olarak gizli olmalı ve **yalnızca kullanıcı web sitesinden açarsa** gösterilmeli (uygulama içi aç/kapa anahtarı yeterli değildir).
- Kurallara, hizmet şartlarına veya topluluk standartlarına aykırı içeriği kaldırmak geliştiricinin sorumluluğudur; uygun önlemleri almamak veya bildirim sonrası düzeltmemek Geliştirici Davranış Kuralları ihlali sayılabilir.
- **Rızasız mahrem görüntüler (16 Ekim 2026):** Moderasyon gereksinimleri, yapay zekâ araçlarıyla üretilenler dahil rızasız mahrem görüntüleri açıkça kapsar; bu içerik platformda **proaktif olarak önlenmeli ve kaldırılmalı**. Gerçek kişilerin rızası olmadan cinsel içerikli görüntülerini üreten ("nudification") uygulamalar yasaktır. Yeterli önlem almamak veya bildirim sonrası düzeltmemek Davranış Kuralları ihlali ve App Store'dan kaldırılma riski taşır.
- **Düzelt:** Her içerik öğesinde (gönderi, yorum, profil, mesaj, AI çıktısı) gerekçe seçimli "Bildir"; kullanıcı düzeyinde "Engelle"; ilk paylaşım öncesi koşulları kabul ekranı; kelime/görsel filtresi veya moderasyon API'si; uygulama içinde görünür iletişim bilgisi; moderasyon kuyruğu ve yanıt süreci için `[BACKEND]` görev tanımı.

**M7.3 Creator içerik ve yaş sınırı** — 🔴 (varsa) · *1.2.1, 1.2.1(a)*
- "Creator" topluluğundan içerik sunan uygulamalar düzgün moderasyonlu olmalı; bu deneyimler yerel uygulamanın temel özelliklerini değiştiremez, yalnızca içerik ekler; UGC olarak değerlendirilir (1.2) ve ödemeler 3.1.1'e uymalı; ek satın alma gerektiren içerik kullanıcıya bildirilmeli.
- Uygulamanın yaş derecesini aşan içeriği belirlemenin bir yolu ve **doğrulanmış veya beyan edilmiş yaşa dayalı** yaş kısıtlama mekanizması olmalı (M11.2).

**M7.4 Kids Category** — 🔴 (varsa) · *1.3*
- Uygulama dışına bağlantı, satın alma fırsatı veya dikkat dağıtıcı öğe yalnızca **ebeveyn kapısı** arkasındaki ayrılmış alanda. Kişisel tanımlayıcı veya cihaz bilgisi üçüncü taraflara gönderilmez. Üçüncü taraf analitik ve reklam olmamalı; sınırlı istisnalar: IDFA'yı veya çocuk, konum ya da cihaz hakkında tanımlayıcı bilgiyi toplamayan/iletmeyen analitik; Kids Category için yayımlanmış politikaları olan ve reklam görsellerini yaşa uygunluk açısından insan eliyle inceleyen bağlamsal reklam. Kategori sonradan kaldırılsa bile kullanıcıların beklentisi sürdükçe kurallar güncellemelerde de geçerlidir.

**M7.5 Fiziksel zarar ve tıbbi uygulamalar** — 🔴 · *1.4.1–1.4.5*
- Sağlık ölçümleriyle ilgili doğruluk iddiaları için veri ve metodoloji açıklanmalı; doğrulanamıyorsa ret. **Yalnızca cihaz sensörleriyle** röntgen çektiğini, tansiyon, vücut ısısı, kan şekeri veya kan oksijeni ölçtüğünü iddia eden uygulamalar yasak. Kullanıcıya tıbbi kararlardan önce doktora danışması hatırlatılmalı. Düzenleyici onay varsa belgesi gönderilmeli (`[ASC]`).
- **Düzenlenmiş tıbbi cihaz durumu beyanı `[ASC]`:** AEA (EEA), Birleşik Krallık veya ABD'de dağıtılan ve birincil/ikincil kategorisi Health & Fitness ya da Medical olan veya yaş anketinde sık tıbbi/tedavi bilgisi işaretlenmiş uygulamalar bu durumu App Store Connect'te beyan etmeli (düzenlenmiş cihaz değilse "No"). Yeni uygulamalar için hemen gerekli; mevcut uygulamalar 2027 başına kadar beyan etmezse güncelleme gönderemez (Apple duyurusu, 26 Mart 2026).
- İlaç dozu hesaplayıcıları yalnızca ilaç üreticisi, hastane, üniversite, sağlık sigortası şirketi, eczane veya onaylı bir kuruluştan gelmeli ya da FDA veya uluslararası muadili tarafından onaylanmış olmalı.
- Tütün/vape, yasa dışı uyuşturucu veya aşırı alkol tüketimini teşvik yok (reşit olmayanlara yönelikse kesin ret); kontrollü madde (lisanslı eczaneler ve lisanslı/yasal kenevir dispanserleri hariç) veya tütün satışını kolaylaştırma yok.
- Yalnızca kolluk kuvvetlerince yayımlanan alkol kontrol noktaları gösterilebilir; alkollü veya aşırı hızlı sürüş gibi pervasız davranış teşvik edilmez.
- Kullanıcıyı kendine veya başkalarına fiziksel zarar riski taşıyan etkinliklere (bahis, meydan okuma vb.) ya da cihazı riskli kullanmaya teşvik yok.

**M7.6 Geliştirici iletişim bilgisi** — 🟠 · `[KOD]`/`[ASC]` · *1.5*
- Uygulama ve Support URL kullanıcıların kolayca ulaşabileceği bir iletişim yolu içermeli (sınıfta kullanılabilecek uygulamalarda özellikle önemli). Wallet kartları düzenleyenin geçerli iletişim bilgisini içermeli ve marka sahibine atanmış özel sertifikayla imzalanmalı.

**M7.7 Suç bildirimi** — 🔴 (varsa) · *1.7*
- İddia edilen suçları bildirme uygulamaları yerel kolluk kuvvetlerini dahil etmeli ve yalnızca bu katılımın aktif olduğu ülke/bölgelerde sunulmalı (kurumun resmi antetli ortaklık belgesi istenebilir).

**M7.8 Yasa dışı veya pervasız davranış** — 🔴 · *Bölüm 5 girişi*
- Uygulama, sunulduğu her yerdeki yasalara uymalı. Suç veya açıkça pervasız davranışı isteyen/teşvik eden uygulamalar reddedilir. İnsan ticaretini veya çocuk istismarını kolaylaştırdığı tespit edilen uygulamalar App Store'dan kaldırılır, alternatif dağıtımdan da engellenir ve yetkililere bildirilir.

### M8 — Yapay zekâ özellikleri (LLM, görsel/ses üretimi, sohbet botu)

Bu modül, AI kullanan uygulamalarda farklı kuralların kesişimini toplar.

**M8.1 Üçüncü taraf AI'ya veri göndermeden önce açık izin** — 🔴 · `[KOD]` · *5.1.2(i), 5.1.1(i)–(ii)*
- Kullanıcının kişisel verisi (yazdığı metin, sesi, fotoğrafı, belgeleri, profil/konum bilgisi) bir **üçüncü taraf AI** hizmetine (OpenAI, Anthropic, Google vb.) gidiyorsa: göndermeden **önce** hangi sağlayıcıya, hangi verinin, hangi amaçla gideceğini açıkça söyleyen ve **açık izin** alan bir ekran (onay düğmesi; ön seçili kutu değil). Onay saklanmalı ve Ayarlar'dan geri alınabilmeli; reddedilirse AI özelliği kapalı kalmalı ama uygulamanın geri kalanı çalışmalı.
- Gizlilik politikası ve App Privacy etiketi bu paylaşımı yansıtmalı.
- Apple'ın cihaz üzerindeki Foundation Models framework'ü üçüncü taraf paylaşımı değildir; ancak DPLA'ya göre Foundation Models Framework Acceptable Use Requirements'a uyulmalı.
- **Düzelt:** Kalıcı bir AI onay durumu + ilk kullanımda onay ekranı + Ayarlar'da anahtar; AI ağ çağrılarını onaya bağla.

**M8.2 Üretilen içeriğin denetimi** — 🔴 · `[KOD]`/`[BACKEND]` · *1.2, 4.7.1, 1.1*
- AI içerik üretim uygulamaları UGC kurallarına tabidir: girdi ve çıktı için filtreleme/moderasyon (sağlayıcının moderasyon uç noktası veya kendi filtren), her AI yanıtında ve görselinde **"Bildir"**, çok kullanıcılı yapıda engelleme, görünür iletişim bilgisi.
- Gerçek kişilerin rızasız mahrem görüntülerini (AI ürünü dahil; 1.2 bunların proaktif olarak önlenip kaldırılmasını ister — M7.2), reşit olmayanları içeren her türlü cinsel içeriği ve 1.1 kapsamındaki içerikleri üretmeyi engelle. Çıplaklık veya açık cinsel görüntü üreten ("nudification" dahil) uygulamalar yasaktır. Gerçek kişilerin benzerliği veya sesi (deepfake) için kişilik ve fikri mülkiyet hakları (5.2.1).
- Uygulama başkalarının oluşturduğu botları, karakterleri veya eklentileri sunuyorsa 4.7.1–4.7.5 tamamen geçerlidir (M9.7).

**M8.3 Doğruluk ve sağlık tavsiyesi** — 🟠 · *1.4.1, 2.3.1, 1.1.6*
- AI'nın yapamadığı bir şeyi vaat etme ("teşhis koyar", "%100 doğru"). Sağlık bağlamında doktora danışma hatırlatması ekle; teşhis/tedavi iddiası düzenleyici onay ister.

**M8.4 Marka ve isim** — 🟠 · `[KARAR]` · *4.1(c), 5.2.1, 2.3.7*
- Başka bir geliştiricinin ikonunu, markasını veya ürün adını (ChatGPT, Claude, Gemini, Copilot, Grok vb.) izinsiz olarak uygulama adında veya ikonunda kullanma; anahtar kelimelerde de kullanma. Apple'ın 4.1 rehberi popüler uygulama adlarına ve marka terimlerine meta verinin **hiçbir alanında** (açıklama dahil) yer verilmemesini istiyor; model/sağlayıcı adını meta veride kullanmak `[KARAR]` (izin belgesi varsa Review Notes'a ekle). Sağlayıcıyı uygulama içinde, M8.1 onay ekranında ve gizlilik politikasında belirt.

**M8.5 Anahtar güvenliği ve kötüye kullanım** — 🟠 · `[KOD]`/`[BACKEND]` · *1.6*
- LLM/API anahtarları uygulama paketinde olmamalı; istekleri kimlik doğrulamalı, hız sınırlı kendi sunucun üzerinden yönlendir.

**M8.6 Yaş derecesi ve Review Notes** — 🟠 · `[ASC]` · *2.3.6, App Review Help*
- AI sohbet/üretimin içerik kapsamına göre yaş anketini yanıtla (M11). Review Notes'ta kullanılan AI hizmetlerini, AI özelliğinin yerini ve onay ekranını belirt (Apple, temel işlevi sağlayan dış hizmetlerin — AI hizmetleri dahil — notlarda listelenmesini istiyor).

**M8.7 Kod üretimi ve çalıştırma** — 🔴 (varsa) · *2.5.2, DPLA 3.3.1(B)*
- AI'nın ürettiği kodu uygulama içinde çalıştırıp yeni özellik oluşturmak 2.5.2'ye takılır; yalnızca uygulamanın incelenen amacıyla uyumlu yorumlanan kod ve eğitim istisnası sınırları içinde.

### M9 — Tasarım ve minimum işlevsellik (Bölüm 4)

**M9.1 Taklit ve kimliğe bürünme** — 🔴 · `[KARAR]` · *4.1(a)–(c), 5.2.1*
- Popüler bir uygulamanın kopyası veya küçük ad/arayüz değişikliğiyle sunulması; başka uygulama veya hizmet kılığına girme (geliştirici programından çıkarılma sebebi); başka geliştiricinin ikonunu, markasını veya ürün adını izinsiz olarak uygulama ikonunda veya adında kullanma ("… for Instagram", "WhatsApp için …"). Meta verinin hiçbir alanında popüler uygulama adı veya marka terimi olmamalı. Geliştirici/şirket adı ve Support URL doğru ve güncel olmalı; sahte belge hesap kapatma sebebidir. İzin varsa belgesini Review Notes'a ekle.
- **Ara:** `CFBundleDisplayName`, `CFBundleName`, ikon varlıkları, yerelleştirilmiş adlar (`InfoPlist.strings`), fastlane meta verisi.

**M9.2 Minimum işlevsellik ve web sarmalayıcılar** — 🟠 · `[KOD]`/`[KARAR]` · *4.2, 4.2.1–4.2.3, 4.2.7*
- Uygulama, yeniden paketlenmiş bir web sitesinin ötesine geçen özellik, içerik ve arayüz sunmalı; kalıcı eğlence değeri veya yeterli fayda sağlamalı. Kataloglar hariç, esas olarak pazarlama materyali, reklam, web kırpıntısı, içerik toplayıcı veya bağlantı koleksiyonu olmamalı. Sadece bir şarkı/film iTunes Store'a, sadece bir kitap/oyun rehberi Apple Books'a gönderilmeli.
- **Web sarmalayıcı işaretleri:** Tüm arayüz tek bir web görünümünde uzak bir siteye bakıyor; web sitesinin üst/alt menüleri, "uygulamamızı indirin" banner'ları görünüyor; çevrimdışıyken tamamen boş.
- **İyileştirme önerileri `[KARAR]`:** yerel gezinme (tab bar), çevrimdışı durum ve önbellek, isteğe bağlı push bildirimleri, yerel paylaşım, biyometrik giriş, widget, kamera/tarama gibi yerel özellikler, derin bağlantılar; web varlıklarını pakete gömme; harici bağlantıları `SFSafariViewController`'da açma. Giriş/kayıt için varsayılan tarayıcıya çıkma — Apple bunu kötü deneyim ve Bölüm 4 açısından uygunsuz sayıyor; yerel form veya `ASWebAuthenticationSession` kullan.
- 4.2.1: ARKit kullanan uygulamalar zengin, entegre AR deneyimi sunmalı (yalnızca model yerleştirmek veya animasyon oynatmak yetmez).
- 4.2.3: Uygulama başka bir uygulamanın kurulmasına ihtiyaç duymadan çalışmalı; ilk açılışta çalışmak için ek kaynak indirmesi gerekiyorsa **indirme boyutunu söyleyip kullanıcıya sormadan** indirme.
- 4.2.7: Uzak masaüstü istemcileri yalnızca kullanıcının yerel ağdaki kendi bilgisayarına/oyun konsoluna bağlanmalı; yazılım tamamen ana cihazda çalışmalı; hesap işlemleri ana cihazda başlamalı; istemci arayüzü iOS/App Store görünümüne benzememeli ve mağaza sunmamalı; bulut uygulamalarının ince istemcileri uygun değildir.

**M9.3 Şablon ve uygulama üretici servisler** — 🔴 (varsa) · *4.2.6*
- Ticari bir şablon veya uygulama üretim servisiyle oluşturulan uygulamalar, içeriğin sahibi tarafından doğrudan gönderilmedikçe reddedilir; servisler müşterileri adına gönderim yapmamalı. Alternatif: tüm müşteri içeriğini tek bir uygulamada "seçici" modeliyle barındırmak.

**M9.4 Spam ve doymuş kategoriler** — 🔴/🟠 · `[KARAR]` · *4.3(a), 4.3(b)*
- Aynı uygulamanın birden çok Bundle ID'si (şehir, takım, üniversite, müşteri başına kopya) → tek uygulama + uygulama içi seçim veya IAP. Depoda aynı kodu farklı Bundle ID'lerle üreten çok sayıda hedef/flavor varsa raporla.
- Yaygın olanlardan ayırt edilemeyen uygulamalar kabul edilmez. Tanışma (dating), el feneri, ses efekti, duvar kâğıdı, basit zamanlayıcı, fal gibi yerleşik kategorilerde anlamlı derecede farklı veya geliştirilmiş deneyim yoksa yeni gönderim kabul edilmez; içki oyunları, Kama Sutra, osuruk/geğirme uygulamaları düşük kaliteli sayılır.

**M9.5 Uzantılar** — 🟠 · *4.4, 4.4.1, 4.4.2*
- Uzantılar ilgili Apple kılavuzlarına uymalı, mümkünse yardım/ayar arayüzü içermeli, pazarlama metninde doğru biçimde açıklanmalı; uzantılarda pazarlama, reklam veya IAP olamaz.
- **Klavye:** karakter girişi sağlamalı; görsel/emoji içeriyorsa Sticker kurallarına uymalı; sonraki klavyeye geçiş yolu sunmalı (`advanceToNextInputMode`, `needsInputModeSwitchKey`); tam erişim ve ağ erişimi olmadan çalışmalı; kullanıcı etkinliğini yalnızca klavyeyi iyileştirmek için toplamalı; Ayarlar dışında uygulama başlatmamalı; tuşları başka davranışlara atamamalı.
- **Safari uzantısı:** güncel Safari'de çalışmalı; sistem veya Safari arayüzüne müdahale etmemeli; zararlı/yanıltıcı içerik veya kod içermemeli; gerekenden fazla siteye erişim istememeli (`manifest.json` içindeki `<all_urls>` veya geniş `host_permissions` değerlerini daralt).

**M9.6 Apple siteleri, hizmetleri ve push bildirimleri** — 🟠 · *4.5.1–4.5.6*
- Apple sitelerinden veri kazıma veya buna dayalı sıralama yok (onaylı RSS beslemeleri hariç).
- MusicKit: oynatmayı kullanıcı başlatmalı, standart medya kontrolleri olmalı; Apple Music erişimi ücretlendirilemez veya dolaylı olarak paraya çevrilemez; MusicKit'ten müzik dosyası indirme/yükleme/paylaşma yok; kullanıcı verisine (çalma listeleri, favoriler) erişim purpose string'de açıklanmalı ve bu veri kimlik tespiti veya reklam hedefleme için kullanılamaz.
- Game Center, push bildirimleri, Live Activities ile spam, oltalama veya istenmeyen mesaj yok; Game Center oyuncu ID'leri uygulamada gösterilmez ve üçüncü taraflara verilmez.
- **Push bildirimleri (4.5.4):** uygulamanın çalışması için zorunlu olamaz; hassas kişisel veya gizli bilgi göndermemeli; **promosyon/doğrudan pazarlama** için yalnızca uygulama arayüzünde gösterilen açık onay metniyle izin alınmışsa ve uygulama içinde vazgeçme yolu varsa kullanılabilir. **Düzelt:** Ayarlar'a varsayılan kapalı, açık onay metinli "Kampanya ve öneri bildirimleri" anahtarı; segmentasyon için `[BACKEND]`.
- Apple emoji: Unicode karakter olarak kullanılabilir; Apple emoji görsellerini ikiliye gömmek veya başka platformlarda kullanmak yasak.

**M9.7 Mini uygulama, mini oyun, yayın oyunu, sohbet botu, eklenti, emülatör** — 🔴 (varsa) · *4.7, 4.7.1–4.7.5*
- İkiliye gömülü olmayan bu yazılımlardan (HTML5/JavaScript mini uygulama ve oyunlar dahil; retro konsol/PC emülatörlerinin oyun indirmesi de) geliştirici sorumludur; kurallara aykırı biri uygulamanın reddine yol açar.
- 4.7.1: Gizlilik kurallarına uymalı (çocuk ve sağlık verisi dahil); filtreleme, içerik bildirme ve zamanında yanıt, taciz edenleri engelleme; dijital mal/hizmetler için 3.1.
- 4.7.2: Apple'ın önceden izni olmadan bu yazılımlara yerel platform API'leri/teknolojileri açılamaz (ör. JS köprüsüyle kamera, konum sunmak).
- 4.7.3: Bu yazılımlardan herhangi birine veri veya gizlilik izni paylaşımı **her seferinde** açık kullanıcı onayıyla.
- 4.7.4: Sunulan yazılımların ve meta verilerinin bir dizini; her birine giden universal link'ler.
- 4.7.5: Uygulamanın yaş derecesini aşan yazılımları belirleme yolu ve doğrulanmış/beyan edilmiş yaşa dayalı yaş kısıtlama mekanizması.

**M9.8 Tasarım kalitesi** — 🟡 · *Bölüm 4 girişi, DPLA 3.3.1(G)*
- Çalışmayı bırakan veya kalitesi düşen uygulamalar kaldırılabilir. HIG'e uygun, platforma özgü arayüz; kırık düzen, okunmayan metin, Dynamic Type'ta taşan arayüz, karanlık modda kaybolan öğeler kalite sorunudur.

### M10 — Hukuk, fikri mülkiyet ve özel kategoriler (5.2–5.6)

**M10.1 Fikri mülkiyet** — 🔴 · `[KARAR]`/`[HUKUK]` · *5.2.1–5.2.3, 2.3.9*
- İzinsiz marka, telif hakkıyla korunan eser (görsel, müzik, font, video, spor logoları, film görüntüleri) veya patentli fikir kullanma; uygulama paketinde veya geliştirici adında yanıltıcı/taklit ad ve meta veri. Uygulama, fikri mülkiyetin sahibi veya lisans sahibi tarafından gönderilmeli.
- Üçüncü taraf bir hizmetin içeriğini kullanma, gösterme veya paraya çevirme ancak o hizmetin kullanım koşulları özellikle izin veriyorsa (resmi olmayan API'ler, kazıma). İstenirse izin belgesi sunulmalı.
- Apple Music, YouTube, SoundCloud, Vimeo vb. kaynaklardan medya kaydetme, dönüştürme veya indirme, kaynağın açık izni olmadan yasak; yasa dışı dosya paylaşımını kolaylaştırma yok; akış (streaming) da kullanım koşullarını ihlal edebilir.
- **Ara:** Varlık klasörlerinde başka markaların logoları, lisansı belirsiz müzik/görsel/font dosyaları, medya indirme kütüphaneleri.

**M10.2 Apple markası ve ürünleri** — 🟠 · *5.2.4, 5.2.5*
- Apple'ın uygulamanın kaynağı/tedarikçisi olduğunu veya herhangi bir kalite/işlev iddiasını onayladığını ima etme ("Apple onaylı" vb.); "Editor's Choice" rozetini kendin ekleme (Apple otomatik ekler).
- Mevcut bir Apple ürünü, arayüzü (Finder), uygulaması (App Store, iTunes Store, Mesajlar) veya reklam temasıyla karıştırılacak benzerlik yok. Klavye ve çıkartma paketleri dahil uygulamalar Apple emoji içeremez. iTunes ve Apple Music önizlemeleri eğlence amacıyla (fotoğraf kolajı arka plan müziği, oyun müziği) kullanılamaz; önizleme sunuluyorsa ilgili esere bağlantı gösterilmeli. Activity halkaları Move/Exercise/Stand verisini Activity kontrolüne benzer biçimde göstermemeli. Apple Weather (WeatherKit) verisi gösteriliyorsa atıf gereksinimleri uygulanmalı.
- Apple ticari markalarını Apple'ın üçüncü taraf kılavuzuna göre kullan; uygulama adında "Apple" veya Apple ürün adlarını kullanma.

**M10.3 Oyun, kumar, çekiliş, piyango** — 🔴 · `[KOD]`/`[HUKUK]` · *5.3.1–5.3.4*
- Çekiliş ve yarışmalar uygulamanın geliştiricisi tarafından sponsor edilmeli. Çekiliş, yarışma ve raffle'ların **resmi kuralları uygulama içinde** sunulmalı ve **Apple'ın sponsor olmadığı ve etkinliğe hiçbir şekilde dahil olmadığı** açıkça belirtilmeli.
- Gerçek parayla oynanan oyunlar için kredi veya para IAP ile satılamaz.
- Gerçek parayla oyun (spor bahsi, poker, casino, at yarışı) ve piyangolar: kullanıldığı her yerde lisans ve izinler, bu yerlere coğrafi kısıtlama, App Store'da ücretsiz uygulama. Kart sayma gibi yasa dışı kumar yardımcıları yasak. Piyangoda bedel, şans ve ödül unsurları bulunmalı. Brezilya'da kumar özelliği olan uygulamalar için geçerli SPA (Secretariat of Prizes and Bets) sabit oranlı bahis lisansı gerekir; yaş anketinde kumar sorusuna "Evet" yanıtı Brezilya derecesini A18 yapar; lisans bilgisini App Review Information'a ekle (Apple duyurusu, 8 Mayıs 2026; App Store Connect yaş derecelendirme sayfası).
- **Düzelt:** Çekiliş ekranına kurallar sayfası ve "Apple bu etkinliğin sponsoru değildir ve etkinlikle hiçbir şekilde ilişkili değildir." ibaresi (uygulamanın tüm dillerinde). Türkiye'de çekilişli kampanyalar için yasal izin gerekebilir → `[HUKUK]`.

**M10.4 VPN** — 🔴 (varsa) · *5.4*
- `NEVPNManager` API'si; kurum olarak kayıtlı geliştirici; satın alma veya kullanımdan önce **bir uygulama ekranında** hangi verilerin toplanıp nasıl kullanılacağının açık beyanı; verileri hiçbir amaçla satmama, kullanmama, üçüncü taraflara açıklamama ve bunun gizlilik politikasında taahhüdü; yerel yasalara uyum; VPN lisansı gereken ülkelerde lisans bilgisi Review Notes'ta. Onaylı sağlayıcılardan ebeveyn denetimi, içerik engelleme ve güvenlik uygulamaları da `NEVPNManager` kullanabilir.

**M10.5 Mobil cihaz yönetimi (MDM)** — 🔴 (varsa) · *5.5*
- Apple'dan yetki talebi; yalnızca ticari işletme, eğitim kurumu, devlet kurumu (sınırlı durumlarda ebeveyn denetimi/cihaz güvenliği şirketleri); veri beyanı ekranı; veri satma/kullanma/açıklama yok ve gizlilik politikasında taahhüt; üçüncü taraf analitik yalnızca MDM uygulamasının performansıyla sınırlı. Yapılandırma profili sunan uygulamalar da bu şartlara tabidir.

**M10.6 Puanlama istemleri ve yorum manipülasyonu** — 🟠 · `[KOD]` · *5.6.1, 3.2.2(x), Bölüm 3 girişi, 5.6.3*
- Değerlendirme istemek için **yalnızca Apple'ın API'si**: `SKStoreReviewController.requestReview(in:)`, SwiftUI `@Environment(\.requestReview)`, Flutter `in_app_review`, Expo `expo-store-review`. **Özel puanlama istemleri** (kendi yıldız diyaloğun) yasak. Ayarlar'da kullanıcının kendi başlattığı "App Store'da değerlendir" bağlantısı (`…?action=write-review`) genellikle sorun değildir; otomatik açılan özel istem sorundur.
- Ödüllü, **filtrelenmiş** (önce "memnun musun?" diye sorup yalnızca memnunları mağazaya yönlendirmek) veya sahte geri bildirimle sıralama şişirme, Apple'ın açıkça saydığı manipülasyon türleridir → kaldır; doğrudan sistem istemini kullan.
- Erişimi puan/yorum şartına bağlama yasak (3.2.2(x)).

**M10.7 Geliştirici davranış kuralları ve dürüstlük** — 🟠 · *5.6, 5.6.2–5.6.4*
- Kullanıcıyı istemediği satın almaya kandırma, gereksiz veri paylaşmaya zorlama, fiyatı hileli biçimde artırma, teslim edilmeyen özellik/içerik için ücret alma ve uygulama içinde/dışında her türlü manipülatif uygulama yasak. Geliştirici kimliği ve iletişim bilgileri doğru, ilgili ve güncel olmalı. Sıralama, arama, yorum veya yönlendirme manipülasyonu yasak. Aşırı şikâyet, olumsuz yorum ve iade talebi kalite sorununun göstergesidir.

### M11 — Yaş derecelendirmesi ve yaş güvencesi

**M11.1 Yaş anketi** — 🔴 · `[ASC]` · *2.3.6, Upcoming Requirements, Age ratings values and definitions*
- Anket dürüstçe yanıtlanmalı; yanlış derecelendirme kullanıcıları şaşırtabilir ve düzenleyici soruşturmaya yol açabilir. Film, müzik, oyun gibi derecelendirme/uyarı gerektiren medya varsa her bölgenin yerel şartları da geçerlidir.
- Yeni sistem (iOS/iPadOS/macOS/tvOS/visionOS/watchOS 26+ cihazlarda): **4+, 9+, 13+, 16+, 18+**. Güncellenmiş sorulara 31 Ocak 2026'ya kadar yanıt verilmesi gerekiyordu; yanıtlanmamışsa güncelleme gönderiminde kesinti yaşanır. Sosyal medya yeteneklerine ilişkin sorular 9 Temmuz 2026'da eklendi ve Eylül 2026'dan beri yeni gönderimlerde yanıtlanması zorunlu; iOS 27'deki Time Allowances (ebeveynlerin Eğlence, Oyun ve Sosyal Medya uygulamalarındaki süreyi yönetmesi) nedeniyle sosyal medya yeteneklerini App Store Connect'te doğru belirt.
- Kategoriler: Uygulama içi kontroller (ebeveyn denetimi, yaş güvencesi); Yetenekler (kısıtlamasız web erişimi, UGC, sosyal medya, 13 yaş altına kapalı sosyal medya, mesajlaşma ve sohbet, reklam); Olgun temalar; Tıbbi/sağlıklı yaşam; Cinsellik/çıplaklık; Şiddet; Şansa dayalı etkinlikler (kumar, simüle kumar, yarışmalar, ganimet kutuları).
- **Koddan çıkarılacak ipuçları (genel değerler):** uygulama içinde serbest web gezintisi ("Unrestricted Web Access") → **16+**; sosyal medya (UGC'yi beğeni/yorum/paylaşımla akışta yayma) → **13+** ("13 yaş altına kapalı sosyal medya" seçeneği için en azından Declared Age Range API ile yaş aralığı kontrol edilmeli); ganimet kutusu → **9+**; seyrek tıbbi/tedavi bilgisi → 13+, sık → 16+; gerçek parayla kumar → **18+**; UGC, mesajlaşma, reklam tek başına → 4+. Grafik cinsel içerik veya uzun süreli grafik/sadistik gerçekçi şiddet → "Unrated" (App Store'da yayımlanamaz). Avustralya, Brezilya, Kore ve Vietnam'da bölgesel değerler farklıdır (ör. Brezilya'da reklam ve mesajlaşma A12, ganimet kutusu ve kumar A18; Avustralya'da sosyal medya ve ganimet kutusu 16+).
- **Çıktı:** Raporda kanıta dayalı soru–yanıt taslak tablosu üret; kullanıcı App Store Connect'te doğrular.

**M11.2 Yaş güvencesi** — 🟠 · `[KARAR]`/`[HUKUK]` · *1.2.1(a), 4.7.5, Declared Age Range API*
- Uygulama derecesini aşan creator içeriği, mini uygulama veya bot sunuyorsa doğrulanmış/beyan edilmiş yaşa dayalı kısıtlama zorunludur. Apple'ın **Declared Age Range API**'si (iOS 26+) tam doğum tarihi istemeden yaş aralığı ve yaş güvencesi yöntemi sinyali sağlar; Apple bu API'yi bölgesel yaş güvencesi yasalarına uyum için genişletti (Apple duyurularına göre Brezilya, Avustralya, Singapur; ABD'de yeni hesaplar için Utah — 6 Mayıs 2026, Louisiana — 1 Temmuz 2026, Teksas SB 2420 — 4 Haziran 2026). İlgili araçlar: Declared Age Range API sinyalleri, önemli güncellemelerde veli onayı için PermissionKit Significant Change API ve ilgili App Store Server Notifications. Bu bölgelerde dağıtım yapılıyorsa yükümlülükleri kullanıcıyla netleştir; Apple'ın güncel geliştirici duyurularını kontrol et.

---

## 7. ADIM 4 — Düzeltme protokolü

Sıra: 🔴 → 🟠 → 🟡 → 🔵; her seviyede önce `[KOD]`.

**Onay beklemeden uygulayabileceklerin (düşük risk):**
- Purpose string ekleme, yeniden yazma ve yerelleştirme
- `PrivacyInfo.xcprivacy` oluşturma/güncelleme (uygulamanın kendi kodu için)
- Minimum dağıtım hedefini 13'e çekme (yalnızca 13'ün altındaysa)
- Kullanılmadığı kanıtlanan arka plan modunu, entitlement'ı veya izin anahtarını kaldırma
- "Satın Alımları Geri Yükle" düğmesi
- Gizlilik/Kullanım Koşulları bağlantıları (mevcut URL'lerle; URL yoksa `TODO(appstore)` + `[KARAR]`)
- Paywall metin ve görsel hiyerarşisi düzeltmeleri (toplam tutarın belirginliği, deneme açıklaması, teklif uygunluk kontrolü)
- Özel izin ön ekranında düğme metni düzeltmesi ve çıkış düğmesinin kaldırılması
- iPad popover kaynakları ve iPad yönelim listesi
- Diğer platform referanslarını iOS'ta gizleme
- Release'te debug/staging kalıntılarını derleme dışına alma
- Özel puanlama istemini sistem API'siyle değiştirme
- Reklam SDK'sını uzantı hedeflerinden çıkarma
- Çekiliş ekranına Apple sorumluluk reddi ibaresi

**Önce onay iste (DUR → seçenekleri sun → diğer maddelere devam et):**
- Ödeme yöntemi/iş modeli değişikliği, IAP entegrasyonu, harici bağlantıları kaldırma veya koşullandırma
- Bir özelliği veya SDK'yı kaldırma (reklam, analitik, OTA)
- Backend gerektiren yeni akışlar: hesap silme uç noktası, moderasyon, SIWA sunucu doğrulaması ve token iptali
- Sign in with Apple ekleme (Apple Developer hesabında capability ve App Store Connect tarafı gerekir)
- ATT akışı ekleme ve SDK başlatma sırasını değiştirme (gelir/analitik etkisi)
- Major bağımlılık veya framework yükseltmesi
- Uygulama adı, ikon, marka, ürün iddiaları
- Hukuki metinler (yalnızca taslak üret)
- Yaş kısıtlama ve bölgesel uyum mantığı

**Her düzeltme için:** ne değişti, hangi kural, hangi dosyalar, nasıl doğrulandı → rapora işle; modül bazında commit.

## 8. ADIM 5 — Doğrulama

- **Derleme (imzasız):**
  - Native: `xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build` (workspace yoksa `-project`)
  - Flutter: `flutter analyze && flutter test && flutter build ios --release --no-codesign`
  - React Native: TypeScript ise `npx tsc --noEmit`; `npx eslint .`; `cd ios && pod install` ardından xcodebuild
  - Expo: `npx expo-doctor`; `npx expo config --type introspect` (son Info.plist, entitlement ve manifest sonucunu dosya yazmadan gösterir); `ios/` commit'li değilse prebuild çalıştırma
  - Capacitor: `npx cap sync ios` ardından xcodebuild
- **Plist geçerliliği:** macOS'ta `plutil -lint <dosya>`; Linux'ta `python3 -c "import plistlib,sys; plistlib.load(open(sys.argv[1],'rb')); print('OK')" <dosya>`.
- Ek A kalıplarını tekrar çalıştır; kalan 🔴 bulgu olmadığını göster veya kalanları gerekçesiyle listele.
- macOS/Xcode yoksa statik doğrulamayla yetin ve raporda "derleme doğrulanamadı" diye açıkça yaz.
- **Kullanıcı için manuel test listesi** (rapora ekle): iPhone ve iPad'de temiz kurulum; uçak modu; tüm izinleri reddetme; IPv6/NAT64 test ağı (macOS İnternet Paylaşımı'ndaki NAT64 seçeneği); sandbox hesabıyla satın alma, geri yükleme ve süresi dolmuş abonelikli hesap; uçtan uca hesap silme; demo hesapla giriş; UGC bildir/engelle; ATT isteminin görünmesi; AI onay ekranı; derin bağlantılar; arka plan modlarının ilgili özellikleri.

## 9. ADIM 6 — Rapor şablonu (`APP_STORE_REVIEW_REPORT.md`)

```markdown
# App Store İnceleme Uyumluluk Raporu — {Uygulama} {sürüm}

- Tarih: {YYYY-MM-DD} · Mod: {A/B/C}
- Dayanılan guideline sürümü: 16 Ekim 2026 (canlı sayfa kontrolü: {yapıldı, tarih / yapılamadı})
- Yığın: {…} · Hedefler: {uygulama, widget, …} · Derleme doğrulaması: {başarılı / yapılamadı — neden}

## 1. Sonuç
{Bilinen engel kaldı mı? Gönderimden önce yapılması gereken ilk 3 iş.}

| Seviye | Bulunan | Düzeltildi | Karar/backend bekliyor | ASC'de yapılacak |
|---|---|---|---|---|
| 🔴 | | | | |
| 🟠 | | | | |
| 🟡 | | | | |
| 🔵 | | | | |

## 2. Uygulama profili
{ADIM 2 tablosu; geçerli/uygulanamaz modüller ve gerekçeleri}

## 3. Bulgular
| ID | Kural | Seviye | Etiket | Konum | Sorun | Durum |
|---|---|---|---|---|---|---|
| F-01 | 5.1.1(v) | 🔴 | KOD+BACKEND | `Settings/AccountView.swift:42` | Hesap silme yok | UI eklendi · backend bekliyor |

{Her bulgu için: kanıt, neden ret riski, yapılan veya önerilen değişiklik.}

## 4. Yapılan değişiklikler
| Dosya | Değişiklik | Kural | Commit |

## 5. Karar bekleyen konular
{Her biri: bağlam, seçenekler (artı/eksi), önerilen seçenek, etkisi.}

## 6. App Store Connect yapılacaklar listesi
{Bölüm 10'dan yalnızca ilgili maddeler, somut değerlerle.}

## 7. App Privacy etiketi taslağı
| Veri türü | Kaynak (kod/SDK) | Amaç | Kimliğe bağlı | İzleme |

## 8. Yaş derecelendirme anketi taslağı
| Kategori/soru | Önerilen yanıt | Kanıt |

## 9. App Review Notes taslağı (İngilizce)

## 10. Doğrulama sonuçları ve manuel test listesi

## 11. Varsayımlar, sınırlamalar ve doldurulması gereken yer tutucular (TODO(appstore))
```

## 10. App Store Connect yapılacaklar listesi (rapora uyarlayarak kopyala)

**Uygulama bilgileri ve meta veri**
- [ ] Ad ≤ 30 karakter; marka/rakip adı, fiyat, alakasız ifade yok (2.3.7, 4.1)
- [ ] Alt başlık: başka uygulamalara atıf ve doğrulanamaz iddia yok (2.3.7)
- [ ] Anahtar kelimeler: marka ve popüler uygulama adları yok (2.3.7)
- [ ] Kategori doğru (2.3.5)
- [ ] Privacy Policy URL dolu ve çalışıyor (5.1.1(i))
- [ ] Support URL çalışıyor ve iletişim yolu içeriyor (1.5)
- [ ] Abonelik varsa: açıklamada Kullanım Koşulları (EULA) bağlantısı veya özel EULA alanı (3.1.2)
- [ ] Açıklama: ek satın alma gerektiren öğeler belirtilmiş (2.3.2); diğer platform adı yok (2.3.10); yanıltıcı iddia yok (2.3.1)
- [ ] "What's New" önemli değişiklikleri spesifik anlatıyor (2.3.12)
- [ ] Yaş anketi yeni sisteme göre (sosyal medya soruları dahil), dürüst ve kodla tutarlı (2.3.6, M11)
- [ ] App Privacy etiketi kod, SDK ve manifest ile tutarlı; izleme beyan edildiyse ATT uygulanmış (5.1.2, M4.21)
- [ ] Ekran görüntüleri uygulamayı kullanımda gösteriyor; iPad destekleniyorsa iPad görüntüleri; kurgusal veriler (2.3.3, 2.3.9)
- [ ] Önizlemeler yalnızca uygulama ekran kaydı (2.3.4); creative asset'lerde fiyat/indirim yok (2.3.14)
- [ ] İhracat uyumluluğu, içerik hakları beyanı ve App Store Connect'in istediği diğer beyan/anketler tamamlandı
- [ ] Health & Fitness/Medical kategorisinde veya sık tıbbi bilgi içeren uygulamalarda AEA/Birleşik Krallık/ABD için düzenlenmiş tıbbi cihaz durumu beyan edildi (mevcut uygulamalar için son tarih 2027 başı) (M7.5)
- [ ] Nisan 2027 ve sonrası gönderimler için iPhone Duo ekran görüntüleri hazır (M0.1)
- [ ] AB'de dağıtım varsa DSA tacir (trader) statüsü verilmiş ve doğrulanmış (17 Şubat 2025'ten beri tacir statüsü olmayan uygulamalar AB'de kaldırılıyor)

**Satın almalar**
- [ ] Paid Apps Agreement aktif (Business bölümü)
- [ ] Tüm IAP/abonelikler eksiksiz yapılandırılmış (ad, açıklama, fiyat, inceleme ekran görüntüsü ve notu), "Ready for Review" durumunda ve incelemeye gönderilmiş; uygulamanın ilk IAP'leri bu sürümle birlikte (2.1(b))
- [ ] Abonelikler doğru grupta; tanıtım teklifleri doğru yapılandırılmış (3.1.2(a), 3.1.2(b))
- [ ] Sandbox hesabıyla satın alma ve geri yükleme test edildi
- [ ] Harici satın alma entitlement'ı kullanılıyorsa ilgili bölgelerde onaylı (3.1.1(a))

**App Review Information**
- [ ] Demo hesaplar çalışıyor: her rol için ayrı, süresi dolmuş abonelikli hesap, OTP kodu notta (2.1)
- [ ] Review Notes (Bölüm 11) — yeni özellikler spesifik; özelliklerin yeri; dış hizmetler (AI dahil); bölgesel farklar; test edilen cihaz/OS
- [ ] Gerekli belgeler eklendi: lisans, düzenleyici onay, marka izni, ortaklık belgesi (Before You Submit, 5.1.1(ix))
- [ ] İletişim bilgileri güncel; backend inceleme boyunca açık
- [ ] Gerekirse Xcode Organizer'da Validate App ve Generate Privacy Report çalıştırıldı

## 11. App Review Notes şablonu (İngilizce)

```text
App Review Notes — {App Name} {version} ({build})

1) Overview
{App Name} lets users {core value}. Audience: {audience}. Business model: {free / IAP / subscription / ads / physical goods via {provider}}.

2) Demo access
- Standard user: {email} / {password}
- {Admin / second role}: {email} / {password}
- Subscription review: {email} / {password} (subscription expired, so the full purchase flow is visible)
- One-time code, if prompted: {code} (static code for this review account only)

3) Where to find key features
- In-app purchases / subscriptions: {path}. Restore Purchases: {path}.
- Account deletion: Settings > Account > Delete Account.
- Report / block (user-generated content): {path}.
- Privacy Policy and Terms of Use: {path}.
- App Tracking Transparency prompt appears {when}.
- AI features: {path}. User data is sent to {provider} only after the user consents on {screen}.

4) Changes in this version
- {specific change 1}
- {specific change 2}

5) External services
- Authentication: {…} · Payments: StoreKit for digital content{, {provider} for physical goods only} · AI: {…} · Analytics: {…}

6) Regional differences
- {None / describe}

7) Hardware or other requirements
- {None / video link showing the app on a physical device with the hardware}

8) Tested on
- iPhone {models} (iOS {x}), iPad {models} (iPadOS {x})

Contact: {name} · {phone} · {email}
```

## 12. Mod B — Resolution Center yanıt şablonu (İngilizce)

```text
Hello App Review team,

Thank you for the feedback on Guideline {x.y.z}. We addressed it in build {build}:

- {What was wrong} → {What we changed}. You can verify it at {exact path/steps}.
- {…}

{If metadata changed:} We also updated {field} in App Store Connect.

Please let us know if you need anything else.

Best regards,
{Name}
```

---

## Ek A — Hızlı tarama kalıpları (ripgrep)

```bash
# Yardımcılar
# Not: Yol her zaman açıkça verilir (sondaki `.`). Yol verilmezse ve stdin bir pipe ise rg stdin'i okumaya çalışıp takılır.
rgapp() { rg -n --hidden -g '!**/{Pods,node_modules,build,DerivedData,.dart_tool,.symlinks,android,.git,vendor,Carthage,.expo,dist}/**' "$@" . ; }  # yalnızca uygulama kodu
rgall() { rg -n --hidden -uu -g '!**/{.git,DerivedData}/**' "$@" . ; }  # SDK'lar dahil (ikili dosyalar için ayrıca grep -rl)

# --- M0: yükleme engelleri ---
rgall -l 'UIWebView'; grep -rl 'UIWebView' ios Pods 2>/dev/null
rgall 'IPHONEOS_DEPLOYMENT_TARGET\s*=|platform :ios|\.iOS\(\.v|MinimumOSVersion|deploymentTarget'
rgall -o -I -N -g '*.plist' -g '*.strings' -g '*.xcstrings' -g 'app.json' -g 'app.config.*' 'NS[A-Za-z]+UsageDescription|NFCReaderUsageDescription' | sort -u
rg --files . | rg 'PrivacyInfo\.xcprivacy$'
rgapp 'UserDefaults|NSUserDefaults|@AppStorage|creationDate|modificationDate|contentModificationDateKey|creationDateKey|getattrlist|\bf?stat\(|lstat\(|fstatat|statfs|statvfs|systemUptime|mach_absolute_time|volumeAvailableCapacity|volumeTotalCapacity|systemFreeSize|systemSize|activeInputModes'
rgall -A14 -g '*.plist' 'UIBackgroundModes'
rgall -g '*.entitlements' 'aps-environment|com\.apple\.developer\.'
rgall 'ITSAppUsesNonExemptEncryption|UILaunchStoryboardName|UILaunchScreen|UIRequiresFullScreen|UISupportedInterfaceOrientations'

# --- M1: bütünlük ---
rgapp -i 'lorem ipsum|coming soon|yakında|placeholder|dummy|asdf|qwerty|under construction|yapım aşamasında'
rgapp 'localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.|ngrok|staging|dev-api|api-dev|\.local\b'
rgapp -g '*.swift' 'fatalError\(|try!|as! |precondition\('
rgapp 'UIActivityViewController|\.actionSheet|UIAlertControllerStyleActionSheet|popoverPresentationController|ShareLink'
rgapp 'Share\.share|ActionSheetIOS|sharePositionOrigin|SharePlus|share_plus'
rgapp -i 'debug ?menu|dev ?menu|developer options|geliştirici seçenekleri|\bbeta\b|test sürümü|demo version'

# --- M2: gizli özellik, meta veri ---
rgapp -i 'isReview|reviewMode|review_mode|inReview|isAppleReview|hideForReview|cupertino|isTestFlight|sandboxReceipt|appStoreReceiptURL'
rgapp -i 'remoteConfig|feature_?flag|LaunchDarkly|Statsig|GrowthBook|ConfigCat|Flagsmith|Unleash|Optimizely'
rgapp -i 'android|google ?play|play ?store|playstore|huawei|appgallery|galaxy store|get it on'
rgapp -i 'antivirus|virus scan|virüs tara|malware|ram (cleaner|booster)|battery doctor|pil doktoru'

# --- M3: donanım/yazılım ---
rgapp 'dlopen|dlsym|NSClassFromString\(@?"_|valueForKey:@"_|value\(forKey: ?"_|LSApplicationWorkspace|_UIApplication|objc_msgSend'
rgapp -i 'JSPatch|Rollout|evaluateScript|JSContext|new Function\(|\beval\(|codepush|expo-updates|fetchUpdateAsync|shorebird'
rgall -g 'capacitor.config.*' -A3 'server'
rgapp 'inet_addr|inet_aton|gethostbyname|AF_INET\b|sockaddr_in\b|SCNetworkReachabilityCreateWithAddress|https?://\d{1,3}(\.\d{1,3}){3}'
rgapp 'outputVolume|MPVolumeView|AVCaptureEventInteraction'
rgapp 'AVAudioRecorder|AVCaptureSession|RPScreenRecorder|ReplayKit|startRecording|installTap'
rgapp 'UIDocumentPickerViewController|fileImporter|DocumentPicker|file_picker|expo-document-picker'
rgall -il 'GoogleMobileAds|GADMobileAds|AppLovin|IronSource|LevelPlay|UnityAds|FBAudienceNetwork|Pangle|InMobi|Vungle|Liftoff|Mintegral|Chartboost|google_mobile_ads|react-native-google-mobile-ads'
rgall -il 'Sparkle'   # macOS hedefinde

# --- M4: gizlilik ---
rgapp -i 'privacy|gizlilik|kvkk|aydınlatma|terms|eula|kullanım koşulları'
rgapp -i 'delete ?account|deleteAccount|account ?deletion|hesab(ı|ımı) sil|hesap silme|deactivate'
rgapp 'requestTrackingAuthorization|ATTrackingManager|ASIdentifierManager|advertisingIdentifier|AdSupport|app_tracking_transparency|expo-tracking-transparency|react-native-tracking-transparency'
rgall -il 'FBSDKCoreKit|FacebookCore|AppsFlyer|Adjust|Branch|Singular|Kochava|Tenjin|AppMetrica|FirebaseAnalytics|Amplitude|Mixpanel|Segment|Braze|CleverTap|OneSignal|Airship|Smartlook|UXCam|FullStory'
rgapp 'requestAuthorization|requestAccess|requestWhenInUseAuthorization|requestAlwaysAuthorization|PHPhotoLibrary|PHPickerViewController|PhotosPicker|CNContactStore|CNContactPickerViewController|EKEventStore|CLLocationManager|allowsBackgroundLocationUpdates|HKHealthStore|SFSpeechRecognizer|CBCentralManager|LAContext|NFCNDEFReaderSession|CMMotionActivityManager'
rgapp -A40 -g '*.plist' 'LSApplicationQueriesSchemes'; rgapp 'canOpenURL'
rgapp 'SFSafariViewController'
rgapp 'NSUbiquitousKeyValueStore|CKContainer|CloudKit'   # sağlık verisiyle birlikteyse kritik
rgapp -i 'select ?all|tümünü seç|selectAll'              # kişi davet akışlarında
rgapp 'sk-[A-Za-z0-9_-]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{35}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|xox[baprs]-[A-Za-z0-9-]+|ghp_[A-Za-z0-9]{36}'
rgapp 'NSAllowsArbitraryLoads|NSExceptionAllowsInsecureHTTPLoads'
rgapp -P 'http://(?!localhost|127\.0\.0\.1|www\.apple\.com/DTDs)'

# --- M5: giriş ---
rgall -il 'GoogleSignIn|GIDSignIn|google_sign_in|@react-native-google-signin|FBSDKLoginKit|flutter_facebook_auth|react-native-fbsdk|LoginWithAmazon|WechatOpenSDK|KakaoSDK|LineSDK'
rgapp 'ASAuthorizationAppleIDProvider|SignInWithAppleButton|ASAuthorizationAppleIDButton|sign_in_with_apple|expo-apple-authentication|react-native-apple-authentication|com\.apple\.developer\.applesignin'
rgapp -i 'appleid\.apple\.com/auth/revoke|revokeToken|revoke'

# --- M6: ödemeler ---
rgall -l 'StoreKit|SKPaymentQueue|Product\.purchase|Transaction\.currentEntitlements|RevenueCat|Purchases\.shared|purchases_flutter|react-native-purchases|react-native-iap|expo-iap|in_app_purchase|Adapty|Qonversion|Superwall|Glassfy|Apphud'
rgapp -i 'restore|geri yükle|AppStore\.sync|restoreCompletedTransactions|restorePurchases|getAvailablePurchases'
rgapp -i 'stripe|paypal|braintree|iyzico|paytr|craftgate|papara|adyen|paddle|lemonsqueezy|gumroad|payment ?link|web ?checkout|sitemizden satın|web.?den satın'
rgapp -i 'free trial|ücretsiz dene|deneme süresi|introductory|isEligibleForIntroOffer|per month|/month|aylık|yıllık|/year|haftalık|displayPrice|localizedPrice'
rgapp -i 'loot ?box|gacha|mystery box|sürpriz kutu|kasa aç|chest'
rgapp -i 'license key|lisans anahtarı|activation code|aktivasyon kodu|unlock code|redeem'
rgapp -i 'expire|expiration|son kullanma|süresi dol'      # sanal para/kredi bağlamında incele
rgapp -i 'web3|walletconnect|ethers|solana|bitcoin|\bnft\b|mining|madencilik'
rgapp -i '\bapr\b|yıllık faiz|loan|kredi başvurusu|taksit'
rgapp 'PKPaymentAuthorizationController|PKPaymentButton|PKPaymentRequest|apple_pay|ApplePay'

# --- M7: içerik ve güvenlik ---
rgapp -i 'report|şikayet|bildir|block|engelle|mute|flag|moderat'
rgapp -i 'nsfw|explicit|\+18|18\+|yetişkin'
rgapp -i 'parental ?gate|ebeveyn'
rgapp -i 'blood pressure|tansiyon|glucose|kan şekeri|spo2|oksijen|heart rate|nabız|teşhis|diagnos|dosage|dozaj|x-?ray|röntgen'
rgapp -i 'support|destek|contact|iletişim|mailto:'

# --- M8: yapay zekâ ---
rgall -il 'api\.openai\.com|openai|anthropic|generativelanguage\.googleapis|gemini|vertexai|mistral|groq|replicate|huggingface|cohere|deepseek|perplexity|openrouter|elevenlabs|stability\.ai|bedrock|FoundationModels|LanguageModelSession'
rgapp -i 'moderation|content ?filter|safety|içerik filtre|consent|rıza|onay'

# --- M9: tasarım ---
rgapp 'WKWebView|react-native-webview|webview_flutter|flutter_inappwebview|InAppBrowser|@capacitor|cordova'
rgall -i -g '*.plist' -g '*.strings' -g '*.xcstrings' -g '*.json' 'CFBundleDisplayName|CFBundleName|"name"'
rgapp -i 'instagram|tiktok|whatsapp|chatgpt|youtube|netflix|spotify|snapchat|telegram|facebook|twitter'   # ad, ikon, metin bağlamında
rgapp 'registerForRemoteNotifications|UNUserNotificationCenter|FirebaseMessaging|firebase_messaging|OneSignal|notifee|expo-notifications|flutter_local_notifications'
rgapp -i 'kampanya|promosyon|promo|indirim|discount|marketing'
rgapp 'advanceToNextInputMode|needsInputModeSwitchKey|RequestsOpenAccess'
rgall -g 'manifest.json' '<all_urls>|host_permissions|"matches"'

# --- M10: hukuk ve özel kategoriler ---
rgapp -i 'youtube-dl|yt-dlp|ytdl|youtube_explode|downloader|video indir'
rgapp -i 'sweepstake|giveaway|raffle|çekiliş|contest|yarışma|lottery|piyango|bahis|\bbet\b|casino|slot|poker'
rgapp 'SKStoreReviewController|requestReview|RequestReviewAction|write-review|in_app_review|expo-store-review|react-native-rate'
rgapp -i 'rate us|bizi değerlendir|puan ver|5 yıldız|5 stars|enjoying|beğendiniz mi|memnun musunuz'
rgapp 'NEVPNManager|NETunnelProviderManager|NEPacketTunnelProvider|WireGuard|OpenVPN|NEFilter'
rgapp 'WeatherService|WeatherKit'
```

## Ek B — Info.plist izin anahtarları (purpose string'ler)

**Kalıp:** "Uygulama, [somut özellik] için [kaynak]ı kullanır; örneğin [somut durum]." Tek, tam cümle; etken çatı; nokta ile biter; yalnızca **doğru** iddialar (verinin nereye gittiğini yanlış söyleme). Desteklenen her dile yerelleştir.

| Anahtar | Ne zaman | Örnek (TR) |
|---|---|---|
| `NSCameraUsageDescription` | Kamera | Uygulama, profil fotoğrafı çekmen için kamerayı kullanır; örneğin hesabına yeni bir fotoğraf eklerken. |
| `NSMicrophoneUsageDescription` | Mikrofon | Uygulama, sesli not kaydetmen için mikrofonu kullanır; örneğin bir göreve sesli açıklama eklerken. |
| `NSPhotoLibraryUsageDescription` | Fotoğraf arşivini okuma (seçici yetmiyorsa) | Uygulama, seçtiğin albümlerdeki fotoğrafları kolaj düzenleyicide göstermek için fotoğraf arşivine erişir. |
| `NSPhotoLibraryAddUsageDescription` | Fotoğraflar'a kaydetme | Uygulama, düzenlediğin görselleri Fotoğraflar'a kaydetmek için izin ister. |
| `NSLocationWhenInUseUsageDescription` | Konum (kullanımda) | Uygulama, yakınındaki mağazaları listelemek ve yol tarifi vermek için konumunu kullanır. |
| `NSLocationAlwaysAndWhenInUseUsageDescription` | Arka planda konum | Uygulama, antrenman kaydı sürerken ekran kapalıyken de rotanı kaydetmek için konumunu kullanır. |
| `NSContactsUsageDescription` | Kişiler (seçici yetmiyorsa) | Uygulama, seçtiğin kişileri etkinliğe davet edebilmen için rehberine erişir. |
| `NSCalendarsFullAccessUsageDescription` / `NSCalendarsWriteOnlyAccessUsageDescription` | Takvim (iOS 17+) | Uygulama, rezervasyonunu takvimine eklemek için takvime erişir. |
| `NSRemindersFullAccessUsageDescription` | Anımsatıcılar (iOS 17+) | Uygulama, alışveriş listeni Anımsatıcılar ile eşitlemek için erişim ister. |
| `NSBluetoothAlwaysUsageDescription` | Bluetooth | Uygulama, akıllı tartına bağlanıp ölçümleri almak için Bluetooth'u kullanır. |
| `NSLocalNetworkUsageDescription` (+ `NSBonjourServices`) | Yerel ağ | Uygulama, aynı Wi-Fi ağındaki yazıcını bulmak için yerel ağı tarar. |
| `NSMotionUsageDescription` | Hareket ve fitness | Uygulama, günlük adım sayını göstermek için hareket verilerini kullanır. |
| `NSSpeechRecognitionUsageDescription` | Konuşma tanıma | Uygulama, sesli komutlarını metne çevirmek için konuşma tanımayı kullanır. |
| `NSFaceIDUsageDescription` | Face ID | Uygulama, hesabına hızlı ve güvenli giriş yapman için Face ID'yi kullanır. |
| `NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription` | HealthKit okuma/yazma | Uygulama, antrenman geçmişini göstermek için Sağlık'taki egzersiz verilerini okur. |
| `NSUserTrackingUsageDescription` | ATT | Uygulama, ilgi alanlarına uygun reklamlar göstermek için diğer şirketlerin uygulama ve web sitelerindeki etkinliğini kullanabilir. |
| `NFCReaderUsageDescription` | NFC | Uygulama, ürün etiketlerini okutman için NFC'yi kullanır. |
| `NSAppleMusicUsageDescription` | Medya kitaplığı / Apple Music | Uygulama, antrenman çalma listeni oluşturmak için müzik kitaplığına erişir. |
| `NSHomeKitUsageDescription` | HomeKit | Uygulama, evindeki ışıkları sahnelere göre kontrol etmek için HomeKit'i kullanır. |
| `NSSiriUsageDescription` | Siri | Uygulama, Siri ile hızlıca not ekleyebilmen için Siri'ye erişir. |
| `NSNearbyInteractionUsageDescription` | Yakın etkileşim (UWB) | Uygulama, eşleştirdiğin etiketin yönünü göstermek için yakın etkileşimi kullanır. |
| `NSFocusStatusUsageDescription` | Odak durumu | Uygulama, odak modundayken bildirimlerini ertelemek için odak durumunu kullanır. |
| `NSGKFriendListUsageDescription` | Game Center arkadaş listesi | Uygulama, liderlik tablosunda arkadaşlarını göstermek için Game Center arkadaş listene erişir. |
| `NSWorldSensingUsageDescription` / `NSHandsTrackingUsageDescription` | visionOS | Uygulama, sanal nesneleri masana yerleştirmek için ortam algılamayı kullanır. |

Kötü örnekler (ret): "Kameraya erişim gerekiyor." · "Daha iyi bir deneyim için." · "Bu uygulama konumunuzu kullanır." · Pazarlama dili veya özellik listesi.

## Ek C — Required Reason API kategorileri, gerekçe kodları ve manifest şablonu

> Kodlar Apple belgelerinden derlenmiştir; uygulamadan önce mümkünse güncel listeyi doğrula: https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api — Yalnızca gerçek kullanımına uyan kodu seç.

| Kategori (`NSPrivacyAccessedAPIType`) | Kapsadığı tipik API'ler | Gerekçe kodları |
|---|---|---|
| `NSPrivacyAccessedAPICategoryUserDefaults` | `UserDefaults`/`NSUserDefaults`, `@AppStorage` | **CA92.1** yalnızca uygulamanın kendisinin erişebildiği bilgi · **1C8F.1** aynı App Group'taki uygulama/uzantı/App Clip'lerle paylaşılan bilgi · **C56D.1** (yalnızca SDK) sarmalayıcı · **AC6B.1** MDM yönetimli yapılandırma anahtarları |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | `creationDate`, `modificationDate`, `contentModificationDateKey`, `creationDateKey`, `getattrlist`, `stat`/`fstat`/`lstat`/`fstatat` | **C617.1** uygulama/App Group/CloudKit kapsayıcısındaki dosyaların zaman damgası, boyut, meta verisi · **3B52.1** kullanıcının özellikle erişim verdiği dosyalar (ör. belge seçici) · **DDA9.1** zaman damgasını kullanıcıya gösterme (cihaz dışına gönderilmez) · **0A2A.1** (yalnızca SDK) sarmalayıcı |
| `NSPrivacyAccessedAPICategorySystemBootTime` | `ProcessInfo.systemUptime`, `mach_absolute_time()` | **35F9.1** uygulama içi olaylar arası geçen süre/zamanlayıcı · **8FFB.1** uygulama içi olaylar için mutlak zaman damgası hesaplama · **3D61.1** kullanıcının gönderdiği isteğe bağlı hata raporu |
| `NSPrivacyAccessedAPICategoryDiskSpace` | `volumeAvailableCapacityKey` (ve Important/Opportunistic varyantları), `volumeTotalCapacityKey`, `systemFreeSize`, `systemSize`, `statfs`/`statvfs` | **E174.1** yazmak için yeterli alan kontrolü / alan azken dosya silme · **85F4.1** disk alanını kullanıcıya gösterme · **7D9E.1** kullanıcının gönderdiği isteğe bağlı hata raporu · **B728.1** sağlık araştırması uygulamalarında katılımcıyı bilgilendirme |
| `NSPrivacyAccessedAPICategoryActiveKeyboards` | `UITextInputMode.activeInputModes` | **3EC4.1** özel klavye uygulaması · **54BD.1** kullanıcıya doğru özelleştirilmiş arayüzü göstermek |

Hibrit yığınlarda (React Native, Expo, Flutter, Capacitor) çekirdek kütüphaneler genellikle UserDefaults, dosya zaman damgası, sistem açılış süresi ve disk alanı API'lerini kullanır. Bu kullanımları `rgall` ile doğrula; doğrulanan kategorileri uygulama manifest'ine en uygun gerekçeyle ekle (tipik: CA92.1, C617.1, 35F9.1, E174.1).

**Şablon — `PrivacyInfo.xcprivacy`** (izleme yapmayan, e-postayı hesap için toplayan, UserDefaults kullanan örnek; gerçek akışa göre uyarla):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array>
    <dict>
      <key>NSPrivacyCollectedDataType</key>
      <string>NSPrivacyCollectedDataTypeEmailAddress</string>
      <key>NSPrivacyCollectedDataTypeLinked</key>
      <true/>
      <key>NSPrivacyCollectedDataTypeTracking</key>
      <false/>
      <key>NSPrivacyCollectedDataTypePurposes</key>
      <array>
        <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
      </array>
    </dict>
  </array>
  <key>NSPrivacyAccessedAPITypes</key>
  <array>
    <dict>
      <key>NSPrivacyAccessedAPIType</key>
      <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
      <key>NSPrivacyAccessedAPITypeReasons</key>
      <array>
        <string>CA92.1</string>
      </array>
    </dict>
  </array>
</dict>
</plist>
```

Amaç değerleri: `NSPrivacyCollectedDataTypePurposeAppFunctionality`, `…Analytics`, `…ProductPersonalization`, `…DeveloperAdvertising`, `…ThirdPartyAdvertising`, `…Other`.

**Expo karşılığı** (`app.json` → `expo.ios`):

```json
"privacyManifests": {
  "NSPrivacyAccessedAPITypes": [
    { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults", "NSPrivacyAccessedAPITypeReasons": ["CA92.1"] }
  ]
}
```

## Ek D — Privacy manifest ve imza zorunlu SDK listesi (Apple)

Listedeki herhangi bir SDK'nın her sürümü ve onları yeniden paketleyen SDK'lar kapsamdadır:

Abseil, AFNetworking, Alamofire, AppAuth, BoringSSL / openssl_grpc, Capacitor, Charts, connectivity_plus, Cordova, device_info_plus, DKImagePickerController, DKPhotoGallery, FBAEMKit, FBLPromises, FBSDKCoreKit, FBSDKCoreKit_Basics, FBSDKLoginKit, FBSDKShareKit, file_picker, FirebaseABTesting, FirebaseAuth, FirebaseCore, FirebaseCoreDiagnostics, FirebaseCoreExtension, FirebaseCoreInternal, FirebaseCrashlytics, FirebaseDynamicLinks, FirebaseFirestore, FirebaseInstallations, FirebaseMessaging, FirebaseRemoteConfig, Flutter, flutter_inappwebview, flutter_local_notifications, fluttertoast, FMDB, geolocator_apple, GoogleDataTransport, GoogleSignIn, GoogleToolboxForMac, GoogleUtilities, grpcpp, GTMAppAuth, GTMSessionFetcher, hermes, image_picker_ios, IQKeyboardManager, IQKeyboardManagerSwift, Kingfisher, leveldb, Lottie, MBProgressHUD, nanopb, OneSignal, OneSignalCore, OneSignalExtension, OneSignalOutcomes, OpenSSL, OrderedSet, package_info, package_info_plus, path_provider, path_provider_ios, Promises, Protobuf, Reachability, RealmSwift, RxCocoa, RxRelay, RxSwift, SDWebImage, share_plus, shared_preferences_ios, SnapKit, sqflite, Starscream, SVProgressHUD, SwiftyGif, SwiftyJSON, Toast, UnityFramework, url_launcher, url_launcher_ios, video_player_avfoundation, wakelock, webview_flutter_wkwebview.

## Ek E — Sık ret mesajı/hata → kök neden → modül

| Mesaj / kod | Muhtemel kök neden | Modül |
|---|---|---|
| ITMS-90683 Missing purpose string | Kod veya SDK korumalı API'ye referans veriyor, açıklama yok | M0.5 |
| ITMS-91053 Missing API declaration | Required reason API gerekçesiz | M0.3, Ek C |
| ITMS-91061 Missing privacy manifest | Listedeki SDK'nın manifest'siz sürümü | M0.4, Ek D |
| ITMS-90809 Deprecated API (UIWebView) | Eski kod/SDK | M0.6 |
| ITMS-90717 Invalid App Store Icon | İkonda alfa kanalı | M0.7 |
| iPad çoklu görev yönelimi hatası (ITMS-90474) | iPad yönelimleri eksik | M0.8 |
| SDK/Xcode sürüm hatası | Xcode 26 öncesiyle derleme | M0.1 |
| Minimum OS hatası | Dağıtım hedefi iOS 13'ün altında | M0.2 |
| 2.1 App Completeness (çökme/hata) | iPad, IPv6, izin reddi, backend kapalı, boş durum | M1.1, M3.1, M3.8 |
| 2.1 Information Needed | Demo hesap/OTP/belge eksik | M1.4 |
| 2.1(b) IAP bulunamadı | IAP gönderilmemiş, gizli, Paid Apps Agreement yok | M1.5 |
| 2.2 Beta | Uygulama kendini beta/test olarak tanıtıyor | M1.6 |
| 2.3.3 Screenshots | Yalnızca açılış/giriş görselleri | M2.5 |
| 2.3.10 | Android/Google Play referansı | M2.3 |
| 2.5.4 | Kullanılmayan arka plan modu | M3.7 |
| 2.5.19 / 2.3.1 | İnceleme tespiti, belgelenmemiş bayraklı özellik, onaydan sonra eklenen işlev (bait-and-switch) | M2.1, M3.6 |
| 2.5.18 | Uzantıda reklam, kapatılamayan interstitial, reklam bildirme yok | M3.18 |
| 3.1.1 | Harici ödeme, lisans kodu, dijital içerik için Apple Pay/kart | M6.1, M6.2 |
| 3.1.1 (restore) | Geri yükleme düğmesi yok | M6.3 |
| 3.1.2 eksik bilgi | Uygulamada veya meta veride EULA/gizlilik bağlantısı yok | M6.5 |
| 3.1.2(c) billed amount | Deneme veya aylık karşılık toplam tutardan belirgin | M6.6 |
| 3.2.2(x) | Erişim için puan/yorum/indirme zorunluluğu | M6.10, M10.6 |
| 4.0 Design | Giriş/kayıt için tarayıcıya çıkış, kalitesiz arayüz | M9.2, M9.8 |
| 4.1 Copycats | Başka markanın adı/ikonu | M9.1, M8.4 |
| 4.2 Minimum Functionality | Web sarmalayıcı, sınırlı işlev | M9.2 |
| 4.3(a)/(b) Spam | Çoklu kopya, doymuş kategori | M9.4 |
| 4.5.4 | Pazarlama push'u için açık onay yok, push zorunlu | M9.6, M4.14 |
| 4.7.x | Mini uygulama/bot dizini, onay, yaş sınırı eksik | M9.7 |
| 4.8 Login Services | Sosyal giriş var, Sign in with Apple yok | M5.1 |
| 5.1.1 purpose string | Belirsiz izin metni | M0.5, Ek B |
| 5.1.1(iv) | Ön izin ekranında "İzin ver" veya çıkış düğmesi | M4.4 |
| 5.1.1(v) account deletion | Uygulama içi silme yok veya yalnızca devre dışı bırakma | M4.6 |
| 5.1.1(v) registration | Hesap gerektirmeyen içerikte zorunlu giriş | M4.5 |
| 5.1.1(ix) | Düzenlenmiş alanda bireysel hesap | M4.10 |
| 5.1.2 tracking | Etiket ile ATT tutarsız, izinsiz izleme | M4.12 |
| 5.1.2(i) third-party AI | AI'ya veri göndermeden önce açık onay yok | M8.1, M4.11 |
| 1.2 UGC | Filtre/bildir/engelle/iletişim/koşullar eksik | M7.2 |
| 1.2 rızasız mahrem görüntü (AI dahil) | Önleme/kaldırma yok, "nudification" özelliği | M7.2, M8.2 |
| 1.4.1 Medical | Doğrulanamayan ölçüm veya teşhis iddiası | M7.5 |
| 5.2.x | Lisanssız içerik, marka, medya indirme | M10.1 |
| 5.3.2 | Çekiliş kuralları veya Apple ibaresi yok | M10.3 |
| 5.6.1 | Özel puanlama istemi | M10.6 |

## Ek F — Yığına özel notlar

**Native (SwiftUI/UIKit)**
- Fotoğraf: `PhotosPicker`/`PHPickerViewController`. Paylaşım: `ShareLink` (popover'ı kendisi yönetir); UIKit'te `popoverPresentationController`.
- Abonelik: `SubscriptionStoreView`, `.manageSubscriptionsSheet(isPresented:)`, `Product.SubscriptionInfo.isEligibleForIntroOffer`, `AppStore.sync()`; açılışta `Transaction.updates` dinleyicisi; tanıtılan IAP için `PurchaseIntent.intents`; teklif kodu için `.offerCodeRedemption(isPresented:)`.
- Puanlama: `@Environment(\.requestReview)`. SIWA: `SignInWithAppleButton`.

**React Native (bare)**
- Dosyalar: `ios/<App>/Info.plist`, `ios/<App>/PrivacyInfo.xcprivacy` (yeni şablonlarda vardır, yoksa ekle ve hedefe dahil et), `ios/<App>/<App>.entitlements`, `ios/Podfile`.
- `react-native-permissions`: Podfile'da `setup_permissions([...])` ile yalnızca kullanılan izinleri etkinleştir.
- iPad: `Share.share` ve `ActionSheetIOS` için `anchor`.
- IAP: `react-native-iap` veya `react-native-purchases`; geri yükleme. ATT: `react-native-tracking-transparency`. Puanlama: Apple API'sini çağıran bir kütüphane.
- OTA (CodePush türevleri, `expo-updates`) → M3.6 politikası.

**Expo**
- Gerçeğin kaynağı `app.json`/`app.config.*`: `ios.infoPlist`, `ios.privacyManifests`, `ios.entitlements`, `ios.bundleIdentifier`, `ios.supportsTablet` (false olsa da iPhone uygulaması iPad'de uyumluluk modunda çalışır → M3.1); config plugin izin metinleri (ör. `expo-camera` → `cameraPermission`, `expo-image-picker` → `photosPermission`, `expo-location` → `locationWhenInUsePermission`, `expo-contacts` → `contactsPermission`); `expo-build-properties` → `ios.deploymentTarget`.
- CNG projelerinde (`ios/` .gitignore'da) `ios/` klasörünü elle düzenleme; doğrulama için `npx expo config --type introspect`.
- EAS Update: yalnızca düzeltme ve içerik (M3.6).
- Paketler: `expo-tracking-transparency`, `expo-apple-authentication`, `expo-store-review`.

**Flutter**
- Dosyalar: `ios/Runner/Info.plist`, `ios/Runner/PrivacyInfo.xcprivacy` (Runner hedefine eklenmeli), `ios/Runner/Runner.entitlements`, `ios/Podfile`, `ios/Flutter/AppFrameworkInfo.plist`.
- `permission_handler`: Podfile'daki `GCC_PREPROCESSOR_DEFINITIONS` makrolarıyla yalnızca kullanılan izinleri aç (ör. `PERMISSION_CAMERA=1`).
- `share_plus`: iPad'de `sharePositionOrigin` ver.
- IAP: `in_app_purchase` veya `purchases_flutter` (geri yükleme); `sign_in_with_apple`; `app_tracking_transparency`; `in_app_review`. Shorebird → M3.6.
- Xcode yoksa manifest'i hedefe eklemek için CocoaPods ile gelen `xcodeproj` Ruby gem'iyle bir betik yaz (`Xcodeproj::Project.open('ios/Runner.xcodeproj')` → Runner grubuna dosya referansı → `resources_build_phase.add_file_reference` → `save`) ya da kullanıcıdan Xcode'da eklemesini iste.

**Capacitor / Ionic / Cordova**
- Dosyalar: `ios/App/App/Info.plist`, `ios/App/App/PrivacyInfo.xcprivacy`; Cordova'da `config.xml` içindeki `<edit-config>`/`<config-file>` ile plist değerleri.
- `capacitor.config.*` → `server.url` production'da olmamalı (canlı yeniden yükleme içindir) — M3.6, M9.2.
- Yerel değer katmak için resmi eklentiler: Push Notifications, Camera, Share, Haptics, Preferences, Browser (`SFSafariViewController`), App (derin bağlantılar).
- Web içeriğinde Android'e özgü öğeleri iOS'ta gizle (`Capacitor.getPlatform() === 'ios'`).

**Unity**
- Güncel Unity yamaları (2021.3/2022.3 LTS son yamaları, Unity 6) motor için privacy manifest içerir; reklam/analitik eklentilerini ve mediation adaptörlerini güncelle; `Assets/Plugins/iOS` altına ek manifest konabilir.
- Ganimet kutusu olasılıkları (M6.4), Game Center entitlement (M0.9), ATT (M4.12), iPad en-boy oranları (M3.1).

**Kotlin Multiplatform / .NET MAUI**
- KMP: iOS uygulaması `iosApp/` altındaki Xcode projesidir; kurallar native ile aynıdır.
- .NET MAUI: `Platforms/iOS/Info.plist`, `Platforms/iOS/Entitlements.plist`; `PrivacyInfo.xcprivacy` dosyasını iOS projesine `BundleResource` olarak ekle (Microsoft dokümantasyonunu doğrula).
