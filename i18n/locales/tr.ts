/**
 * Turkish Translations
 * Complete translation file for MicroBreaks
 */

export default {
  // ============================================
  // Common
  // ============================================
  common: {
    appName: 'MicroBreaks',
    loading: 'Yukleniyor...',
    error: 'Hata',
    success: 'Basarili',
    cancel: 'Iptal',
    confirm: 'Onayla',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Duzenle',
    done: 'Tamam',
    next: 'Ileri',
    back: 'Geri',
    skip: 'Atla',
    continue: 'Devam',
    retry: 'Tekrar Dene',
    close: 'Kapat',
    ok: 'Tamam',
    yes: 'Evet',
    no: 'Hayir',
    all: 'Tumu',
    none: 'Hicbiri',
    search: 'Ara',
    filter: 'Filtrele',
    sort: 'Sirala',
    refresh: 'Yenile',
    seeAll: 'Tumunu Gor',
    learnMore: 'Daha Fazla',
  },

  // ============================================
  // Navigation
  // ============================================
  navigation: {
    home: 'Ana Sayfa',
    breaks: 'Molalar',
    stats: 'Istatistikler',
    profile: 'Profil',
    settings: 'Ayarlar',
    notifications: 'Bildirimler',
  },

  // ============================================
  // Home Screen
  // ============================================
  home: {
    greeting: {
      morning: 'Gunaydin',
      afternoon: 'Iyi Gunler',
      evening: 'Iyi Aksamlar',
      night: 'Iyi Geceler',
    },
    title: 'Molaya hazir misin?',
    subtitle: 'Zihninizi ve bedeninizi tazelemek icin bir an ayin',
    quickBreaks: 'Hizli Molalar',
    startBreak: 'Molaya Basla',
    nextBreakIn: 'Sonraki mola',
    dailyProgress: 'Gunluk Ilerleme',
    weeklyProgress: 'Haftalik Ilerleme',
    breaksToday: 'Bugun {{count}} / {{goal}} mola',
    streakDays: '{{count}} gunluk seri',
    streakDays_plural: '{{count}} gunluk seri',
    levelProgress: 'Seviye {{level}}',
    xpToNext: 'Sonraki seviyeye {{xp}} XP',
    smartInsight: {
      longSession: "Bir suredir calisiyorsunuz. Mola zamani!",
      goodProgress: "Bugun harika ilerleme! Boyle devam!",
      almostGoal: "Neredeyse tamam! Hedefinize ulasmak icin sadece {{count}} mola daha.",
      almostGoal_plural: "Neredeyse tamam! Hedefinize ulasmak icin sadece {{count}} mola daha.",
      streakWarning: "Serinizi korumak icin molanizi unutmayin!",
    },
    emptyState: {
      title: "MicroBreaks'e Hosgeldiniz",
      subtitle: 'Saglik yolculugunuza ilk molanizla baslayin',
      action: 'Ilk Molami Al',
    },
  },

  // ============================================
  // Breaks Screen
  // ============================================
  breaks: {
    title: 'Molalari Kesfet',
    subtitle: 'Sizin icin mukemmel molayi bulun',
    featured: 'One Cikan',
    categories: {
      all: 'Tumu',
      quick: 'Hizli',
      stretch: 'Esneme',
      mindful: 'Farikindali',
      active: 'Aktif',
    },
    duration: {
      short: '1-2 dk',
      medium: '3-5 dk',
      long: '5+ dk',
    },
    filters: {
      duration: 'Sure',
      category: 'Kategori',
      favorites: 'Favoriler',
    },
    empty: {
      search: '"{{query}}" icin mola bulunamadi',
      filter: 'Filtrelerinize uyan mola yok',
      favorites: 'Henuz favori mola yok',
    },
    card: {
      duration: '{{minutes}} dk',
      steps: '{{count}} adim',
      steps_plural: '{{count}} adim',
    },
  },

  // ============================================
  // Break Session
  // ============================================
  breakSession: {
    preparation: {
      title: 'Hazir Ol',
      subtitle: 'Rahat bir pozisyon bul',
      starting: '{{seconds}} saniye icinde basliyor...',
    },
    controls: {
      pause: 'Duraklat',
      resume: 'Devam',
      skip: 'Atla',
      end: 'Oturumu Bitir',
    },
    progress: {
      step: 'Adim {{current}} / {{total}}',
      timeRemaining: '{{seconds}} saniye kaldi',
    },
    completion: {
      title: 'Harika is!',
      subtitle: 'Molayi tamamladiniz',
      xpEarned: '+{{xp}} XP',
      streakMaintained: 'Seri devam ediyor!',
      newAchievement: 'Yeni basari acildi!',
      stats: {
        duration: 'Sure',
        steps: 'Tamamlanan adimlar',
        calories: 'Tahmini kalori',
      },
    },
    feedback: {
      title: 'Bu mola nasild?',
      subtitle: 'Geri bildiriminiz gelistirmemize yardimci olur',
      thankYou: 'Tesekkurler!',
      ratings: {
        1: 'Kotu',
        2: 'Orta',
        3: 'Iyi',
        4: 'Cok Iyi',
        5: 'Mukemmel',
      },
    },
    confirmEnd: {
      title: 'Oturumu Bitir?',
      message: 'Bu mola oturumunu bitirmek istediginize emin misiniz?',
    },
  },

  // ============================================
  // Exercises
  // ============================================
  exercises: {
    // Quick Breaks
    eyeRest: {
      title: 'Goz Dinlendirme',
      description: 'Gozlerinize ekrandan bir mola verin',
    },
    deepBreathing: {
      title: 'Derin Nefes',
      description: 'Nefes egzersizleriyle zihninizi sakinlestirin',
    },
    neckRolls: {
      title: 'Boyun Cevirmesi',
      description: 'Boynunuzdaki gerginligi azaltin',
    },
    wristStretch: {
      title: 'Bilek Esneme',
      description: 'Yazmaktan kaynaklanan zorlanmayi onleyin',
    },

    // Stretching
    upperBodyStretch: {
      title: 'Ust Vucut Esneme',
      description: 'Tam ust vucut esneme rutini',
    },
    lowerBodyStretch: {
      title: 'Alt Vucut Esneme',
      description: 'Bacaklarinizi ve belinizi esnetin',
    },
    fullBodyStretch: {
      title: 'Tam Vucut Esneme',
      description: 'Kapsamli esneme oturumu',
    },
    shoulderRelease: {
      title: 'Omuz Gevsetme',
      description: 'Omuz gerginligini azaltin',
    },

    // Mindful
    miniMeditation: {
      title: 'Mini Meditasyon',
      description: 'Hizli farikindlalik oturumu',
    },
    bodyScan: {
      title: 'Vucut Taramasi',
      description: 'Bilingli vucut farkindailigi',
    },
    gratitude: {
      title: 'Sukran Ani',
      description: 'Minnettar oldugunuz seyleri dusunun',
    },
    breathAwareness: {
      title: 'Nefes Farkindailigi',
      description: 'Nefesinize odaklanin',
    },

    // Active
    quickWalk: {
      title: 'Kisa Yuruyus',
      description: 'Kisa bir yuruyusle hareket edin',
    },
    deskExercises: {
      title: 'Masa Basi Egzersizleri',
      description: 'Masanizda yapabileceginiz egzersizler',
    },
    energizer: {
      title: 'Enerji Artirici',
      description: 'Hareketle enerjinizi artirin',
    },
    jumpingJacks: {
      title: 'Jumping Jacks',
      description: 'Hizli kardiyo patlamasi',
    },

    // Featured
    afternoonReset: {
      title: 'Ogleden Sonra Yenileme',
      description: 'Mukemmel gun ortasi tazeleyici',
    },
  },

  // ============================================
  // Stats Screen
  // ============================================
  stats: {
    title: 'Ilerlemeniz',
    subtitle: 'Saglik yolculugunuzu takip edin',
    periods: {
      today: 'Bugun',
      week: 'Bu Hafta',
      month: 'Bu Ay',
      all: 'Tum Zamanlar',
    },
    metrics: {
      totalBreaks: 'Toplam Mola',
      totalTime: 'Toplam Sure',
      currentStreak: 'Mevcut Seri',
      longestStreak: 'En Uzun Seri',
      averageDaily: 'Gunluk Ortalama',
      favoriteCategory: 'Favori Kategori',
    },
    charts: {
      weeklyBreaks: 'Haftalik Molalar',
      categoryBreakdown: 'Kategori Dagilimi',
      timeOfDay: 'Gun Icinde Zaman',
    },
    achievements: {
      title: 'Basarilar',
      unlocked: '{{count}} acildi',
      progress: '{{current}}/{{total}}',
      viewAll: 'Tum Basarilari Gor',
    },
    empty: {
      title: 'Henuz veri yok',
      subtitle: 'Istatistiklerinizi gormek icin molalar tamamlayin',
      action: 'Mola Al',
    },
  },

  // ============================================
  // Profile Screen
  // ============================================
  profile: {
    title: 'Profil',
    level: 'Seviye {{level}}',
    xpProgress: '{{current}}/{{next}} XP',
    memberSince: '{{date}} tarihinden beri uye',
    sections: {
      account: 'Hesap',
      preferences: 'Tercihler',
      notifications: 'Bildirimler',
      about: 'Hakkinda',
    },
    items: {
      editProfile: 'Profili Duzenle',
      goals: 'Hedefler',
      notifications: 'Bildirim Ayarlari',
      theme: 'Tema',
      sound: 'Ses Efektleri',
      haptics: 'Dokunsal Geri Bildirim',
      voiceGuidance: 'Sesli Rehberlik',
      language: 'Dil',
      privacy: 'Gizlilik',
      help: 'Yardim ve Destek',
      about: 'MicroBreaks Hakkinda',
      rateApp: 'Uygulamayi Degerlendir',
      shareApp: 'Arkadaslarinla Paylas',
      signOut: 'Cikis Yap',
    },
    signOutConfirm: {
      title: 'Cikis Yap',
      message: 'Cikis yapmak istediginize emin misiniz? Ilerlemeniz kaydedilecektir.',
    },
  },

  // ============================================
  // Settings
  // ============================================
  settings: {
    theme: {
      title: 'Tema',
      dark: 'Karanlik',
      light: 'Aydinlik',
      system: 'Sistem',
    },
    notifications: {
      title: 'Bildirimler',
      enabled: 'Bildirimleri Etkinlestir',
      breakReminders: 'Mola Hatirlaticilari',
      reminderInterval: 'Hatirlatici Araligi',
      streakAlerts: 'Seri Uyarilari',
      goalNotifications: 'Hedef Bildirimleri',
      quietHours: 'Sessiz Saatler',
      quietHoursTime: '{{start}} - {{end}}',
      workDaysOnly: 'Sadece Is Gunleri',
    },
    audio: {
      title: 'Ses ve Dokunsal',
      sound: 'Ses Efektleri',
      haptics: 'Dokunsal Geri Bildirim',
      voiceGuidance: 'Sesli Rehberlik',
    },
    privacy: {
      title: 'Gizlilik',
      analytics: 'Analitik',
      crashReporting: 'Cokme Raporlama',
    },
    goals: {
      title: 'Hedefler',
      weekly: 'Haftalik Hedef',
      daily: 'Gunluk Hedef',
      breaksPerWeek: '{{count}} mola/hafta',
      breaksPerDay: '{{count}} mola/gun',
    },
    language: {
      title: 'Dil',
      current: 'Mevcut: {{language}}',
    },
  },

  // ============================================
  // Onboarding
  // ============================================
  onboarding: {
    welcome: {
      title: "MicroBreaks'e Hosgeldiniz",
      subtitle: 'Daha saglikli bir is gunu icin saglik arkadasiniz',
      action: 'Baslayalim',
    },
    benefits: {
      title: 'Neden Mikro Molalar?',
      items: {
        eyes: 'Goz yorgunlugunu azalt',
        posture: 'Durus iyilestir',
        focus: 'Odaklanmayi artir',
        energy: 'Enerji artir',
      },
    },
    personalization: {
      title: 'Kisiletirelim',
      subtitle: 'Ihtiyaclarinizi anlamamiza yardimci olun',
      workRole: {
        question: 'Isinizi en iyi ne tanimlar?',
        options: {
          developer: 'Gelistirici',
          designer: 'Tasarimci',
          writer: 'Yazar',
          manager: 'Yonetici',
          student: 'Ogrenci',
          other: 'Diger',
        },
      },
      screenTime: {
        question: 'Ekran basinda kac saat geciriyorsunuz?',
        options: {
          low: '4 saatten az',
          medium: '4-8 saat',
          high: '8 saatten fazla',
        },
      },
      painAreas: {
        question: 'Herhangi bir rahatsizlik yasiyor musunuz?',
        options: {
          eyes: 'Goz yorgunlugu',
          neck: 'Boyun agrisi',
          back: 'Sirt agrisi',
          wrists: 'Bilek agrisi',
          shoulders: 'Omuz gerginligi',
          none: 'Hicbiri',
        },
      },
    },
    notifications: {
      title: 'Yolda kalin',
      subtitle: 'Hicbir molayi kacirmamak icin bildirimleri etkinlestirin',
      enable: 'Bildirimleri Etkinlestir',
      later: 'Daha Sonra',
    },
    complete: {
      title: 'Hazirsiniz!',
      subtitle: 'Ilk molanizi birlikte alalim',
      action: 'Ilk Molayi Baslat',
    },
  },

  // ============================================
  // Achievements
  // ============================================
  achievements: {
    title: 'Basarilar',
    subtitle: 'Kilometre taslarinizi kutlayin',
    categories: {
      breaks: 'Molalar',
      streaks: 'Seriler',
      time: 'Zaman',
      exploration: 'Kesif',
      special: 'Ozel',
    },
    items: {
      firstStep: {
        title: 'Ilk Adim',
        description: 'Ilk molanizi tamamlayin',
      },
      gettingStarted: {
        title: 'Baslangic',
        description: '10 mola tamamlayin',
      },
      committed: {
        title: 'Kararli',
        description: '50 mola tamamlayin',
      },
      centurion: {
        title: 'Yuzbasi',
        description: '100 mola tamamlayin',
      },
      breakMaster: {
        title: 'Mola Ustasi',
        description: '500 mola tamamlayin',
      },
      streak3: {
        title: 'Ivmeleniyor',
        description: '3 gunluk seri tutun',
      },
      streak7: {
        title: 'Hafta Savascisi',
        description: '7 gunluk seri tutun',
      },
      streak14: {
        title: 'On Dort Gun',
        description: '14 gunluk seri tutun',
      },
      streak30: {
        title: 'Aylik Usta',
        description: '30 gunluk seri tutun',
      },
      streak100: {
        title: 'Durdurulamaz',
        description: '100 gunluk seri tutun',
      },
      hour1: {
        title: 'Iyi Harcanmis Zaman',
        description: '1 saatlik mola biriktirin',
      },
      hour5: {
        title: 'Adanmis',
        description: '5 saatlik mola biriktirin',
      },
      hour10: {
        title: 'Saglik Savascisi',
        description: '10 saatlik mola biriktirin',
      },
    },
    locked: 'Kilitli',
    unlocked: 'Acildi',
    unlockedAt: '{{date}} tarihinde acildi',
    reward: '+{{xp}} XP',
  },

  // ============================================
  // Notifications
  // ============================================
  notifications: {
    title: 'Bildirimler',
    empty: 'Henuz bildirim yok',
    markAllRead: 'Tumunu Okundu Isaretle',
    types: {
      breakReminder: 'Mola Hatirlatici',
      streakAlert: 'Seri Uyarisi',
      achievementUnlocked: 'Basari Acildi',
      goalComplete: 'Hedef Tamamlandi',
      levelUp: 'Seviye Atladi',
      general: 'Genel',
    },
    messages: {
      breakReminder: "Mola zamani! Gozleriniz ve vuudunuz size tesekkur edecek.",
      streakWarning: "{{count}} gunluk serinizi kaybetmeyin! Bugun bir mola alin.",
      goalComplete: "Gunluk hedefinize ulastiniz! Harika is!",
      levelUp: "Tebrikler! {{level}}. seviyeye ulastiniz!",
      achievementUnlocked: "Acilan basari: {{achievement}}",
    },
  },

  // ============================================
  // Errors
  // ============================================
  errors: {
    generic: 'Bir seyler yanlis gitti. Lutfen tekrar deneyin.',
    network: 'Baglanilamiyor. Lutfen internet baglantinizi kontrol edin.',
    storage: 'Veri kaydedilemedi. Lutfen tekrar deneyin.',
    notificationPermission: 'Lutfen ayarlardan bildirimleri etkinlestirin.',
    somethingWentWrong: 'Bir seyler yanlis gitti',
    tryAgain: 'Lutfen tekrar deneyin',
    contactSupport: 'Sorun devam ederse, lutfen destekle iletisime gecin.',
  },

  // ============================================
  // Time & Dates
  // ============================================
  time: {
    justNow: 'Az once',
    minutesAgo: '{{count}} dakika once',
    minutesAgo_plural: '{{count}} dakika once',
    hoursAgo: '{{count}} saat once',
    hoursAgo_plural: '{{count}} saat once',
    daysAgo: '{{count}} gun once',
    daysAgo_plural: '{{count}} gun once',
    seconds: '{{count}}sn',
    minutes: '{{count}}dk',
    hours: '{{count}}sa',
    days: '{{count}}g',
  },

  // ============================================
  // Formatting
  // ============================================
  format: {
    date: {
      short: 'DD/MM/YYYY',
      long: 'D MMMM YYYY',
    },
    time: {
      short: 'HH:mm',
      long: 'HH:mm:ss',
    },
  },
} as const;
