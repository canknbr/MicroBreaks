# MindFlow - Premium ADHD Support App
## Zen Master Level Screen Architecture

**Tasarım Felsefesi:** ADHD beyni ile ÇALIŞAN, ona KARŞI değil.

---

## Temel Tasarım Prensipleri

### 1. Interest-Based Nervous System (INCUP/PINCH)
Her ekran şunlardan en az birini tetiklemeli:
- **I**nterest (İlgi) - Görsel çekicilik, merak uyandırma
- **N**ovelty (Yenilik) - Sürpriz elementler, değişen içerik
- **C**hallenge (Zorluk) - Achievable micro-goals
- **U**rgency (Aciliyet) - Gentle time awareness
- **P**assion (Tutku) - Kişiselleştirilmiş içerik

### 2. Cognitive Load Minimization
- Ekran başına MAX 1 primary action
- Progressive disclosure
- Visual hierarchy ile yönlendirme
- Decision fatigue'den kaçınma

### 3. Dopamine-Aware Design
- Micro-celebrations her başarıda
- Streak'ler ama cezasız
- Progress visualization
- Instant feedback

### 4. Time Blindness Compensation
- Her zaman görünür timer'lar
- Visual time representation
- Gentle time awareness (not anxiety-inducing)

---

# EKRAN MİMARİSİ

## TAB 1: HOME (Bugün)
**Amaç:** Günün merkezi, tek bakışta "şu an ne yapmalıyım" sorusuna cevap

### 1.1 Home - Morning State
```
┌─────────────────────────────────────┐
│  [Günaydın Can] ☀️                  │
│  Bugün nasıl hissediyorsun?         │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ 😴  │ │ ⚡  │ │ 😰  │ │ 🤷  │   │
│  │Tired│ │Ready│ │Anxio│ │ Meh │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🌅 SABAH RUTİNİN                   │
│  ┌─────────────────────────────────┐│
│  │ ○ Uyan & Stretch      2 dk     ││
│  │ ○ Su iç               1 dk     ││
│  │ ○ İlaç al             30 sn    ││
│  │ ● Duş                 10 dk ◀──││
│  │ ○ Kahvaltı            15 dk    ││
│  └─────────────────────────────────┘│
│                                     │
│  [▶ Rutine Başla]                   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📊 Bugünkü Görevlerin              │
│  3 görev • ~2 saat tahmini          │
│                                     │
│  🔴 Acil: Rapor teslimi    ⏱️ 45dk  │
│  🟡 Önemli: Email yanıtla  ⏱️ 20dk  │
│  🟢 İstersen: Oku          ⏱️ 30dk  │
│                                     │
└─────────────────────────────────────┘
```

### 1.2 Home - Active Task State
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │      ⏱️ 12:34                   ││
│  │      ───────────────            ││
│  │      [████████░░░░] 62%         ││
│  │                                 ││
│  │      "Rapor teslimi"            ││
│  │                                 ││
│  │      🎵 Lo-fi beats playing     ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  👤 Body Double: Active             │
│  Sarah da çalışıyor...              │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │  ⏸️     │ │  ✓      │           │
│  │  Pause  │ │  Done   │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  💭 Stuck? Try:                     │
│  • Break it smaller                 │
│  • 2-min version                    │
│  • Body double ile                  │
│                                     │
└─────────────────────────────────────┘
```

### 1.3 Home - Win Celebration
```
┌─────────────────────────────────────┐
│                                     │
│           🎉                        │
│                                     │
│     TAMAMLADIN!                     │
│                                     │
│     "Rapor teslimi"                 │
│     47 dakikada bitirdin            │
│     (Tahminin: 45dk - Çok yakın!)   │
│                                     │
│     +25 XP kazandın                 │
│     🔥 3 günlük streak!             │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Bu win'i nasıl kutlamak        ││
│  │  istersin?                      ││
│  │                                 ││
│  │  ☕ Kahve molası (5dk)          ││
│  │  🎵 Favori şarkı                ││
│  │  🚶 Kısa yürüyüş                ││
│  │  ➡️ Devam et                    ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 1.4 Home - Evening Reflection
```
┌─────────────────────────────────────┐
│  İyi akşamlar Can 🌙                │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📊 BUGÜNÜN ÖZETİ                   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ✓ 4/5 görev tamamlandı         ││
│  │  ⏱️ 2s 34dk odaklanma           ││
│  │  😊 Mood: Stabil → İyi          ││
│  │  💊 İlaç: ✓ Alındı              ││
│  └─────────────────────────────────┘│
│                                     │
│  🏆 BUGÜNKÜ WIN'LERİN               │
│  (En az 3 yaz - küçük olsun farketmez)│
│                                     │
│  1. [Rapor'u bitirdim            ]  │
│  2. [Kahvaltı yaptım             ]  │
│  3. [                            ]  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🌙 AKŞAM RUTİNİ                    │
│  [▶ Başla] 30dk • 6 adım            │
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 2: FOCUS (Odaklanma Araçları)
**Amaç:** Task initiation ve sustained attention desteği

### 2.1 Focus Hub
```
┌─────────────────────────────────────┐
│  FOCUS HUB 🎯                       │
│                                     │
│  Ne üzerinde çalışmak istiyorsun?   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  [Görev yaz veya seç...]       ││
│  └─────────────────────────────────┘│
│                                     │
│  📋 Bekleyen görevlerinden:         │
│  • Rapor teslimi                    │
│  • Email yanıtla                    │
│  • Alışveriş listesi                │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ⏱️ FOCUS MODE SEÇ                  │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │  🍅    │ │  🌊    │ │  ⚡   ││
│  │Pomodoro│ │  Flow  │ │ Sprint ││
│  │ 25/5   │ │ 50/10  │ │ 15/3  ││
│  │        │ │        │ │ ADHD  ││
│  └─────────┘ └─────────┘ └────────┘│
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │  🎯    │ │  ∞     │           │
│  │ Custom │ │ Until  │           │
│  │  ...   │ │  Done  │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  👥 BODY DOUBLE                     │
│  ┌─────────────────────────────────┐│
│  │  🟢 12 kişi şu an çalışıyor     ││
│  │  [Birine Katıl] [Solo Çalış]   ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 2.2 Active Focus Session
```
┌─────────────────────────────────────┐
│  ═══════════════════════════════════│
│                                     │
│              23:47                  │
│         ┌──────────────┐            │
│         │              │            │
│         │   ████████   │            │
│         │   ████████   │  ← Visual  │
│         │   ████████   │    Timer   │
│         │   ░░░░░░░░   │            │
│         │              │            │
│         └──────────────┘            │
│                                     │
│         "Rapor yazımı"              │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  🎵 Ambient: Rain + Lo-fi           │
│  [🔊  advancement advancement]      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  👤 Body Double                     │
│  ┌─────────────────────────────────┐│
│  │  [👤 Sarah]  "Working on..."    ││
│  │  Session: 23:47 remaining       ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [⏸️ Pause]  [✓ Early Done]  [💬]   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  💡 Stuck? Tap for help             │
│                                     │
└─────────────────────────────────────┘
```

### 2.3 Focus - Stuck Helper (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ══════════════════════════════════ │
│                                     │
│  😵 Takıldın mı? Sorun değil.       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🔹 TASK'I KÜÇÜLT                   │
│     Bu görevi 3 parçaya bölelim     │
│     [Böl ve Devam Et]               │
│                                     │
│  🔹 2 DAKİKA VERSİYONU              │
│     Sadece 2dk'lık kısmını yap      │
│     [2dk Başlat]                    │
│                                     │
│  🔹 BODY DOUBLE BUL                 │
│     Birisi seninle çalışsın         │
│     [Eşleş]                         │
│                                     │
│  🔹 FARKLI GÖREV                    │
│     Belki şimdi bu görev için       │
│     doğru zaman değil               │
│     [Başka Görev Seç]               │
│                                     │
│  🔹 MOLA VER                        │
│     5dk mola, sonra tekrar          │
│     [Mola Al]                       │
│                                     │
└─────────────────────────────────────┘
```

### 2.4 Focus - Break Screen
```
┌─────────────────────────────────────┐
│                                     │
│  ═══════════════════════════════════│
│                                     │
│           ☕ MOLA                    │
│                                     │
│            4:32                     │
│         remaining                   │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  Mola önerileri:                    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  🚶 Kalk ve stretch yap         ││
│  │  💧 Su iç                       ││
│  │  👀 Pencereden dışarı bak       ││
│  │  🧘 3 derin nefes               ││
│  └─────────────────────────────────┘│
│                                     │
│  ⚠️ Telefonu BIRAK                  │
│  Sosyal medya = mola değil          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Skip & Continue Working]          │
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 3: ROUTINES (Rutinler)
**Amaç:** External scaffolding - günlük yapı sağlama

### 3.1 Routines Hub
```
┌─────────────────────────────────────┐
│  RUTİNLERİM 📋                      │
│                                     │
│  Rutinler ADHD beyninin en iyi      │
│  arkadaşı. Karar verme yorgunluğunu │
│  azaltır.                           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🌅 SABAH RUTİNİ                    │
│  ┌─────────────────────────────────┐│
│  │  8 adım • ~35dk                 ││
│  │  Son: Bugün 08:15               ││
│  │  🔥 12 gün streak               ││
│  │                    [▶ Başla]    ││
│  └─────────────────────────────────┘│
│                                     │
│  🌙 AKŞAM RUTİNİ                    │
│  ┌─────────────────────────────────┐│
│  │  6 adım • ~25dk                 ││
│  │  Son: Dün 22:30                 ││
│  │  🔥 8 gün streak                ││
│  │                    [▶ Başla]    ││
│  └─────────────────────────────────┘│
│                                     │
│  💼 İŞE BAŞLAMA RUTİNİ              │
│  ┌─────────────────────────────────┐│
│  │  5 adım • ~15dk                 ││
│  │  Son: Pazartesi                 ││
│  │                    [▶ Başla]    ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [+ Yeni Rutin Oluştur]             │
│  [📚 Şablonlara Göz At]             │
│                                     │
└─────────────────────────────────────┘
```

### 3.2 Active Routine - Step by Step
```
┌─────────────────────────────────────┐
│  🌅 SABAH RUTİNİ                    │
│  Adım 3/8                           │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │         💊                      ││
│  │                                 ││
│  │      İLAÇ AL                    ││
│  │                                 ││
│  │      ⏱️ 0:30                    ││
│  │      ══════════════             ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  🔊 "İlacını almayı unutma"         │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Sonraki: Duş (10dk)                │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌───────────┐ ┌───────────┐       │
│  │   ⏭️      │ │    ✓      │       │
│  │   Skip    │ │   Done    │       │
│  └───────────┘ └───────────┘       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [⏸️ Rutini Duraklat]               │
│                                     │
└─────────────────────────────────────┘
```

### 3.3 Routine Builder
```
┌─────────────────────────────────────┐
│  YENİ RUTİN OLUŞTUR                 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Rutin Adı:                         │
│  ┌─────────────────────────────────┐│
│  │  [Sabah Rutini               ]  ││
│  └─────────────────────────────────┘│
│                                     │
│  Ne zaman?                          │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ 🌅  │ │ 🌞  │ │ 🌙  │        │
│  │Sabah│ │Öğlen │ │Akşam │        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ADIMLAR:                           │
│  ┌─────────────────────────────────┐│
│  │ ≡ 1. Uyan & Stretch    [2dk]   ││
│  │ ≡ 2. Su iç             [1dk]   ││
│  │ ≡ 3. İlaç al           [30sn]  ││
│  │ ≡ 4. ...               [...]   ││
│  │                                 ││
│  │ [+ Adım Ekle]                   ││
│  └─────────────────────────────────┘│
│                                     │
│  💡 İpucu: Küçük adımlar = Daha     │
│  kolay başlangıç                    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Kaydet]                           │
│                                     │
└─────────────────────────────────────┘
```

### 3.4 Routine Templates Gallery
```
┌─────────────────────────────────────┐
│  RUTİN ŞABLONLARI 📚                │
│                                     │
│  ADHD uzmanları tarafından          │
│  tasarlandı                         │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🌅 SABAH                           │
│  ┌─────────────────────────────────┐│
│  │  Gentle Wake Up                 ││
│  │  8 adım • 30dk                  ││
│  │  ⭐ 4.8 (2.3k kullanıcı)        ││
│  │                     [Kullan]    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │  Quick Morning                  ││
│  │  5 adım • 15dk                  ││
│  │  ⭐ 4.6 (1.8k kullanıcı)        ││
│  │                     [Kullan]    ││
│  └─────────────────────────────────┘│
│                                     │
│  💼 İŞ                              │
│  ┌─────────────────────────────────┐│
│  │  Deep Work Prep                 ││
│  │  6 adım • 20dk                  ││
│  │  ⭐ 4.7 (956 kullanıcı)         ││
│  │                     [Kullan]    ││
│  └─────────────────────────────────┘│
│                                     │
│  🌙 AKŞAM                           │
│  ┌─────────────────────────────────┐│
│  │  Wind Down                      ││
│  │  7 adım • 45dk                  ││
│  │  ⭐ 4.9 (3.1k kullanıcı)        ││
│  │                     [Kullan]    ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 4: TASKS (Görevler)
**Amaç:** Low cognitive load task management

### 4.1 Tasks Overview
```
┌─────────────────────────────────────┐
│  GÖREVLERİM 📝                      │
│                                     │
│  [Bugün] [Yakında] [Someday] [Done] │
│  ═══════                            │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🔴 ACİL (Bugün bitmeli)            │
│  ┌─────────────────────────────────┐│
│  │  ○ Rapor teslimi                ││
│  │    ⏱️ ~45dk • 📅 Bugün 17:00    ││
│  │    [▶ Focus] [···]              ││
│  └─────────────────────────────────┘│
│                                     │
│  🟡 ÖNEMLİ (Bu hafta)               │
│  ┌─────────────────────────────────┐│
│  │  ○ Email yanıtla                ││
│  │    ⏱️ ~20dk                     ││
│  │    [▶ Focus] [···]              ││
│  ├─────────────────────────────────┤│
│  │  ○ Doktor randevusu al          ││
│  │    ⏱️ ~10dk • 📞 Ara            ││
│  │    [▶ Focus] [···]              ││
│  └─────────────────────────────────┘│
│                                     │
│  🟢 İSTERSEN (Zaman varsa)          │
│  ┌─────────────────────────────────┐│
│  │  ○ Kitap oku                    ││
│  │    ⏱️ ~30dk                     ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [+ Görev Ekle]                     │
│                                     │
└─────────────────────────────────────┘
```

### 4.2 Quick Add Task (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ═══════════════════════════════════│
│                                     │
│  YENİ GÖREV                         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  [Ne yapman gerekiyor?       ]  ││
│  └─────────────────────────────────┘│
│                                     │
│  ⏱️ Tahmini süre:                   │
│  [5dk] [15dk] [30dk] [1s] [+]       │
│                                     │
│  🎯 Öncelik:                        │
│  [🔴 Acil] [🟡 Önemli] [🟢 Sonra]   │
│                                     │
│  📅 Ne zaman? (opsiyonel)           │
│  [Bugün] [Yarın] [Bu hafta] [Seç]  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  💡 İpucu: Görevi yeterince küçük   │
│  yaptın mı? "Rapor yaz" yerine      │
│  "Rapor intro'sunu yaz" dene.       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Kaydet]  [Kaydet & Focus Başlat]  │
│                                     │
└─────────────────────────────────────┘
```

### 4.3 Task Detail / Breakdown
```
┌─────────────────────────────────────┐
│  ← Görevler                         │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  Rapor teslimi                      │
│  🔴 Acil • 📅 Bugün 17:00           │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  ⏱️ TAHMİNİ SÜRE                    │
│  Senin tahminin: 45dk               │
│  Geçmiş benzer görevler: ~60dk      │
│  💡 Buffer ekle: 1s 15dk önerilir   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📋 ALT GÖREVLER                    │
│  ┌─────────────────────────────────┐│
│  │  ✓ Araştırma yap      [15dk]   ││
│  │  ○ Outline oluştur    [10dk]   ││
│  │  ○ İlk taslak yaz     [20dk]   ││
│  │  ○ Review & düzelt    [15dk]   ││
│  │                                 ││
│  │  [+ Alt görev ekle]             ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🤖 AI ÖNERİSİ                      │
│  Bu görev büyük görünüyor.          │
│  [Otomatik Böl]                     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [▶ Focus Session Başlat]           │
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 5: ME (Ben)
**Amaç:** Self-awareness, insights, emotional support

### 5.1 Me - Dashboard
```
┌─────────────────────────────────────┐
│  Merhaba Can 👋                     │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  📊 BU HAFTA                        │
│  ┌─────────────────────────────────┐│
│  │  Focus Time    █████████░ 8.5s  ││
│  │  Tasks Done    ████████░░ 23    ││
│  │  Routines      ██████████ 100%  ││
│  │  Mood Avg      😊 İyi            ││
│  └─────────────────────────────────┘│
│                                     │
│  🔥 STREAK'LER                      │
│  ┌─────────────────────────────────┐│
│  │  Sabah Rutini    🔥 12 gün      ││
│  │  Daily Check-in  🔥 8 gün       ││
│  │  Medication      🔥 30 gün      ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [🎯 Hedeflerim]                    │
│  [📈 Insights]                      │
│  [😊 Mood Journal]                  │
│  [💊 Medication]                    │
│  [🏆 Achievements]                  │
│  [⚙️ Settings]                      │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 Me - Insights
```
┌─────────────────────────────────────┐
│  ← Me                               │
│                                     │
│  📈 INSIGHTS                        │
│                                     │
│  Senin için kişiselleştirilmiş      │
│  öneriler                           │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  ⏰ EN VERİMLİ SAATLERİN            │
│  ┌─────────────────────────────────┐│
│  │     📊                          ││
│  │    ████                         ││
│  │   ██████                        ││
│  │  █████████                      ││
│  │ ████████████                    ││
│  │ 9  10  11  12  1  2  3  4       ││
│  │                                 ││
│  │ 💡 10:00-12:00 arası en         ││
│  │    verimli zamanın              ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🎯 TASK COMPLETION PATTERNS        │
│  ┌─────────────────────────────────┐│
│  │ Timer ile:        87% ✓         ││
│  │ Timer'sız:        43% ✓         ││
│  │                                 ││
│  │ 💡 Timer kullanmaya devam!      ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  😊 MOOD & PRODUCTIVITY             │
│  ┌─────────────────────────────────┐│
│  │ "Motivated but scattered"       ││
│  │ hissettiğin günler %40 daha     ││
│  │ verimli geçiyor.                ││
│  │                                 ││
│  │ 💡 Bu modu yakaladığında        ││
│  │    zor görevleri planla         ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 5.3 Me - Mood Journal
```
┌─────────────────────────────────────┐
│  ← Me                               │
│                                     │
│  😊 MOOD JOURNAL                    │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  BUGÜN NASIL HİSSEDİYORSUN?         │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ 😢  │ │ 😕  │ │ 😐  │ │ 🙂  │   │
│  │     │ │     │ │     │ │     │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                     ┌─────┐         │
│                     │ 😊  │         │
│                     │  ✓  │         │
│                     └─────┘         │
│                                     │
│  Enerji seviyeni?                   │
│  [░░░░░░░░░░] → [████████░░]        │
│        2              8             │
│                                     │
│  Bugünü etkileyen bir şey var mı?   │
│  ┌─────────────────────────────────┐│
│  │  [İsteğe bağlı not...        ]  ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📅 SON 7 GÜN                       │
│  ┌─────────────────────────────────┐│
│  │  P   S   Ç   P   C   C   P      ││
│  │  😊  🙂  😕  🙂  😊  😊  ?      ││
│  └─────────────────────────────────┘│
│                                     │
│  [Kaydet]                           │
│                                     │
└─────────────────────────────────────┘
```

### 5.4 Me - Medication Tracker
```
┌─────────────────────────────────────┐
│  ← Me                               │
│                                     │
│  💊 MEDICATION                      │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  BUGÜN                              │
│  ┌─────────────────────────────────┐│
│  │  💊 Concerta 36mg               ││
│  │     08:00 → ✓ 08:12'de alındı   ││
│  │                                 ││
│  │  💊 Magnezyum                   ││
│  │     21:00 → ⏳ Bekliyor         ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📊 ADHERENCE                       │
│  ┌─────────────────────────────────┐│
│  │  Bu hafta:  ██████░ 6/7 gün     ││
│  │  Bu ay:     ████████░ 28/30     ││
│  │                                 ││
│  │  🔥 30 günlük streak!           ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📝 NOTLAR                          │
│  ┌─────────────────────────────────┐│
│  │  Bugün nasıl hissettirdi?       ││
│  │  [                            ] ││
│  │                                 ││
│  │  Yan etki var mı?               ││
│  │  [Yok ✓] [Var - not ekle]       ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [+ İlaç Ekle]  [📊 Rapor Oluştur]  │
│                                     │
└─────────────────────────────────────┘
```

### 5.5 Me - Dopamine Menu
```
┌─────────────────────────────────────┐
│  ← Me                               │
│                                     │
│  🎁 DOPAMINE MENU                   │
│                                     │
│  Kendini ödüllendirmenin yolları    │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  💰 PUAN DURUMUN                    │
│  ┌─────────────────────────────────┐│
│  │         ⭐ 2,450 XP             ││
│  │                                 ││
│  │  Bu hafta kazandın: +380 XP     ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🍬 KÜÇÜK ÖDÜLLER (50-100 XP)       │
│  ┌─────────────────────────────────┐│
│  │  ☕ Favori kahveni al    [50]   ││
│  │  🎵 1 şarkı keyfi        [50]   ││
│  │  🍫 Küçük tatlı          [75]   ││
│  │  📱 15dk scroll serbest  [100]  ││
│  └─────────────────────────────────┘│
│                                     │
│  🎁 ORTA ÖDÜLLER (200-500 XP)       │
│  ┌─────────────────────────────────┐│
│  │  🎬 Film gecesi          [200]  ││
│  │  🍕 Favori yemek         [300]  ││
│  │  🛒 Küçük alışveriş      [500]  ││
│  └─────────────────────────────────┘│
│                                     │
│  🏆 BÜYÜK ÖDÜLLER (1000+ XP)        │
│  ┌─────────────────────────────────┐│
│  │  🎮 Yeni oyun            [1000] ││
│  │  💆 Masaj/Spa            [1500] ││
│  │  🎉 Gün gezisi           [2000] ││
│  └─────────────────────────────────┘│
│                                     │
│  [+ Kendi Ödülünü Ekle]             │
│                                     │
└─────────────────────────────────────┘
```

---

## OVERLAY SCREENS

### O.1 Quick Mood Check (Notification Response)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         Şu an nasılsın?             │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ 😴  │ │ ⚡  │ │ 😰  │ │ 🤷  │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### O.2 Celebration Modal
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│           🎉 🎊 🎉                  │
│                                     │
│        MUHTEŞEM!                    │
│                                     │
│    Sabah rutinini tamamladın!       │
│                                     │
│        🔥 12 gün streak             │
│        +50 XP kazandın              │
│                                     │
│    ┌─────────────────────────┐      │
│    │  "İyi başlangıç güne   │      │
│    │   güç katar"           │      │
│    └─────────────────────────┘      │
│                                     │
│         [Harika! ✓]                 │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### O.3 Gentle Nudge (When User is Stuck)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│            💭                       │
│                                     │
│     Hey, 15 dakikadır              │
│     aynı task'ta takılısın         │
│                                     │
│     Sorun değil, bu normal.         │
│     Ne yapmak istersin?             │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  🔹 Task'ı küçült               ││
│  │  🔹 2dk versiyonunu yap         ││
│  │  🔹 Başka task'a geç            ││
│  │  🔹 5dk mola ver                ││
│  │  🔹 Devam ediyorum ✓            ││
│  └─────────────────────────────────┘│
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### O.4 Crisis Support (Always Accessible)
```
┌─────────────────────────────────────┐
│                                     │
│  🆘 KRİZ DESTEĞİ                    │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  Zor bir an yaşıyorsan,             │
│  yalnız değilsin.                   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📞 ACİL YARDIM HATLARI             │
│  ┌─────────────────────────────────┐│
│  │  🇹🇷 182 - Alo 182              ││
│  │     7/24 Psikolojik Destek      ││
│  │                        [Ara]    ││
│  ├─────────────────────────────────┤│
│  │  🆘 112 - Acil Yardım           ││
│  │                        [Ara]    ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🧘 ŞİMDİ YAPABILECEĞIN             │
│  ┌─────────────────────────────────┐│
│  │  [3 Derin Nefes - Başlat]       ││
│  │  [5-4-3-2-1 Grounding]          ││
│  │  [Güvenli Kişiyi Ara]           ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Bu geçecek. Destek almak           │
│  güçlülük işareti.                  │
│                                     │
└─────────────────────────────────────┘
```

### O.5 Body Double Matching
```
┌─────────────────────────────────────┐
│                                     │
│  👥 BODY DOUBLE                     │
│                                     │
│  ═══════════════════════════════════│
│                                     │
│  Ne üzerinde çalışacaksın?          │
│  ┌─────────────────────────────────┐│
│  │  [Rapor yazımı                ] ││
│  └─────────────────────────────────┘│
│                                     │
│  Ne kadar çalışmak istiyorsun?      │
│  [25dk] [50dk] [75dk] [Custom]      │
│         ════                        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🟢 ŞUAN MÜSAİT                     │
│  ┌─────────────────────────────────┐│
│  │  👤 Sarah K.                    ││
│  │     "Studying for exam"         ││
│  │     ⭐ 4.9 • 234 session        ││
│  │                    [Eşleş]      ││
│  ├─────────────────────────────────┤│
│  │  👤 Mehmet A.                   ││
│  │     "Writing code"              ││
│  │     ⭐ 4.8 • 156 session        ││
│  │                    [Eşleş]      ││
│  └─────────────────────────────────┘│
│                                     │
│  [🤖 AI Body Double ile Çalış]      │
│                                     │
└─────────────────────────────────────┘
```

---

## WIDGET SCREENS

### W.1 Home Screen Widget (Small)
```
┌───────────────────┐
│  MindFlow         │
│  ─────────────    │
│  Sonraki:         │
│  💊 İlaç al 08:00 │
│  🔥 12 gün        │
└───────────────────┘
```

### W.2 Home Screen Widget (Medium)
```
┌─────────────────────────────────────┐
│  MindFlow                     😊    │
│  ───────────────────────────────    │
│  📋 Bugün: 3 görev • ~2s            │
│  🔴 Rapor teslimi (17:00)           │
│                                     │
│  [▶ Focus Başlat]                   │
└─────────────────────────────────────┘
```

### W.3 Lock Screen Widget
```
┌─────────────────────────────────────┐
│  💊 İlaç zamanı                     │
│  [Aldım ✓]  [Hatırlat]              │
└─────────────────────────────────────┘
```

---

## NOTIFICATION PATTERNS

### N.1 Gentle Morning Reminder
```
┌─────────────────────────────────────┐
│  MindFlow 🌅                        │
│  Günaydın! Sabah rutinine hazır     │
│  mısın? 8 adım • ~35dk              │
│  [Başla] [10dk sonra]               │
└─────────────────────────────────────┘
```

### N.2 Medication Reminder (Persistent)
```
┌─────────────────────────────────────┐
│  MindFlow 💊                        │
│  İlaç zamanı: Concerta 36mg         │
│  [Aldım ✓] [5dk sonra] [Skip]       │
└─────────────────────────────────────┘
```

### N.3 Focus Session Ending
```
┌─────────────────────────────────────┐
│  MindFlow ⏱️                        │
│  Focus session bitiyor! 2 dk kaldı  │
│  [Uzat +10dk] [Bitir]               │
└─────────────────────────────────────┘
```

### N.4 Celebration Push
```
┌─────────────────────────────────────┐
│  MindFlow 🎉                        │
│  3. günlük streak! Devam et 💪      │
│  [Göster]                           │
└─────────────────────────────────────┘
```

### N.5 Evening Wind-down
```
┌─────────────────────────────────────┐
│  MindFlow 🌙                        │
│  Akşam rutini zamanı.               │
│  Günü güzel bitir. 6 adım • 25dk    │
│  [Başla] [Atla]                     │
└─────────────────────────────────────┘
```

---

## SETTINGS STRUCTURE

### Settings Main
```
┌─────────────────────────────────────┐
│  ⚙️ AYARLAR                         │
│                                     │
│  👤 HESAP                           │
│  • Profil                           │
│  • Abonelik                         │
│  • Veri & Gizlilik                  │
│                                     │
│  🔔 BİLDİRİMLER                     │
│  • Hatırlatıcılar                   │
│  • Bildirim Sesleri                 │
│  • Sessiz Saatler                   │
│                                     │
│  🎨 GÖRÜNÜM                         │
│  • Tema (Açık/Koyu/Sistem)          │
│  • Yazı Boyutu                      │
│  • Animasyonları Azalt              │
│                                     │
│  ⏱️ FOCUS AYARLARI                  │
│  • Varsayılan Focus Süresi          │
│  • Mola Süreleri                    │
│  • Ambient Sesler                   │
│                                     │
│  🔗 ENTEGRASYONLAR                  │
│  • Takvim Senkronizasyonu           │
│  • Apple Health                     │
│  • Wear OS / Apple Watch            │
│                                     │
│  💊 İLAÇ AYARLARI                   │
│  • İlaçlarım                        │
│  • Hatırlatıcı Zamanları            │
│  • Stok Takibi                      │
│                                     │
│  🆘 YARDIM & DESTEK                 │
│  • Nasıl Kullanılır                 │
│  • SSS                              │
│  • Bize Ulaşın                      │
│  • Kriz Kaynakları                  │
│                                     │
└─────────────────────────────────────┘
```

---

## ACCESSIBILITY FEATURES

### Her Ekranda Bulunması Gerekenler:

1. **Yazı Boyutu Desteği**
   - Dynamic Type (iOS)
   - Font scaling (Android)
   - Min 16pt body text

2. **Renk Körlüğü Desteği**
   - Renk + icon kombinasyonu
   - High contrast mode
   - Sadece renge bağlı bilgi yok

3. **Motion Sensitivity**
   - "Reduce Motion" ayarı
   - Animasyonları devre dışı bırakma
   - Simpler transitions

4. **Screen Reader**
   - VoiceOver (iOS) / TalkBack (Android) tam desteği
   - Meaningful labels
   - Proper heading structure

5. **One-Handed Use**
   - Bottom navigation
   - Reachable primary actions
   - Swipe gestures

---

## PREMIUM VS FREE FEATURES

### FREE
- 3 aktif rutin
- Temel task management
- 2 body double session/hafta
- Mood tracking
- Temel insights
- 1 focus mode (Pomodoro)

### PREMIUM ($9.99/ay veya $59.99/yıl)
- Sınırsız rutin
- AI-powered task breakdown
- Sınırsız body double
- Detaylı analytics & insights
- Tüm focus modları
- Custom ambient sounds
- Calendar sync
- Export data
- Priority support
- Offline mode

---

## TECHNICAL NOTES

### State Management (Zustand)
- `onboardingStore` - Onboarding state
- `userStore` - User preferences, settings
- `taskStore` - Tasks, subtasks
- `routineStore` - Routines, steps
- `focusStore` - Active session, timer
- `moodStore` - Mood entries
- `medicationStore` - Meds, reminders
- `insightsStore` - Analytics data
- `bodyDoubleStore` - Session matching

### Data Persistence (MMKV)
- Local-first architecture
- Encrypted storage
- Offline capable
- Sync when online

### Key Libraries
- `react-native-reanimated` - Animations
- `@shopify/flash-list` - Performant lists
- `react-native-mmkv` - Storage
- `zustand` - State management
- `expo-notifications` - Push notifications
- `expo-haptics` - Tactile feedback
- `@gorhom/bottom-sheet` - Bottom sheets
- `react-native-skia` - Premium graphics

---

**Document Version:** 1.0
**Created:** December 8, 2025
**Total Screens:** 35+ unique screens
**Design Philosophy:** ADHD-first, dopamine-aware, cognitively gentle
