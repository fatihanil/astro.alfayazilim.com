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

## i18n Architecture

- Two languages: `en` (default, no URL prefix) and `tr` (prefix `/tr/`)
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

## Routing Architecture

**The project uses a hybrid routing approach** due to EN/TR having different URL slugs (e.g., `/services/sap-consultancy/` vs `/tr/hizmetler/sap-danismanlik/`):

| Route file | Generates |
|---|---|
| `src/pages/[...lang]/index.astro` | `/` (EN) and `/tr/` (TR) |
| `src/pages/[...lang]/services/index.astro` | `/services/` only — returns `{ lang: undefined }` |
| `src/pages/[...lang]/services/[...slug].astro` | `/services/{customSlug}/` for each EN service (lang: undefined) |
| `src/pages/tr/hizmetler/index.astro` | `/tr/hizmetler/` |
| `src/pages/tr/hizmetler/[...slug].astro` | `/tr/hizmetler/{customSlug}/` for each TR service |
| `src/pages/corporate/...`, `src/pages/why-alfa/...`, etc. | EN standalone pages |
| `src/pages/tr/kurumsal/...`, `src/pages/tr/neden-alfa/...`, etc. | TR standalone pages |
| `src/pages/kvkk/index.astro` | `/kvkk/` (root-level, TR content) |

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

## Image Optimization

Astro's Sharp integration is configured for WebP output (`format: "webp", quality: 85` in `astro.config.mjs`). The `OptimizedImage` component (`src/layouts/components/utilities/OptimizedImage.astro`) wraps Astro's `<Image>` component. LCP images should have `loading="eager"` and `fetchpriority="high"`.
