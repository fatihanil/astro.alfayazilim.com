# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (also runs toml:watch)
npm run build        # Build for production (toml:watch → astro build → remove-draft-from-sitemap)
npm run preview      # Build + preview locally
npm run format       # Prettier format src/
npm run astro-check  # TypeScript/Astro type check
npm run deploy:cf    # Deploy to Cloudflare Pages via wrangler
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

## Font Configuration

`src/config/fonts.json` holds Google Fonts definitions. Active font is **Source Sans 3**; `subsets: ["latin", "latin-ext"]` is required for Turkish character support. CSS variable is `--font-primary`.

> **Note:** Never remove `latin-ext` when changing fonts — Turkish characters (ğ, ş, ı, ö, ü, ç) will break.

## i18n Architecture

Supported languages are **`en`** and **`tr`** only (French was removed in June 2026). `src/config/language.json` defines language entries; adding a third language requires that file, a new content directory, and a new menu file.

- `en` (default, no URL prefix) and `tr` (prefix `/tr/`)
- `src/config/language.json` defines `languageCode` and `contentDir` (`english` / `turkish`)
- `showDefaultLangInUrl: false` — EN routes are at `/path/`, TR routes at `/tr/path/`
- Language-specific content lives in `src/content/{collection}/english/` and `.../turkish/`

### UI Strings (`src/i18n/{lang}.json`)

Button labels, page headings, and other UI text are stored in `src/i18n/en.json` and `src/i18n/tr.json`. Access them via `useTranslations(lang)` from `src/lib/utils/i18nUtils.ts`:

```ts
const t = await useTranslations(locale);
t("services.readMore"); // returns the translated string
```

`useTranslations` merges `menu.{lang}.json` + `i18n/{lang}.json` into one translation function with dot-notation key access.

### Content Filtering Functions (`src/lib/contentParser.astro`)

- `getCollectionCTM(collectionName, lang)` — returns all entries for a language (filters by `contentDir`, excludes `-index` entries, sorts by `weight`). **Filters `draft: true` entries in production builds.**
- `getEntryCTM(collectionName, subCollectionName, lang)` — returns a single entry by name (e.g., `getEntryCTM("sections", "home-banner-two", "tr")`)

### URL Building (`src/lib/utils/i18nUtils.ts`)

- `getLocaleUrlCTM(url, lang, prependValue?)` — adds `/tr/` prefix when lang is `tr`, no-op for `en`
- `getEntryRouteParam(entry)` — returns `entry.data.customSlug` if set, otherwise the last path segment of `entry.id`
- `getEntrySlugCTM(entry, lang)` — combines the above two; used in cards to build href links

### Language Switcher URL Translation (`src/lib/utils/localizedRouteResolver.ts`)

`getLocalizedPathnameCTM(pathname, sourceLang, targetLang)` translates the current page's URL to the target language. Used by LanguageSwitcher and the Header navigation button.

Translation uses **static maps** (not content lookups):

| Map | Purpose |
|---|---|
| `pageSlugTranslationMap` | Single-segment page slugs: `contact` → `iletisim`, `gdpr` → `kvkk`, etc. |
| `serviceSlugTranslationMap` | Service `customSlug`s: `sap-consultancy/...` → `sap-danismanlik/...`, etc. |
| `multiSegmentPageTranslationMap` | Multi-segment pages: `corporate/about` → `kurumsal/hakkimizda`, etc. |
| `fixedUrlPages` | Pages without locale prefix: `kvkk` → `/kvkk/` |

**When adding a new page or service**, add matching entries to these maps — otherwise the language switcher will produce incorrect URLs.

**Header navigation button:** The `[settings.navigationButton].url` value in `config.toml` is localized via `getLocalizedPathnameCTM` in Header.astro — the raw URL is never rendered directly.

### Fixed-URL Pages

`/kvkk/` is served at a single URL regardless of locale (no `/tr/` equivalent). Implemented with a `fixedUrlPages` entry and `src/pages/kvkk/index.astro`. Follow the same pattern for similar pages.

## Routing Architecture

**The project uses a hybrid routing approach** due to EN/TR having different URL slugs (e.g., `/services/sap-consultancy/` vs `/tr/hizmetler/sap-danismanlik/`):

| Route file | Generates |
|---|---|
| `src/pages/[...lang]/index.astro` | `/` (EN) and `/tr/` (TR) |
| `src/pages/[...lang]/services/index.astro` | `/services/` only — returns `{ lang: undefined }` |
| `src/pages/[...lang]/services/[...slug].astro` | `/services/{customSlug}/` for each EN service (lang: undefined); **handles `isCategory`** |
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
| `src/pages/kvkk/index.astro` | `/kvkk/` (fixed URL — TR content, no locale prefix) |
| `src/pages/404.astro` | 404 error page |

> **Note:** `src/pages/services/[...slug].astro` is a legacy duplicate of the `[...lang]` version and lacks `isCategory` support. The canonical EN service detail route is `src/pages/[...lang]/services/[...slug].astro`.

**Important routing rule:** Service catch-all routes must use `{ lang: undefined }` in `getStaticPaths` to prevent Astro's i18n system from auto-generating `/tr/services/...` mirror pages. The TR equivalent is handled by the explicit `tr/hizmetler/[...slug].astro` file.

## Content Collections

Defined in `src/content.config.ts`:
- `services` — service pages (`src/content/services/{english,turkish}/`)
- `sections` — homepage/page section content (`src/content/sections/{english,turkish}/`)
- `homepage` — homepage-specific content
- `pages` — standalone page content (`src/content/pages/{english,turkish}/`)

Schema types live in `src/sections.schema.ts` (for sections/page fields) and `src/content.config.ts` (collection definitions including service-specific fields like `isCategory`, `childSlugs`).

### Service Content & `customSlug`

Services use `customSlug` in frontmatter to define multi-level URL paths:
```yaml
customSlug: "sap-consultancy/sap-is-u-consultancy"
```
This maps to `/services/sap-consultancy/sap-is-u-consultancy/` (EN) or `/tr/hizmetler/sap-danismanlik/sap-is-u-danismanligi/` (TR).

`-index.md` files (e.g., `src/content/services/english/-index.md`) provide metadata for listing pages and are excluded from `getCollectionCTM` results (loaded separately via `getEntryCTM`).

### Service Category Pages (`isCategory` + `childSlugs`)

Category service pages (e.g., "SAP Consultancy", "Alfa Solutions") aggregate child services under a landing page. Set these fields in the service frontmatter:

```yaml
isCategory: true
childSlugs:
  - "sap-consultancy/sap-is-u-consultancy"
  - "sap-consultancy/sap-crm-consultancy"
```

When `isCategory: true`, `src/pages/[...lang]/services/[...slug].astro` fetches the listed `childSlugs` entries and renders them below the page content via `ServiceListSection`. The child slugs must match the `customSlug` values of sibling service entries. Both the EN and TR category files must have consistent (language-specific) `childSlugs`.

### Content Drafts

Set `draft: true` in any content frontmatter to exclude it from production builds. `getCollectionCTM` applies this filter automatically in `PROD` mode; drafts are visible in dev.

## Menu Configuration

- `src/config/menu.en.json` — English menu
- `src/config/menu.tr.json` — Turkish menu

Menu URLs are stored **without** the `/tr/` prefix in `menu.tr.json`. The system automatically prepends `/tr/` when rendering TR pages via `getLocaleUrlCTM`. The contact page is intentionally absent from all menu arrays — it's only accessible via the header button configured in `config.toml` under `[settings.navigationButton]`.

## Section Content Pattern

Homepage sections are data-driven markdown files in `src/content/sections/{lang}/`. Each section component calls `getEntryCTM("sections", "section-name", locale)` to load its content. The `enable: true/false` field in frontmatter controls whether the section renders.

## MDX Auto-Imported Shortcodes

The following shortcodes are available in any `.mdx` content file without explicit imports (configured via `astro-auto-import` in `astro.config.mjs`):

- `<ImageList>` / `<ImageItem>` — image gallery blocks
- `<InfoBlockList>` / `<InfoBlockItem>` — structured info block lists

## Contact Form

Form provider is **formsubmit.co**. Submissions are forwarded to `info@alfayazilim.com`.

Relevant `config.toml` keys (under `[settings]`):
- `contactFormAction` — formsubmit.co endpoint URL (contains email address)
- `contactFormProvider` — `"formsubmit.co"` | `"formspree"` | `"netlify"`
- `turnstileSiteKey` — Cloudflare Turnstile site key (public)

### Cloudflare Turnstile

Integrated in `src/layouts/components/widgets/ContactForm.astro`:

- `turnstileSiteKey` is read from config; if empty, the widget is not rendered.
- Turnstile JS is loaded via `is:inline` script tag from `challenges.cloudflare.com/turnstile/v0/api.js`.
- The submit handler checks `cf-turnstile-response`; if empty, the submission is blocked.
- To update the site key, only change `config.toml` → `turnstileSiteKey` and run `npm run toml:watch`.

**Note:** formsubmit.co does not perform server-side Turnstile validation; validation is client-side only (sufficient for bot blocking).

## Footer Copyright Year

Use the `{year}` placeholder in copyright text in `config.toml` and `src/i18n/{en,tr}.json`. `Footer.astro` replaces it at runtime with `new Date().getFullYear()` — never hardcode the year.

## Image Optimization

Astro's Sharp integration is configured for WebP output (`format: "webp", quality: 85` in `astro.config.mjs`). The `OptimizedImage` component (`src/layouts/components/utilities/OptimizedImage.astro`) wraps Astro's `<Image>` component. LCP images should have `loading="eager"` and `fetchpriority="high"`.
