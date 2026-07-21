/**
 * Turkish Translations
 * Complete translation file for MicroBreaks
 */

export default {
  // ============================================
  // Common
  // ============================================
  common: {
    appName: 'Unwind',
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    cancel: 'İptal',
    confirm: 'Onayla',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    done: 'Tamam',
    next: 'İleri',
    back: 'Geri',
    skip: 'Atla',
    continue: 'Devam',
    retry: 'Tekrar Dene',
    close: 'Kapat',
    ok: 'Tamam',
    yes: 'Evet',
    no: 'Hayır',
    all: 'Tümü',
    none: 'Hiçbiri',
    search: 'Ara',
    filter: 'Filtrele',
    sort: 'Sırala',
    refresh: 'Yenile',
    seeAll: 'Tümünü Gör',
    learnMore: 'Daha Fazla',
  },

  // ============================================
  // Navigation
  // ============================================
  navigation: {
    home: 'Ana Sayfa',
    breaks: 'Molalar',
    stats: 'İstatistikler',
    profile: 'Profil',
    settings: 'Ayarlar',
    notifications: 'Bildirimler',
  },

  // ============================================
  // Home Screen
  // ============================================
  home: {
    greeting: {
      morning: 'Günaydın',
      afternoon: 'İyi Günler',
      evening: 'İyi Akşamlar',
      night: 'İyi Geceler',
    },
    greetingSubtitle: {
      night: 'İyi uykular, molalar bekleyebilir',
      morning: 'Güne bir esneme ile başla',
      earlyAfternoon: 'Öğlen molası için mükemmel zaman',
      lateAfternoon: 'İvmeyi korumaya devam',
      evening: 'Hafif bir mola ile rahatla',
      lateEvening: 'Dinlenmeden önce bir mola daha',
    },
    takeABreak: 'Mola Ver',
    tapToStart: 'Hızlı bir egzersiz başlatmak için dokun',
    title: 'Molaya hazır mısın?',
    subtitle: 'Zihninizi ve bedeninizi tazelemek için bir an ayırın',
    quickBreaks: 'Hızlı Molalar',
    startBreak: 'Molaya Başla',
    nextBreakIn: 'Sonraki mola',
    dailyProgress: 'Günlük İlerleme',
    weeklyProgress: 'Haftalık İlerleme',
    breaksToday: 'Bugün {{count}} / {{goal}} mola',
    streakDays: '{{count}} günlük seri',
    streakDays_plural: '{{count}} günlük seri',
    levelProgress: 'Seviye {{level}}',
    xpToNext: 'Sonraki seviyeye {{xp}} XP',
    smartInsight: {
      longSession: 'Bir süredir çalışıyorsunuz. Mola zamanı!',
      goodProgress: 'Bugün harika ilerleme! Böyle devam!',
      almostGoal: 'Neredeyse tamam! Hedefinize ulaşmak için sadece {{count}} mola daha.',
      almostGoal_plural: 'Neredeyse tamam! Hedefinize ulaşmak için sadece {{count}} mola daha.',
      streakWarning: 'Serinizi korumak için molanızı unutmayın!',
    },
    emptyState: {
      title: "Unwind'e Hoş Geldiniz",
      subtitle: 'Sağlık yolculuğunuza ilk molanızla başlayın',
      action: 'İlk Molamı Al',
    },
    motivationalQuotes: [
      { text: 'Küçük molalar, büyük farklar yaratır.', author: 'Sağlığın Sırrı' },
      { text: 'Bedenin her şeyi hatırlar. Onu dinle.', author: 'Hareketin Önemi' },
      { text: 'Dinlenmek tembellik değil, şarj olmaktır.', author: 'Bilinçli Yaşam' },
      { text: 'Her germe daha sağlıklı bir adımdır.', author: 'Beden Dengesi' },
      { text: 'Dur. Nefes al. Daha güçlü devam et.', author: 'Odak Akışı' },
      { text: 'Mola için en iyi zaman 5 dakika önceydi. İkincisi şimdi.', author: 'Daha İyi Molalar' },
      { text: 'Gelecekteki sen bu mola için teşekkür edecek.', author: 'Öz Bakım' },
      { text: 'Hareket, zihnin ilacıdır.', author: 'Aktif Zihin' },
    ],
    celebrations: {
      dismissHint: 'Devam etmek için dokun',
      goal_complete: {
        title: 'Hedef Tamamlandı!',
        subtitle: 'Günlük hedefini uçurdun',
      },
      new_level: {
        title: 'Seviye Atladın!',
        subtitle: 'Yeni bir seviyeye ulaştın',
      },
      streak_milestone: {
        title: 'Seri Dönüm Noktası!',
        subtitle: 'gün üst üste — inanılmaz!',
      },
      first_break: {
        title: 'İlk Mola!',
        subtitle: 'Sağlık yolculuğun başlıyor',
      },
      achievement: {
        title: 'Başarı Kazandın!',
        subtitle: 'Yeni bir rozet kazandın',
      },
      perfect_week: {
        title: 'Mükemmel Hafta!',
        subtitle: 'Tüm günlük hedefleri tamamladın',
      },
    },
  },

  // ============================================
  // Breaks Screen
  // ============================================
  breaks: {
    title: 'Molalar',
    subtitle: 'İstediğin rahatlama türünü seç, rehberli bir resetle başla.',
    searchPlaceholder: 'Mola ara...',
    featured: 'Öne Çıkan',
    packs: {
      title: 'Reset paketleri',
      subtitle: 'Masa başı ağrısı, yorgunluk ve odak düşüşleri için sonuç odaklı başlangıçlar.',
    },
    featuredCard: {
      startHere: 'BURADAN BAŞLA',
      proStarter: 'PRO BAŞLANGIÇ',
      start: 'Başla',
      unlockPro: "Pro'yu Aç",
      unlockedInPack: 'Bu pakette {{unlocked}}/{{total}} açık',
      description: '{{packDescription}} Hızlı bir {{duration}} rehberli reset için {{breakTitle}} ile başla.',
    },
    noResults: {
      title: 'Mola bulunamadı',
      subtitle: 'Aramanı veya filtreleri değiştirmeyi dene',
      clear: 'Filtreleri Temizle',
    },
    upsell: {
      title: 'Tüm {{pack}} kütüphanesini aç',
      subtitle: 'Şu anda {{starterCount}} başlangıç seansın var. Pro, daha derin {{packLabel}} reset seçenekleri dahil {{lockedCount}} rehberli mola daha açar.',
      cta: "Pro Kütüphaneyi Gör",
    },
    categories: {
      all: 'Tümü',
      quick: 'Hızlı',
      stretch: 'Esneme',
      mindful: 'Farkındalık',
      active: 'Aktif',
    },
    duration: {
      short: '1-2 dk',
      medium: '3-5 dk',
      long: '5+ dk',
    },
    filters: {
      duration: 'Süre',
      category: 'Kategori',
      favorites: 'Favoriler',
    },
    empty: {
      search: '"{{query}}" için mola bulunamadı',
      filter: 'Filtrelerinize uyan mola yok',
      favorites: 'Henüz favori mola yok',
    },
    card: {
      duration: '{{minutes}} dk',
      steps: '{{count}} adım',
      steps_plural: '{{count}} adım',
    },
  },

  // ============================================
  // Break Session
  // ============================================
  breakSession: {
    preparation: {
      title: 'Hazır Ol',
      subtitle: 'Rahat bir pozisyon bul',
      starting: '{{seconds}} saniye içinde başlıyor...',
      disclaimer: 'Ağrı hissederseniz durun. Tıbbi endişeler için bir uzmana danışın.',
    },
    controls: {
      pause: 'Duraklat',
      resume: 'Devam',
      skip: 'Atla',
      end: 'Oturumu Bitir',
    },
    progress: {
      step: 'Adım {{current}} / {{total}}',
      timeRemaining: '{{seconds}} saniye kaldı',
    },
    completion: {
      title: 'Harika iş!',
      subtitle: 'Molayı tamamladınız',
      xpEarned: '+{{xp}} XP',
      streakMaintained: 'Seri devam ediyor!',
      newAchievement: 'Yeni başarı açıldı!',
      stats: {
        duration: 'Süre',
        steps: 'Tamamlanan adımlar',
        calories: 'Tahmini kalori',
      },
    },
    feedback: {
      title: 'Bu mola nasıldı?',
      subtitle: 'Geri bildiriminiz geliştirmemize yardımcı olur',
      thankYou: 'Teşekkürler!',
      heading: 'Nasıl hissettin?',
      reliefHeading: 'Şimdi ne kadar iyi hissediyorsun?',
      ratings: {
        1: 'Kötü',
        2: 'Orta',
        3: 'İyi',
        4: 'Çok İyi',
        5: 'Mükemmel',
      },
      buttons: {
        good: 'Faydalı',
        neutral: 'İdare eder',
        bad: 'Faydasız',
      },
      relief: {
        worse: 'Daha kötü',
        same: 'Aynı',
        better: 'Daha iyi',
        muchBetter: 'Çok daha iyi',
      },
    },
    confirmEnd: {
      title: 'Oturumu Bitir?',
      message: 'Bu mola oturumunu bitirmek istediğinize emin misiniz?',
    },
  },

  // ============================================
  // Exercises
  // ============================================
  exercises: {
    // Quick Breaks
    eyeRest: {
      title: 'Göz Dinlendirme',
      description: 'Gözlerinize ekrandan bir mola verin',
    },
    deepBreathing: {
      title: 'Derin Nefes',
      description: 'Nefes egzersizleriyle zihninizi sakinleştirin',
    },
    neckRolls: {
      title: 'Boyun Çevirme',
      description: 'Boynunuzdaki gerginliği azaltın',
    },
    wristStretch: {
      title: 'Bilek Esneme',
      description: 'Yazmaktan kaynaklanan zorlanmayı önleyin',
    },

    // Stretching
    upperBodyStretch: {
      title: 'Üst Vücut Esneme',
      description: 'Tam üst vücut esneme rutini',
    },
    lowerBodyStretch: {
      title: 'Alt Vücut Esneme',
      description: 'Bacaklarınızı ve belinizi esnetin',
    },
    fullBodyStretch: {
      title: 'Tam Vücut Esneme',
      description: 'Kapsamlı esneme oturumu',
    },
    shoulderRelease: {
      title: 'Omuz Gevşetme',
      description: 'Omuz gerginliğini azaltın',
    },

    // Mindful
    miniMeditation: {
      title: 'Mini Meditasyon',
      description: 'Hızlı farkındalık oturumu',
    },
    bodyScan: {
      title: 'Vücut Taraması',
      description: 'Bilinçli vücut farkındalığı',
    },
    gratitude: {
      title: 'Şükran Anı',
      description: 'Minnettar olduğunuz şeyleri düşünün',
    },
    breathAwareness: {
      title: 'Nefes Farkındalığı',
      description: 'Nefesinize odaklanın',
    },

    // Active
    quickWalk: {
      title: 'Kısa Yürüyüş',
      description: 'Kısa bir yürüyüşle hareket edin',
    },
    deskExercises: {
      title: 'Masa Başı Egzersizleri',
      description: 'Masanızda yapabileceğiniz egzersizler',
    },
    energizer: {
      title: 'Enerji Artırıcı',
      description: 'Hareketle enerjinizi artırın',
    },
    jumpingJacks: {
      title: 'Jumping Jacks',
      description: 'Hızlı kardiyo patlaması',
    },

    // Featured
    afternoonReset: {
      title: 'Öğleden Sonra Yenileme',
      description: 'Mükemmel gün ortası tazeleyici',
    },
  },

  // ============================================
  // Movement Library
  // ============================================
  library: {
    title: 'Hareket Kütüphanesi',
    subtitle: 'Animasyonlu {{count}} masa dostu hareket',
    searchPlaceholder: 'Hareket veya kas ara...',
    allZones: 'Tümü',
    resultCount_one: '{{count}} hareket',
    resultCount_other: '{{count}} hareket',
    empty: {
      title: 'Hareket bulunamadı',
      subtitle: 'Farklı bir arama veya filtre deneyin',
      clear: 'Filtreleri temizle',
    },
    zones: {
      neck: 'Boyun ve Omuz',
      back: 'Sırt ve Omurga',
      chest: 'Göğüs',
      arms: 'Kol ve Bilek',
      core: 'Merkez (Core)',
      legs: 'Kalça ve Bacak',
      cardio: 'Kardiyo',
    },
    positions: {
      all: 'Her yer',
      desk: 'Masada',
      standing: 'Ayakta',
      floor: 'Yerde',
    },
    kinds: {
      stretch: 'Esneme',
      mobility: 'Mobilite',
      strength: 'Güç',
      cardio: 'Kardiyo',
    },
    difficulty: {
      '1': 'Hafif',
      '2': 'Orta',
      '3': 'Zorlayıcı',
    },
    detail: {
      startSession: 'Rehberli seansı başlat',
      unlockWithPro: 'Pro ile aç',
      howTo: 'Nasıl yapılır',
      muscles: 'Çalışan kaslar',
      primaryMuscle: 'Birincil',
      secondaryMuscles: 'Ayrıca çalışır',
      aboutDuration: '~{{minutes}} dk rehberli',
      safety: 'Rahat bir aralıkta hareket edin; ağrı hissederseniz durun.',
      attribution: 'Demo medya © Gym visual — gymvisual.com',
      notFound: 'Bu hareket artık mevcut değil.',
      lockedPreviewBadge: 'Animasyon Pro ile',
      moreStepsWithPro_one: 'Pro ile +{{count}} adım daha',
      moreStepsWithPro_other: 'Pro ile +{{count}} adım daha',
    },
    session: {
      followAlong: 'Animasyonu takip et',
      formTip: 'Animasyonun temposuna eşlik et',
    },
    today: {
      title: 'Bugünün planı',
      subtitle: 'Odak bölgelerine göre seçilmiş üç hareket',
    },
    circuits: {
      title: 'Bölge devreleri',
      subtitle: 'Art arda rehberli 3 hareket',
      duration: '~{{minutes}} dk',
    },
    favoritesFilter: 'Favoriler',
    favoritesEmpty: 'Henüz favori hareket yok — herhangi bir hareketteki kalbe dokun.',
    routines: {
      title: 'Rutinlerim',
      subtitle: 'Kendi hareket kombinasyonların, art arda oynatılır',
      newRoutine: 'Yeni rutin',
      createTitle: 'Yeni rutin',
      editTitle: 'Rutini düzenle',
      namePlaceholder: 'Rutin adı (örn. Sabah resetim)',
      selectedTitle: 'Bu rutindeki hareketler',
      pickerTitle: 'Hareket ekle',
      moveCount_one: '{{count}} hareket',
      moveCount_other: '{{count}} hareket',
      limitHint: '{{min}}–{{max}} hareket seç',
      save: 'Rutini kaydet',
      delete: 'Rutini sil',
      deleteConfirmTitle: 'Rutin silinsin mi?',
      deleteConfirmMessage: 'Bu işlem geri alınamaz.',
      proTeaserTitle: 'Kendi rutinlerini oluştur',
      proTeaserSubtitle: '2–8 hareketi kişisel bir seansa dönüştür',
      empty: 'Henüz rutin yok — ilkini oluştur',
      moveUp: 'Yukarı taşı',
      moveDown: 'Aşağı taşı',
      remove: 'Çıkar',
      notFound: 'Bu rutin artık mevcut değil.',
    },
    nextMove: {
      title: 'İvmeyi koru',
      subtitle: 'Bu bölgede sıradaki',
      start: 'Sıradaki harekete geç',
    },
    entry: {
      title: 'Hareket Kütüphanesi',
      subtitle: 'Animasyonlu {{count}} masa dostu egzersiz',
      badge: 'YENİ',
    },
    upsell: {
      title: 'Tüm {{count}} hareketi aç',
      subtitle: 'Başlangıç hareketleri ücretsiz — Pro, animasyonlu kütüphanenin tamamını açar.',
      cta: "Pro'yu Gör",
    },
  },

  // ============================================
  // Stats Screen
  // ============================================
  stats: {
    title: 'İlerlemeniz',
    subtitle: 'Sağlık yolculuğunuzu takip edin',
    periods: {
      today: 'Bugün',
      week: 'Bu Hafta',
      month: 'Bu Ay',
      all: 'Tüm Zamanlar',
    },
    metrics: {
      totalBreaks: 'Toplam Mola',
      totalTime: 'Toplam Süre',
      currentStreak: 'Mevcut Seri',
      longestStreak: 'En Uzun Seri',
      averageDaily: 'Günlük Ortalama',
      favoriteCategory: 'Favori Kategori',
    },
    charts: {
      weeklyBreaks: 'Haftalık Molalar',
      categoryBreakdown: 'Kategori Dağılımı',
      timeOfDay: 'Gün İçinde Zaman',
    },
    achievements: {
      title: 'Başarılar',
      unlocked: '{{count}} açıldı',
      progress: '{{current}}/{{total}}',
      viewAll: 'Tüm Başarıları Gör',
    },
    empty: {
      title: 'Henüz veri yok',
      subtitle: 'İstatistiklerinizi görmek için molalar tamamlayın',
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
    memberSince: '{{date}} tarihinden beri üye',
    sections: {
      account: 'Hesap',
      preferences: 'Tercihler',
      notifications: 'Bildirimler',
      about: 'Hakkında',
    },
    items: {
      editProfile: 'Profili Düzenle',
      goals: 'Hedefler',
      notifications: 'Bildirim Ayarları',
      theme: 'Tema',
      sound: 'Ses Efektleri',
      haptics: 'Dokunsal Geri Bildirim',
      voiceGuidance: 'Sesli Rehberlik',
      language: 'Dil',
      privacy: 'Gizlilik',
      help: 'Yardım ve Destek',
      about: 'Unwind Hakkında',
      rateApp: 'Uygulamayı Değerlendir',
      shareApp: 'Arkadaşlarınla Paylaş',
      signOut: 'Çıkış Yap',
    },
    signOutConfirm: {
      title: 'Çıkış Yap',
      message: 'Çıkış yapmak istediğinize emin misiniz? İlerlemeniz kaydedilecektir.',
    },
  },

  // ============================================
  // Settings
  // ============================================
  settings: {
    theme: {
      title: 'Tema',
      dark: 'Karanlık',
      light: 'Aydınlık',
      system: 'Sistem',
    },
    notifications: {
      title: 'Bildirimler',
      enabled: 'Bildirimleri Etkinleştir',
      breakReminders: 'Mola Hatırlatıcıları',
      reminderInterval: 'Hatırlatıcı Aralığı',
      streakAlerts: 'Seri Uyarıları',
      goalNotifications: 'Hedef Bildirimleri',
      quietHours: 'Sessiz Saatler',
      quietHoursTime: '{{start}} - {{end}}',
      workDaysOnly: 'Sadece İş Günleri',
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
      crashReporting: 'Çökme Raporlama',
    },
    goals: {
      title: 'Hedefler',
      weekly: 'Haftalık Hedef',
      daily: 'Günlük Hedef',
      breaksPerWeek: '{{count}} mola/hafta',
      breaksPerDay: '{{count}} mola/gün',
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
      title: "Unwind'e Hoş Geldiniz",
      subtitle: 'Daha sağlıklı bir iş günü için sağlık arkadaşınız',
      action: 'Başlayalım',
    },
    benefits: {
      title: 'Neden Unwind?',
      items: {
        eyes: 'Göz yorgunluğunu azalt',
        posture: 'Duruşu iyileştir',
        focus: 'Odaklanmayı artır',
        energy: 'Enerjiyi artır',
      },
    },
    personalization: {
      title: 'Kişiselleştirelim',
      subtitle: 'İhtiyaçlarınızı anlamamıza yardımcı olun',
      workRole: {
        question: 'İşinizi en iyi ne tanımlar?',
        options: {
          developer: 'Geliştirici',
          designer: 'Tasarımcı',
          writer: 'Yazar',
          manager: 'Yönetici',
          student: 'Öğrenci',
          other: 'Diğer',
        },
      },
      screenTime: {
        question: 'Ekran başında kaç saat geçiriyorsunuz?',
        options: {
          low: '4 saatten az',
          medium: '4-8 saat',
          high: '8 saatten fazla',
        },
      },
      painAreas: {
        question: 'Herhangi bir rahatsızlık yaşıyor musunuz?',
        options: {
          eyes: 'Göz yorgunluğu',
          neck: 'Boyun ağrısı',
          back: 'Sırt ağrısı',
          wrists: 'Bilek ağrısı',
          shoulders: 'Omuz gerginliği',
          none: 'Hiçbiri',
        },
      },
    },
    notifications: {
      title: 'Yolda kalın',
      subtitle: 'Hiçbir molayı kaçırmamak için bildirimleri etkinleştirin',
      enable: 'Bildirimleri Etkinleştir',
      later: 'Daha Sonra',
    },
    complete: {
      title: 'Hazırsınız!',
      subtitle: 'İlk molanızı birlikte alalım',
      action: 'İlk Molayı Başlat',
    },
  },

  // ============================================
  // Achievements
  // ============================================
  achievements: {
    title: 'Başarılar',
    subtitle: 'Kilometre taşlarınızı kutlayın',
    categories: {
      breaks: 'Molalar',
      streaks: 'Seriler',
      time: 'Zaman',
      exploration: 'Keşif',
      special: 'Özel',
    },
    items: {
      firstStep: {
        title: 'İlk Adım',
        description: 'İlk molanızı tamamlayın',
      },
      gettingStarted: {
        title: 'Başlangıç',
        description: '10 mola tamamlayın',
      },
      committed: {
        title: 'Kararlı',
        description: '50 mola tamamlayın',
      },
      centurion: {
        title: 'Yüzbaşı',
        description: '100 mola tamamlayın',
      },
      breakMaster: {
        title: 'Mola Ustası',
        description: '500 mola tamamlayın',
      },
      streak3: {
        title: 'İvmeleniyor',
        description: '3 günlük seri tutun',
      },
      streak7: {
        title: 'Hafta Savaşçısı',
        description: '7 günlük seri tutun',
      },
      streak14: {
        title: 'On Dört Gün',
        description: '14 günlük seri tutun',
      },
      streak30: {
        title: 'Aylık Usta',
        description: '30 günlük seri tutun',
      },
      streak100: {
        title: 'Durdurulamaz',
        description: '100 günlük seri tutun',
      },
      hour1: {
        title: 'İyi Harcanmış Zaman',
        description: '1 saatlik mola biriktirin',
      },
      hour5: {
        title: 'Adanmış',
        description: '5 saatlik mola biriktirin',
      },
      hour10: {
        title: 'Sağlık Savaşçısı',
        description: '10 saatlik mola biriktirin',
      },
    },
    locked: 'Kilitli',
    unlocked: 'Açıldı',
    unlockedAt: '{{date}} tarihinde açıldı',
    reward: '+{{xp}} XP',
  },

  // ============================================
  // Notifications
  // ============================================
  notifications: {
    title: 'Bildirimler',
    empty: 'Henüz bildirim yok',
    markAllRead: 'Tümünü Okundu İşaretle',
    types: {
      breakReminder: 'Mola Hatırlatıcı',
      streakAlert: 'Seri Uyarısı',
      achievementUnlocked: 'Başarı Açıldı',
      goalComplete: 'Hedef Tamamlandı',
      levelUp: 'Seviye Atladı',
      general: 'Genel',
    },
    messages: {
      breakReminder: 'Mola zamanı! Gözleriniz ve vücudunuz size teşekkür edecek.',
      streakWarning: '{{count}} günlük serinizi kaybetmeyin! Bugün bir mola alın.',
      goalComplete: 'Günlük hedefinize ulaştınız! Harika iş!',
      levelUp: 'Tebrikler! {{level}}. seviyeye ulaştınız!',
      achievementUnlocked: 'Açılan başarı: {{achievement}}',
    },
    dailyGoal: {
      titleSingular: '{{count}} mola daha! 🎯',
      titlePlural: '{{count}} mola daha! 🎯',
      body: 'Günlük hedefe %{{percent}} kaldı. Devam et!',
    },
    weeklyStory: {
      title: 'Bu haftaki odağın 📊',
      body: 'Hangi molalar sana iyi geldi gör; gelecek haftaya hangisini taşımak istediğini seçebilirsin.',
    },
    adaptive: {
      streakAtRisk: {
        title: '{{streak}} günlük seriyi koru 🔥',
        body: 'Tek bir kısa mola yeter. 60 saniye bile iş görür.',
      },
      firstBreak: {
        title: 'İlk molan 🌱',
        body: 'Baskı yok — bir dakika fazlasıyla yeterli. Yol gösteririm.',
      },
      almostDone: {
        title: 'Bir tane daha 🎯',
        body: 'Günlük hedefine bir mola kaldı — son sprintle bitir.',
      },
      pain: {
        eyes:       { title: '20-20-20 zamanı 👁️',     body: '6 metre uzaktaki bir noktaya 20 saniye bak.' },
        neck:       { title: 'Boynu sıfırla 🧘',          body: '30 saniye yavaş çene çekme — anlık rahatlama.' },
        shoulders:  { title: 'Omuzları çevir 🤸',         body: 'Beş geri, beş ileri. Gerginlik gitti.' },
        upper_back: { title: 'Dik dur 💪',                body: 'Göğsünü aç, geniş nefes al, ona kadar sayıp bırak.' },
        lower_back: { title: 'Sandalyede kedi-inek 🐈',   body: 'Belini beş kez kavislendirip yuvarla.' },
        wrists:     { title: 'Bilek çevirme 🤲',          body: 'Her yöne on tur — klavyeden gelen yorgunluğa iyi geliyor.' },
      },
      tone: {
        energetic: {
          '0': { title: 'Sabahı sıfırla 🌅',          body: 'Omuzları çevir, günün tonunu belirle.' },
          '1': { title: 'Bedenini uyandır ☀️',        body: '60 saniye hareket, hazırsın.' },
          '2': { title: 'Güçlü başla 💪',             body: 'Şimdi yapılan küçük germe tüm güne yayılır.' },
        },
        focused: {
          '0': { title: 'Derin iş öncesi mini reset 🎯', body: 'Kafanı temizle — bir dakika, sonra geri dön.' },
          '1': { title: 'Odak yenileme 🧘',              body: 'Bakışını yumuşat, omuzları indir, üç nefes al.' },
          '2': { title: 'Küçük mola, büyük geri dönüş ⏱️', body: 'Şimdi durakla, sonraki saati keskin tut.' },
        },
        recover: {
          '0': { title: 'Öğle sonrası reset 🌿',    body: 'Ayağa kalk, uzanarak gerin, çökmüşlüğe karşı koy.' },
          '1': { title: 'Öğleden sonra toparlanma 🍃', body: 'Kısa bir mola, saat üçteki çöküşe karşı.' },
          '2': { title: 'Bırak gitsin 🤸',            body: 'Gerginlik sessizce birikir — şimdi gevşet.' },
        },
        calm: {
          '0': { title: 'Yavaşla 🪷',           body: 'Nefesin yavaşlasın, çenen yumuşasın, biraz bırak.' },
          '1': { title: 'Akşamı sıfırla 🌙',    body: 'Çalışma modundan çıkış için nazik bir mola.' },
          '2': { title: 'Sakinleş 🌅',          body: 'Yavaşça nefes al. Gün güzel kapanıyor.' },
        },
        gentle: {
          '0': { title: 'Kolay olsun 🌌',   body: 'Hafif bir germe ve yavaş bir nefes — bu kadarı yeterli.' },
          '1': { title: 'Tek nefes 🤍',     body: 'Hedef yok, metrik yok. Sadece tek bir tam nefes.' },
          '2': { title: 'Dinlenme modu 🌒', body: 'Hazır olduğun zaman. Hiç acele yok.' },
        },
      },
    },
  },

  // ============================================
  // Errors
  // ============================================
  errors: {
    generic: 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.',
    network: 'Bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
    storage: 'Veri kaydedilemedi. Lütfen tekrar deneyin.',
    notificationPermission: 'Lütfen ayarlardan bildirimleri etkinleştirin.',
    somethingWentWrong: 'Bir şeyler yanlış gitti',
    tryAgain: 'Lütfen tekrar deneyin',
    contactSupport: 'Sorun devam ederse lütfen destekle iletişime geçin.',
  },

  // ============================================
  // Time & Dates
  // ============================================
  time: {
    justNow: 'Az önce',
    minutesAgo: '{{count}} dakika önce',
    minutesAgo_plural: '{{count}} dakika önce',
    hoursAgo: '{{count}} saat önce',
    hoursAgo_plural: '{{count}} saat önce',
    daysAgo: '{{count}} gün önce',
    daysAgo_plural: '{{count}} gün önce',
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
  // ============================================
  // Timer / Pomodoro
  // ============================================
  timer: {
    title: 'Odak Zamanlayıcı',
    presets: {
      pomodoro: 'Pomodoro',
      deepWork: 'Derin Çalışma',
      microSession: 'Mikro Oturum',
      custom: 'Özel',
    },
    phases: {
      work: 'Odak',
      break: 'Mola',
      longBreak: 'Uzun Mola',
    },
    controls: {
      start: 'Odaklanmaya Başla',
      pause: 'Duraklat',
      resume: 'Devam Et',
      skip: 'Atla',
      reset: 'Sıfırla',
    },
    session: 'Oturum #{{number}}',
    completed: 'Faz tamamlandı!',
    workComplete: 'Odak oturumu tamamlandı! Mola zamanı.',
    breakComplete: 'Mola bitti! Odaklanmaya hazır mısın?',
    stats: {
      todayFocus: 'Bugünün Odağı',
      totalFocus: 'Toplam Odak',
      sessionsToday: 'Bugünün Oturumları',
    },
    settings: {
      autoStartBreak: 'Molayı Otomatik Başlat',
      autoStartWork: 'Çalışmayı Otomatik Başlat',
      sound: 'Zamanlayıcı Sesi',
      vibration: 'Zamanlayıcı Titreşimi',
    },
    presetPicker: {
      title: 'Odak Ön Ayarı',
      subtitle: 'Çalışma ritminizi seçin',
    },
    pushNotifications: {
      workCompleteTitle: 'Odak seansı tamamlandı!',
      workCompleteBody: 'Mola zamanı!',
      breakCompleteTitle: 'Mola bitti!',
      breakCompleteBody: 'Odaklanmaya hazır mısın?',
    },
  },

  // ============================================
  // GDPR / Data Privacy
  // ============================================
  gdpr: {
    downloadData: 'Verilerimi İndir',
    deleteAccount: 'Hesabı Sil',
    deleteConfirm: {
      title: 'Hesabı Sil',
      message: 'Bu işlem tüm verilerinizi kalıcı olarak silecek ve geri alınamaz. Emin misiniz?',
      confirm: 'Sil',
    },
    exportFailed: 'Verileriniz dışarı aktarılamadı. Lütfen tekrar deneyin.',
    deleteFailed: 'Hesap silinemedi. Lütfen tekrar deneyin.',
    sectionTitle: 'VERİ VE GİZLİLİK',
  },

  // ============================================
  // Legal
  // ============================================
  legal: {
    privacyPolicy: 'Gizlilik Politikası',
    termsOfService: 'Kullanım Koşulları',
  },
} as const;
