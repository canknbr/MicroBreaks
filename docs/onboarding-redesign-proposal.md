# ADHD Supporter - Onboarding Flow Yeniden Tasarimi
## Zen Master Level 0,1 - Stratejik Arastirma ve Tasarim Dokumani

---

## 1. ADHD Psikolojisi: Derin Anlayis

### 1.1 Norolojik Gercekler

ADHD beyni **dopamin eksikligi** ile mucadele eder. Bu durum:
- **Geciktirilmis odullere karsi dusuk motivasyon** - Gelecekteki kazanimlar "gorulmez" hissedilir
- **Temporal discounting** - Simdiki an, gelecekten cok daha guclu hissedilir
- **Variable ratio reinforcement** - Tahmin edilemeyen ama sik oduller en guclu baglanmayi olusturur

> "Cogu odul sistemi 'Simdi zor isi yap, sonra iyi hisset' mantigina dayanir. Ama ADHD beyni o kadar bekleyemez."

### 1.2 Duygusal Yukler

ADHD bireyleri tasidigi gizli yukler:

| Duygu | Kaynak | Etki |
|-------|--------|------|
| **Utanc (Shame)** | "Ben bir hatayim" | Kimlik krizi |
| **Sucluluk (Guilt)** | "Yanlis bir sey yaptim" | Niyet-eylem ucurumu |
| **Reddedilme Hassasiyeti** | Elestirilere asiri duyarlilik | Utanc sarmalini tetikler |
| **Oz-elesitiri** | Icsellestirilmis olumsuz geri bildirimler | Dusuk oz-sefkat |

**Kritik Icgoru**: Utanc sinir sistemini strese sokar ve ADHD belirtilerini DAHA DA KOTULESTIRIR. Bu donguyu kirmak tasarimin temel amaci olmalidir.

### 1.3 ADHD Kullanici Davranis Kaliplari

```
Geleneksel Uygulamalar          vs          ADHD-Dostu Tasarim
─────────────────────────────────────────────────────────────────
Dogrusal dusunce varsayimi       →     Ag ve iliski temelli dusunce
Tutarli motivasyon beklentisi    →     Dalgalanan enerji ve odak
Metin yogun icerik               →     Gorsel ve renk kodlu bilgi
Uzun vadeli hedefler             →     Aninda geri bildirim ve mikro-oduller
Statik hatirlatmalar             →     Baglamsal ve adaptif mudahaleler
```

---

## 2. Onboarding Psikolojisi: Donusum Stratejileri

### 2.1 Kritik Istatistikler

- **%25** kullanici uygulamayi ilk kullanimdan sonra terk eder
- **%77** kullanici ilk 3 gun icinde uygulamayi birakir
- Guclu onboarding ile retention **%50** artar
- **%72** kullanici onboardingin **1 dakikadan kisa** olmasini ister

### 2.2 ADHD Icin Onboarding Altin Kurallari

1. **"A-ha!" Anina Hizla Ulastir**
   - Kullanici degeri 30 saniyede hissetmeli
   - Ilk ekran duygusal baglanma yaratmali

2. **Kisisellestirme = Baglanti**
   - "Bu uygulama beni anliyor" hissi kritik
   - Her soru kullanicinin "gorunur" hissetmesini saglamali

3. **Gamification ama Dogru Doz**
   - Progress bar'lar motivasyonu %300 artirabiliyor
   - Ancak asiri oyunlastirma ADHD'li icin stres kaynagi olabilir
   - **Optimal**: Yumusak, destekleyici ilerleme gostergesi

4. **Endowed Progress Etkisi**
   - Bos checklist yerine %10-20 tamamlanmis basla
   - Beyin "zaten basladin, devam et" sinyali alir

---

## 3. Monetizasyon Psikolojisi: Karlilik Stratejileri

### 3.1 Paywall Stratejileri Karsilastirmasi

| Strateji | Donusum | Risk | ADHD Uyumu |
|----------|---------|------|------------|
| **Hard Paywall** | 10x daha yuksek | Kullanici kaybi | DUSUK - Guvensizlik yaratir |
| **Soft Paywall** | Orta | Dusuk baglanti | ORTA |
| **Empatik Freemium** | Yuksek + Sadakat | Yok | YUKSEK |
| **Value-First Trial** | Cok yuksek | Yok | EN YUKSEK |

### 3.2 Mental Saglik Uygulamalarinda Basari Ornekleri

**Headspace Vakasi:**
- Ucretsiz icerigi %10, %5, hatta %1'e dusurduklerinde donusum artti
- AMA: Her kategoride birkac populer icerigi ucretsiz tuttular
- Kullanici geri tepmesi OLMADI cunku deger oncelikli sunulmustu

**Rootd Vakasi:**
- Paywall'u onboarding basina tasidiklarinda gelir **5X** artti
- Anahtar: Kullanicilar degeri gorduklerinde odemeye ACIK

### 3.3 ADHD Uygulamasi Icin Optimal Monetizasyon

```
                    DEGER PIRAMIDI
                         /\
                        /  \
                       /    \
                      / PAID \
                     / Premium\
                    /  AI Coach \
                   /--------------\
                  /   FREEMIUM     \
                 / Temel Araclar    \
                / Gunluk Icerik      \
               /--------------------\
              /      FREE            \
             / Onboarding + Ah-ha!    \
            / Ilk Hafta Deneyimi       \
           /----------------------------\
```

---

## 4. Yeni Onboarding Flow Tasarimi

### 4.1 Tasarim Felsefesi

**Temel Ilkeler:**
1. **"Seni anliyorum"** - Her ekran ADHD deneyimini onaylamali
2. **Utanci silmek** - Normallestirme ve sefkat dili
3. **Mikro-kazanimlar** - Her adimda dopamin tetikleyici
4. **Kisisellestirme** - Cevaplar gercekten deneyimi sekillendirmeli
5. **Deger gosterimi** - Paywall oncesi "wow" ani yaratmak

### 4.2 Ekran Akisi (8 Ana Ekran + 2 Gecis)

---

## EKRAN 1: DUYGUSAL KARSILAMA
**Dosya Adi:** `welcome-emotional.tsx`

**Amac:** Aninda duygusal baglanma, "Buradasin ve bu onemli"

**Icerik:**
```
[Yumusak gradient arka plan - Sakin mavi/mor tonlari]

[Nefes alan, hafif parlayan ikon - Kalp + Beyin birlesimi]

"Buraya geldigin icin cesur bir adim attin."

[Kucuk, sakin metin]
"ADHD ile yasam bazen yorucu olabilir.
Ama sen yalniz degilsin."

[Alt kisim - Yumusak progress indicator: 1/8]

[Buton: "Baslamaya Hazirim" - Yumusak, davetkar]
```

**Psikolojik Etki:**
- Kullanici "gorunur" hisseder
- Utanc yerine cesaret tanimlanir
- Duygusal guvenlik alani olusur

**UX Detaylari:**
- Arka plan gradyan: `#E8F4FD` → `#F3E8FF`
- Animasyon: Yuzde 1'lik hafif "nefes" efekti
- Typography: Rounded, yumusak font (SF Pro Rounded veya Nunito)

---

## EKRAN 2: MIKRO-TANI - "Bugun Nasil Hissediyorsun?"
**Dosya Adi:** `today-feeling.tsx`

**Amac:** Anlik durumu anlamak, kisisellestirme baslangici

**Icerik:**
```
"Bugun kendini nasil hissediyorsun?"

[4 Duygusal Secim Karti - Tek dokunusla secilebilir]

    [Kart 1]                    [Kart 2]
    Yorgun ama                  Motive ama
    Umutlu                      Dagink
    [Yavas uyanan               [Energik ama
    gunes ikonu]                sicriyan top ikonu]

    [Kart 3]                    [Kart 4]
    Bunalmis                    Kararsiz,
    Hissediyorum                Bilmiyorum
    [Bulut altinda              [Soru isareti
    kucuk figur]                ile birisi]

[Progress: 2/8]
```

**Psikolojik Etki:**
- "Bu uygulama duygularimi onemsiyor"
- ADHD'nin duygusal boyutu tanimlanir
- Veri toplama yaklasimi insan-odakli

**Adaptif Davranis:**
- "Bunalmis" secilirse → Sonraki ekranlarda daha yumusak dil
- "Motive" secilirse → Aksiyona donuk dil

---

## EKRAN 3: ADHD HIKAYESI - Normallestirme
**Dosya Adi:** `adhd-journey.tsx`

**Amac:** ADHD deneyimini normallestirmek, utanci silmek

**Icerik:**
```
"ADHD yolculugun nerede basliyor?"

[3 Secenek - Dikey kartlar]

┌─────────────────────────────────┐
│  Yeni tani aldim veya           │
│  suphelerim var                 │
│  [Yeni filiz ikonu]             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Yillardir biliyorum ama        │
│  hala zorlanirim                │
│  [Sarmal yol ikonu]             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Tani yok ama ADHD benzeri      │
│  zorluklar yasiyorum            │
│  [Pusula ikonu]                 │
└─────────────────────────────────┘

[Kucuk not: "Hangi yolda olursan ol, buradasin - bu onemli."]

[Progress: 3/8]
```

**Psikolojik Etki:**
- Tani durumu ne olursa olsun kapsayicilik
- "Hala zorlanirim" secenegi - uzun sureli ADHD'lilerin utancini onaylar
- Kimseyi dislamayan dil

---

## EKRAN 4: TEMEL ZORLUK ALANI
**Dosya Adi:** `core-struggle.tsx`

**Amac:** Ana aci noktasini belirlemek, deger onerisi baglamak

**Icerik:**
```
"En cok hangisi seni zorluyor?"
[Alt yazi: "Birden fazla secebilirsin - hepsi gecerli."]

[6 Secim Cipi - Coklu secim]

  [Islere baslamak]    [Odaklanmak]

  [Zamani yonetmek]    [Duygusal inisc-cikislar]

  [Motivasyon bulmak]  [Unutkanlik]

[Secim yapildiktan sonra gelen mikro-onay:]
"Bu zorluklari paylasan milyonlarca kisi var.
Ve cozumler de var."

[Progress: 4/8]
```

**Psikolojik Etki:**
- Coklu secim = "Sadece bir sorunum yok" hissini onaylar
- Her zorluk normallestiriliyor
- "Cozumler var" - umut asiliyor

**Veri Kullanimi:**
- Secilen zorluklar → Ana sayfa widget onceliklendirmesi
- Premium ozellik onerileri bu verilere dayanacak

---

## EKRAN 5: DEGER GOSTERIMI - "Sana Nasil Yardimci Olabiliriz"
**Dosya Adi:** `value-preview.tsx`

**Amac:** Kisisellestirmelerin degerini gostermek (Pre-Paywall Ah-ha!)

**Icerik:**
```
[Ekran 4'teki secimlere gore dinamik]

"Senin icin hazirlanan araclar:"

[Secilen zorluklara gore 3 kart gosterimi]

┌─────────────────────────────────┐
│ [Odaklanmak secildiyse]         │
│                                 │
│ "5 Dakika Odak Modu"            │
│ Mikro-gorevlerle baslayan       │
│ yumusak odak seansları          │
│                                 │
│ [Kucuk demo animasyonu]         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ [Duygusal inisc-cikislar secildiyse]        │
│                                 │
│ "Duygu Haritasi"                │
│ Duygularini takip et,           │
│ paternlerini kesfet             │
│                                 │
│ [Duygu grafigi animasyonu]      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ [Motivasyon secildiyse]         │
│                                 │
│ "Gunluk Motivasyon Parcasi"     │
│ ADHD beynine ozel mikro-oduller │
│ ve ilerleme kutlamalari         │
│                                 │
│ [Confetti animasyonu]           │
└─────────────────────────────────┘

[Progress: 5/8]
```

**Psikolojik Etki:**
- "Bu uygulama gercekten BENIM icin"
- Somut cozumler gorsellestirildi
- Dopamin beklentisi yaratildi

---

## EKRAN 6: HEDEF BELIRLEME - Mikro ve Gercekci
**Dosya Adi:** `micro-goal.tsx`

**Amac:** Gercekci, ulasilabilir hedef koymak

**Icerik:**
```
"Bu hafta kucuk bir adim atalim."
[Alt yazi: "Buyuk degisimler kucuk adimlarla baslar."]

[3 Hazir Hedef Secenegi]

┌─────────────────────────────────┐
│  Gunluk 1 gorev tamamlamak      │
│  [Tek tik ikonu]                │
│  "Baslangic icin mukemmel"      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Her gun 5 dakika odaklanmak    │
│  [Kum saati ikonu]              │
│  "Kisa ama etkili"              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Duygularimi gunluk 1 kez       │
│  kaydetmek                      │
│  [Kalp + kalem ikonu]           │
│  "Kendini tanima yolculugu"     │
└─────────────────────────────────┘

[Veya: Kendi hedefimi yazayim →]

[Progress: 6/8]
```

**Psikolojik Etki:**
- Gercekci hedefler = Basarilabilir = Dopamin
- "Baslangic icin mukemmel" - perfeksiyonizm karsiti dil
- Ozerklik secenegi var

---

## EKRAN 7: BAGLILIK RITUEL - Hafif Sozlesme
**Dosya Adi:** `gentle-commitment.tsx`

**Amac:** Duygusal baglilik yaratmak (zorlamadan)

**Icerik:**
```
[Yumusak, sakin arka plan]

"Kendine bir soz ver."

[Merkeze yakin, vurgulu metin]

"Bu hafta kendime
kucuk anlar ayiracagim.
Her gun olmak zorunda degil.
Her seferinde mukemmel olmak
zorunda degil.
Sadece denemek yeterli."

[Altta iki secenek]

    [Kabul Ediyorum]        [Simdi Degil]
    (Ana buton)             (Ikincil link)

[Kucuk not: "Bu bir baski degil - bir davet."]

[Progress: 7/8]
```

**Psikolojik Etki:**
- Yumusak baglilik → Daha yuksek retention
- "Simdi Degil" secenegi → Kontrol hissi
- "Sadece denemek yeterli" → Perfeksiyonizm karsiti

---

## EKRAN 8: SOFT PAYWALL - Deger Odakli
**Dosya Adi:** `value-paywall.tsx`

**Amac:** Donusumu maksimize etmek (empati ile)

**Icerik:**
```
[Ozel tasarimli paywall ekrani]

"Tam deneyimi kesfet"

[Kullanicinin sectigi zorluklara gore dinamik baslik]
"Odaklanma ve motivasyon araclarinin
tamami seni bekliyor."

┌─────────────────────────────────┐
│  PREMIUM ICERIGI               │
│                                 │
│  ✓ Sinirsiz AI Kocu sohbetleri  │
│  ✓ Kisisellestirilmis           │
│    gunluk planlar               │
│  ✓ Gelismis duygu analizi       │
│  ✓ Topluluk erisimi             │
│  ✓ Odak muzikleri ve sesler     │
│                                 │
└─────────────────────────────────┘

[Fiyatlandirma]

┌─────────────────────────────────┐
│  YILLIK              │  AYLIK  │
│  ₺299/yil            │  ₺49/ay │
│  (₺24.9/ay)          │         │
│  [EN POPULER]        │         │
│  %58 tasarruf        │         │
└─────────────────────────────────┘

[CTA Buton: "7 Gun Ucretsiz Dene"]

[Altta kucuk link: "Once ucretsiz kesfet →"]

[Not: "Istedigin zaman iptal edebilirsin.
Seni baglamiyoruz."]
```

**Psikolojik Etki:**
- 7 gunluk deneme = Risk algisini azaltir
- "Once ucretsiz kesfet" = Cikmak isteyenlere alternatif
- "Seni baglamiyoruz" = Guven insasi

**Donusum Taktikleri:**
- Secilen zorluklara gore dinamik baslik
- Yillik plan one cikarilmis (anchor pricing)
- Social proof eklenebilir ("10.000+ kullanici")

---

## EKRAN 8B (ALTERNATIF): UCRETSIZ DEVAM
**Dosya Adi:** `free-continue.tsx`

**Amac:** Paywall gecmeyenleri kaybetmemek

**Icerik:**
```
"Harika! Ucretsiz ozellikleri kesfet."

[Erisilebilir ozellikler]

✓ Gunluk 1 odak seansi
✓ Basit gorev listesi
✓ Temel duygu takibi
✓ Haftalik ilerleme ozeti

[CTA: "Basla"]

[Kucuk not: "Premium ozellikleri istedigin zaman
deneyebilirsin."]
```

---

## EKRAN 9: KISISELLESTIRILMIS KARSILAMA
**Dosya Adi:** `personalized-home.tsx`

**Amac:** Ilk "Ah-ha!" ani - deger gosterimi

**Icerik:**
```
[Kullanicinin adinı kullanarak - eger varsa]

"Hosgeldin! Senin icin hazir."

[Ekran 4'te secilen zorluklara gore
onceliklendirilmis widget'lar]

[Ornek: Odaklanma secildiyse]
┌─────────────────────────────────┐
│  Ilk Odak Seansın               │
│  [5 Dakika Yumusak Baslangic]   │
│  [Basla →]                      │
└─────────────────────────────────┘

[Ekran 6'da secilen hedefe gore]
┌─────────────────────────────────┐
│  Bu Haftaki Hedefin             │
│  "Gunluk 1 gorev tamamlamak"    │
│  [İlerleme: 0/7]                │
└─────────────────────────────────┘

[Motivasyon notu]
"Kucuk adimlar, buyuk degisimler."
```

---

## 5. Tasarim Sistemi Onerileri

### 5.1 Renk Paleti

```
Ana Renkler (ADHD-Dostu):
─────────────────────────
Primary:    #6B7FD7 (Sakin Mavi-Mor)
Secondary:  #9B8FD9 (Lavanta)
Accent:     #4ECDC4 (Yumusak Turkuaz)
Success:    #7CB342 (Dogal Yesil)
Warning:    #FFB74D (Sicak Turuncu)

Arka Plan:
─────────────────────────
Light:      #F8FAFF
Dark:       #1A1B2E

Metin:
─────────────────────────
Primary:    #2D3142
Secondary:  #626880
Muted:      #9BA1B7
```

### 5.2 Typography

```
Basliklar:   SF Pro Rounded / Nunito (Bold)
             - Yumusak, yaklasabilir

Govde:       Inter / SF Pro Text (Regular)
             - Okunabilir, temiz

Vurgular:    El yazisi tarzı font (nadiren)
             - Duygusal anlarda
```

### 5.3 Animasyon Ilkeleri

- **Yumusak gecisler**: 300-400ms ease-out
- **Mikro-animasyonlar**: Buton tiklamalarinda hafif scale
- **Dikkat dagiticidan kacinma**: Otomatik oynayan videolar HAYIR
- **Nefes efekti**: Onemli oge vurgusunda

### 5.4 Ikonografi

- **Stil**: Rounded, filled (outline degil)
- **Boyut**: Minimum 24px (dokunma alani 44px)
- **Renk**: Duygusal baglamla uyumlu

---

## 6. Mevcut vs Yeni: Karsilastirma

### 6.1 Mevcut Onboarding Yapisi (20 Ekran)

```
Mevcut Akis:
1. welcome
2. what-brings-you
3. diagnosis-status
4. focus-profile
5. time-perception
6. energy-rhythm
7. sleep-quality
8. triggers-overwhelm
9. task-initiation
10. motivation-finder
11. self-reflection
12. environment-scan
13. emotion-tracking-intro
14. goal-definition
15. ai-insight-summary
16. micro-module-preview
17. commitment
18. subscription-offer
19. account-setup
20. final
```

**Problemler:**
- 20 ekran = Cok uzun (ADHD icin kritik sorun)
- Bilgi toplama odakli, deger gosterimi zayif
- Paywall cok gec geliyor
- Duygusal baglanma eksik

### 6.2 Yeni Onboarding Yapisi (8+2 Ekran)

```
Yeni Akis:
1. welcome-emotional (Duygusal Karsilama)
2. today-feeling (Mikro-Tani)
3. adhd-journey (Normallestirme)
4. core-struggle (Temel Zorluk)
5. value-preview (Deger Gosterimi) ← KRITIK
6. micro-goal (Hedef Belirleme)
7. gentle-commitment (Baglilik)
8. value-paywall (Soft Paywall)
   └── 8b. free-continue (Alternatif)
9. personalized-home (Karsilama)
```

**Avantajlar:**
- %60 daha kisa
- Deger gosterimi paywall oncesinde
- Duygusal baglanma guclu
- Her adim amacli

---

## 7. Beklenen Etkiler

### 7.1 Kullanici Deneyimi Metrikleri

| Metrik | Mevcut (Tahmini) | Hedef |
|--------|------------------|-------|
| Onboarding Tamamlama | %40-50 | %70-80 |
| Day 1 Retention | %25 | %45 |
| Day 7 Retention | %15 | %30 |
| Trial Baslatma | %10-15 | %25-35 |

### 7.2 Gelir Etkileri

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| Trial → Paid Conversion | %5-8 | %12-18 |
| ARPU (Avg Revenue Per User) | Dusuk | 2-3x artis |
| LTV (Lifetime Value) | - | Olcume basla |

---

## 8. Uygulama Yol Haritasi

### Faz 1: Temel Yapi
- [ ] Yeni ekran dosyalarini olustur
- [ ] Navigation flow'u guncelle
- [ ] Temel UI komponentlerini hazirla

### Faz 2: Icerik ve Gorsel
- [ ] Ilustrasyonlar ve ikonlar
- [ ] Animasyonlar
- [ ] Copywriting finalizasyonu

### Faz 3: Kisisellestirme Mantigi
- [ ] Secim → Deneyim baglantisi
- [ ] Veri saklama (AsyncStorage/Zustand)
- [ ] Dinamik icerik gosterimi

### Faz 4: Paywall Optimizasyonu
- [ ] A/B test altyapisi
- [ ] Farkli fiyatlandirma testleri
- [ ] Analitik entegrasyonu

### Faz 5: Olcum ve Iterasyon
- [ ] Funnel analizi kurulumu
- [ ] Kullanici geri bildirimi toplama
- [ ] Surekli iyilestirme dongusu

---

## 9. Kaynaklar

### ADHD Psikolojisi
- [ADHD Psychology and User Behavior - ArXiv Research](https://arxiv.org/html/2507.06864v1)
- [Designing for ADHD Users - Medium](https://medium.com/design-bootcamp/designing-for-adhd-users-a-psychology-informed-approach-d2fc055d5e33)
- [ADHD and Shame - Psychology Today](https://www.psychologytoday.com/us/blog/here-there-and-everywhere/202403/understanding-adhd-navigating-guilt-and-shame)
- [Self-Compassion Practice for ADHD - ADDitude](https://www.additudemag.com/self-compassion-practice-adhd-shame/)

### Onboarding Best Practices
- [App Onboarding Guide - VWO](https://vwo.com/blog/mobile-app-onboarding-guide/)
- [User Onboarding Metrics - Appcues](https://www.appcues.com/blog/user-onboarding-metrics-and-kpis)
- [Onboarding Funnel Optimization](https://www.avanderlee.com/optimization/app-onboarding-funnel-increase-conversions/)

### Monetizasyon
- [Mental Health App Monetization - SDA](https://sda.company/blog/category/mental-health/mental-health-app-monetization)
- [Hard vs Soft Paywall - RevenueCat](https://www.revenuecat.com/blog/growth/hard-paywall-vs-soft-paywall/)
- [Paywall Optimization - Business of Apps](https://www.businessofapps.com/guide/app-paywall-optimization/)

### Gamification ve Dopamin
- [Gamification ADHD - Tiimo](https://www.tiimoapp.com/resource-hub/gamification-adhd)
- [ADHD Reward System - Moore Momentum](https://mooremomentum.com/blog/the-adhd-reward-system-and-why-you-struggle-with-motivation/)
- [Dopamine-Driven Marketing](https://winsomemarketing.com/marketing-and-autism/dopamine-driven-marketing-understanding-adhd-reward-systems)

### Basarili ADHD Uygulamalari
- [Tiimo - 2025 App of the Year](https://www.tiimoapp.com/)
- [Best ADHD Apps 2025 - Inflow](https://www.getinflow.io/post/best-apps-for-adhd)
- [ADHD Productivity Tools - Deepwrk](https://www.deepwrk.io/blog/adhd-productivity-tools)

---

## 10. Sonuc

Bu tasarim, ADHD psikolojisini derinlemesine anlayarak, kullanici deneyimi ve karlilik hedeflerini uyumlu hale getirir.

**Temel Farklilastiriclar:**
1. **Deger-Oncelikli** yaklaşım (paywall oncesi ah-ha ani)
2. **Utanc-Karsiti** dil ve tasarim
3. **Mikro-Odul** sistemi ile dopamin optimizasyonu
4. **Kisaltilmis** ama **anlamli** akis

Bu onboarding, sadece kullaniciyi uygulamaya almak degil, **ADHD yolculugunda bir dost** olarak konumlanmayi hedefler.

---

*Dokuman Surumu: 1.0*
*Olusturulma Tarihi: 2025-12-08*
*Yazar: Claude (Zen Master Level 0,1 Arastirma)*
