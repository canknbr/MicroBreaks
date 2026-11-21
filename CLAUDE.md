# Unwind (MicroBreaks) — Claude çalışma talimatı

## BAĞLAYICI KURAL: `docs/playbook/` rehberleri

Bu projedeki her iş `docs/playbook/` altındaki rehberlere **katı şekilde bağlıdır**.
Bunlar öneri değil, çalışma sözleşmesidir.

1. Bir işe başlamadan önce aşağıdaki tablodan ilgili rehberi bul ve **ilgili bölümünü baştan sona oku**. Hafızadan uygulama.
2. Rehber bir sıra, kapı ya da yasak koyuyorsa ona uy; atlama, kısaltma, "bu sefer gerek yok" deme.
3. Rehber ile repodaki başka bir doküman (`docs/LAUNCH-CHECKLIST.md`, `docs/MRR_EXECUTION_BACKLOG.md`, `.claude/agents/*` vb.) çelişirse **rehber kazanır**; çelişkiyi kullanıcıya bildir.
4. Rehberden sapmak gerekiyorsa (ör. rehber başka bir yığını varsayıyor) sapmayı ve nedenini açıkça yaz, onay al.
5. Rehberler kullanıcının kendi dosyalarıdır; değiştirme. Orijinalleri `~/Desktop` altında durur; masaüstündeki sürüm güncellenirse buraya yeniden kopyala.

## Hangi iş → hangi rehber

| İş | Rehber |
|---|---|
| App Store inceleme uyumluluğu, ret çözümü (Mod A/B/C) | `docs/playbook/APP_STORE_REVIEW_AUDIT.md` (skill olarak da kurulu: `app-store-review-audit`) |
| App Store'a çıkış adımları (ASC kaydı → Submit) | `docs/playbook/APP_STORE_YAYIN_REHBERI.md` |
| "Hazır mı / hata var mı" kontrolü, build öncesi | `docs/playbook/YAYIN_ONCESI_KONTROL_REHBERI.md` |
| Kod denetimi / güvenlik / kalite turu | `docs/playbook/20-audit-promptu.md` (20. tur her zaman en son) |
| Fikir doğrulama, MVP, ASO, ilk paywall, ilk kullanıcılar (0 → 1K MRR) | `docs/playbook/0-1k-mrr-rehberi-ve-prompt-listesi.md` |
| Ölçekleme: analitik, ücretli kanal, kreatif, test, yeni pazar (10K → 100K MRR) | `docs/playbook/10k-100k-mrr-rehberi-ve-prompt-listesi.md` |
| Onboarding/trial, paywall, fiyat, retention, churn, win-back, iade, benchmark | `docs/playbook/abonelik-uygulamasi-rehberi-ve-prompt-listesi.md` |
| TikTok / Reels / Shorts içerik üretimi ve günlük paylaşım düzeni | `docs/playbook/SOSYAL-MEDYA-REHBERI.md` |

Mevcut aşama: lansman öncesi / 0 → 1K MRR. Ölçekleme rehberi ancak onun önkoşulları (çalışan mağaza sayfası, kanıtlanmış paywall, ilk ödeyenler) sağlandığında devreye girer.

## Her zaman geçerli kurallar (rehberlerden)

**Yayın ve kontrol**
- "Hazır" ya da "hata yok" dediğinde hangi soruya cevap verdiğini belirt: *çalışıyor mu* (tip/test/kod incelemesi) ve *mantıklı mı* (ilk kullanıcı turu). Yalnızca birincisi yapıldıysa kontrol yarımdır.
- Kontrol sırası: A otomatik kapılar → B kod incelemesi → C ilk kullanıcı turu → D kullanıcının kendi turu → E yalnızca gerçek cihazda denenebilenler. Build, kullanıcı "tamam" demeden alınmaz.
- Bulgular "engelleyici / düzeltilmeli / küçük" diye sıralanır; her biri "şu girdi → şu yanlış sonuç" senaryosu taşır. Küçük bulgular "engellemiyor" diye bırakılmaz.
- `YAYIN_ONCESI_KONTROL_REHBERI.md` Bölüm 4'teki 14 ilkeye aykırı her şey bulgudur.
- Doğrulanan ile doğrulanamayan her zaman ayrı yazılır. "Kesin geçer" denmez; "bilinen ret sebepleri giderildi" denir.

**App Review denetimi**
- Önce keşif, sonra değişiklik. Ayrı dalda, modül bazında küçük commit'lerle çalış.
- İş modeli, fiyat, giriş yöntemi, özellik/SDK kaldırma, ad/ikon/marka, hukuki metin → `[KARAR]`: seçenek sun, onay bekle.
- Uydurma yok: URL, e-posta, şirket bilgisi, demo hesap, anahtar. Gerekirse `TODO(appstore): …` koy ve raporda 🔴 listele.
- İnceleme sürecini kandıran hiçbir kod yok (inceleme tespiti, gizli özellik, uzaktan davranış değişimi).
- Kullanıcıyla Türkçe; Apple'a giden metinler (Review Notes, Resolution Center) İngilizce.

**Mağaza süreci**
- Tek adım; defter tut (⬜ → ✅); dışa dönük her otomasyondan önce dry-run; her adımı küçük commit'le kapat.
- Gizli değerler (anahtar, şifre, token) sohbete yazılmaz; yazıldıysa yenilenmesi söylenir.
- `APP_STORE_YAYIN_REHBERI.md` "Yapma listesi" maddeleri mutlak yasaktır.

**Ürün ve büyüme**
- Her adımda "en az" ne gerekiyorsa o; fazla özellik önerme. Tek acı noktası, tek özellik, tek mesaj.
- Paywall'ı geciktirme. Büyüme kararları birim ekonomisine bağlanır (LTV ≥ 2× CAC).
- Bir sorunu çöz, sonra diğerine geç; bölüm atlama. Testler tek değişkenli.
- Sosyal medyada: uygulamanın yapmadığını ya da ölçülemeyeni söyleme; videoyu karelerine bakmadan teslim etme; günlükte olmayanı varsayma, sor.

**Kod denetimi**
- 20 denetim turunun bulguları son turda (Verification & False-Positive Filter) CONFIRMED / UNVERIFIED / REJECTED olarak süzülmeden rapor edilmez.
