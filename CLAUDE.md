# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (also runs toml:watch)
npm run build        # Build for production (toml:watch → astro build → remove-draft-from-sitemap)
npm run preview      # Build + preview locally
npm run format       # Prettier format src/
npm run astro-check  # TypeScript/Astro type check
```

**Critical:** Always run `npm run build` (not `astro build` directly) — the `toml:watch` script must run first to regenerate `.astro/config.generated.json` from `src/config/config.toml`.

**Windows file deletion:** When deleting files with `[...]` in their names (e.g., `src/pages/[...lang]/services/[single].astro`), PowerShell treats brackets as globs. Use `-LiteralPath`:
```powershell
Remove-Item -LiteralPath "path\to\[...lang]\services\[single].astro" -Force
```

## Configuration Pipeline

`src/config/config.toml` → `scripts/toml-watcher.mjs` → `.astro/config.generated.json`

All runtime config comes from `.astro/config.generated.json`. Never import `config.toml` directly — always import from `.astro/config.generated.json`. After editing `config.toml`, run `npm run toml:watch` (or restart dev server) to regenerate the JSON.

## Import Aliases (tsconfig.json)

```
@/components/*  →  src/layouts/components/*
@/shortcodes/*  →  src/layouts/shortcodes/*
@/helpers/*     →  src/layouts/helpers/*
@/*             →  src/*
```

Note: `@/components/` maps to `src/layouts/components/`, NOT `src/components/`.

## Font Yapılandırması

`src/config/fonts.json` dosyası Google Fonts tanımlarını tutar. Aktif font **Source Sans 3**'tür; Türkçe karakter desteği için `subsets: ["latin", "latin-ext"]` zorunludur. CSS değişkeni `--font-primary` olarak tanımlıdır.

> **Not:** Font değiştirilirken `latin-ext` subset'ini kaldırmayın; Türkçe karakterler (ğ, ş, ı, ö, ü, ç) bozulur.

## i18n Architecture

Desteklenen diller yalnızca **`en`** ve **`tr`**'dir (Fransızca Haziran 2026'da kaldırıldı). `src/config/language.json` dil tanımlarını içerir; üçüncü bir dil eklemek için hem bu dosya hem de içerik dizini ve menu dosyası gerekir.

- `en` (default, no URL prefix) ve `tr` (prefix `/tr/`)
- `src/config/language.json` defines `languageCode` and `contentDir` (`english` / `turkish`)
- `showDefaultLangInUrl: false` — EN routes are at `/path/`, TR routes at `/tr/path/`
- Language-specific content lives in `src/content/{collection}/english/` and `.../turkish/`

### Content Filtering Functions (`src/lib/contentParser.astro`)

- `getCollectionCTM(collectionName, lang)` — returns all entries for a language (filters by `contentDir`, excludes `-index` entries, sorts by `weight`)
- `getEntryCTM(collectionName, subCollectionName, lang)` — returns a single entry by name (e.g., `getEntryCTM("sections", "home-banner-two", "tr")`)

### URL Building (`src/lib/utils/i18nUtils.ts`)

- `getLocaleUrlCTM(url, lang, prependValue?)` — adds `/tr/` prefix when lang is `tr`, no-op for `en`
- `getEntryRouteParam(entry)` — returns `entry.data.customSlug` if set, otherwise the last path segment of `entry.id`
- `getEntrySlugCTM(entry, lang)` — combines the above two; used in cards to build href links

### Dil Değiştirici URL Çevirisi (`src/lib/utils/localizedRouteResolver.ts`)

`getLocalizedPathnameCTM(pathname, sourceLang, targetLang)` fonksiyonu mevcut sayfanın URL'sini hedef dile çevirir. Dil değiştirici (LanguageSwitcher) ve Header navigasyon butonu bunu kullanır.

Çeviri **statik haritalarla** yapılır (content lookup değil):

| Harita | Amacı |
|---|---|
| `pageSlugTranslationMap` | Tek-segment sayfa slug'ları: `contact` → `iletisim`, `gdpr` → `kvkk` vb. |
| `serviceSlugTranslationMap` | Servis `customSlug`'ları: `sap-consultancy/...` → `sap-danismanlik/...` vb. |
| `multiSegmentPageTranslationMap` | Çok-segment sayfalar: `corporate/about` → `kurumsal/hakkimizda` vb. |
| `fixedUrlPages` | Lokale prefix almayan sabit URL'ler: `kvkk` → `/kvkk/` |

**Yeni sayfa veya servis eklendiğinde** bu haritalara karşılıklı giriş yapılmalıdır, aksi hâlde dil değiştirici yanlış URL üretir.

**Header navigasyon butonu:** `config.toml`'daki `[settings.navigationButton].url` değeri Header.astro'da `getLocalizedPathnameCTM` ile lokalize edilerek render edilir — ham URL doğrudan kullanılmaz.

### Sabit URL Sayfalar

`/kvkk/` sayfası `/tr/kvkk/` gibi bir karşılığı olmayan, dil fark etmeksizin tek URL'de sunan özel bir sayfadır. `fixedUrlPages` kaydı ve `src/pages/kvkk/index.astro` dosyası ile uygulanmıştır. Benzer bir sayfa eklenecekse aynı pattern izlenmelidir.

## Routing Architecture

**The project uses a hybrid routing approach** due to EN/TR having different URL slugs (e.g., `/services/sap-consultancy/` vs `/tr/hizmetler/sap-danismanlik/`):

| Route file | Generates |
|---|---|
| `src/pages/[...lang]/index.astro` | `/` (EN) and `/tr/` (TR) |
| `src/pages/[...lang]/services/index.astro` | `/services/` only — returns `{ lang: undefined }` |
| `src/pages/[...lang]/services/[...slug].astro` | `/services/{customSlug}/` for each EN service (lang: undefined) |
| `src/pages/tr/hizmetler/index.astro` | `/tr/hizmetler/` |
| `src/pages/tr/hizmetler/[...slug].astro` | `/tr/hizmetler/{customSlug}/` for each TR service |
| `src/pages/corporate/index.astro` | `/corporate/` |
| `src/pages/corporate/about/index.astro` | `/corporate/about/` |
| `src/pages/corporate/careers/index.astro` | `/corporate/careers/` |
| `src/pages/why-alfa/index.astro` | `/why-alfa/` |
| `src/pages/references/index.astro` | `/references/` |
| `src/pages/gdpr/index.astro` | `/gdpr/` |
| `src/pages/contact/index.astro` | `/contact/` |
| `src/pages/tr/kurumsal/index.astro` | `/tr/kurumsal/` |
| `src/pages/tr/kurumsal/hakkimizda/index.astro` | `/tr/kurumsal/hakkimizda/` |
| `src/pages/tr/kurumsal/insan-kaynaklari/index.astro` | `/tr/kurumsal/insan-kaynaklari/` |
| `src/pages/tr/neden-alfa/index.astro` | `/tr/neden-alfa/` |
| `src/pages/tr/referanslar/index.astro` | `/tr/referanslar/` |
| `src/pages/tr/iletisim/index.astro` | `/tr/iletisim/` |
| `src/pages/kvkk/index.astro` | `/kvkk/` (sabit URL — TR içerik, locale prefix yok) |

**Important routing rule:** Service catch-all routes must use `{ lang: undefined }` in `getStaticPaths` to prevent Astro's i18n system from auto-generating `/tr/services/...` mirror pages. The TR equivalent is handled by the explicit `tr/hizmetler/[...slug].astro` file.

## Content Collections

Defined in `src/content.config.ts`:
- `services` — service pages (`src/content/services/{english,turkish}/`)
- `sections` — homepage/page section content (`src/content/sections/{english,turkish}/`)
- `homepage` — homepage-specific content
- `pages` — standalone page content (`src/content/pages/{english,turkish}/`)

### Service Content & `customSlug`

Services use `customSlug` in frontmatter to define multi-level URL paths:
```yaml
customSlug: "sap-consultancy/sap-is-u-consultancy"
```
This maps to `/services/sap-consultancy/sap-is-u-consultancy/` (EN) or `/tr/hizmetler/sap-danismanlik/sap-is-u-danismanligi/` (TR).

`-index.md` files (e.g., `src/content/services/english/-index.md`) provide metadata for listing pages and are excluded from `getCollectionCTM` results (they're loaded separately via `getEntryCTM`).

## Menu Configuration

- `src/config/menu.en.json` — English menu
- `src/config/menu.tr.json` — Turkish menu

Menu URLs are stored **without** the `/tr/` prefix in `menu.tr.json`. The system automatically prepends `/tr/` when rendering TR pages via `getLocaleUrlCTM`. The contact page is intentionally absent from all menu arrays — it's only accessible via the header button configured in `config.toml` under `[settings.navigationButton]`.

## Section Content Pattern

Homepage sections are data-driven markdown files in `src/content/sections/{lang}/`. Each section component calls `getEntryCTM("sections", "section-name", locale)` to load its content. The `enable: true/false` field in frontmatter controls whether the section renders.

## Contact Form

Form sağlayıcısı **formsubmit.co**'dur. Gönderimler `info@alfayazilim.com` adresine iletilir.

İlgili `config.toml` anahtarları (`[settings]` altında):
- `contactFormAction` — formsubmit.co endpoint URL'i (e-posta adresi içerir)
- `contactFormProvider` — `"formsubmit.co"` | `"formspree"` | `"netlify"`
- `turnstileSiteKey` — Cloudflare Turnstile site key'i (public)

### Cloudflare Turnstile

`src/layouts/components/widgets/ContactForm.astro` bileşenine entegre edilmiştir:

- `turnstileSiteKey` config'den okunur; boşsa widget render edilmez.
- Turnstile JS'i `is:inline` script tag ile `challenges.cloudflare.com/turnstile/v0/api.js`'den yüklenir.
- Submit handler'da `cf-turnstile-response` alanı kontrol edilir; boşsa gönderim engellenir.
- Site key'i güncellemek için yalnızca `config.toml` → `turnstileSiteKey` değerini değiştirip `npm run toml:watch` çalıştırmak yeterlidir.

**Not:** formsubmit.co sunucu tarafı Turnstile doğrulaması yapmaz; doğrulama yalnızca istemci tarafındadır (bot engellemek için yeterlidir).

## Footer Copyright Yılı

`config.toml` ve `src/i18n/{en,tr}.json` dosyalarındaki copyright metninde `{year}` placeholder'ı kullanılabilir. `Footer.astro` bunu runtime'da `new Date().getFullYear()` ile replace eder — sabit yıl yazmak yerine `{year}` kullanılmalıdır.

## Image Optimization

Astro's Sharp integration is configured for WebP output (`format: "webp", quality: 85` in `astro.config.mjs`). The `OptimizedImage` component (`src/layouts/components/utilities/OptimizedImage.astro`) wraps Astro's `<Image>` component. LCP images should have `loading="eager"` and `fetchpriority="high"`.
