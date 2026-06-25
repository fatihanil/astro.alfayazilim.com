import config from "../../../.astro/config.generated.json";
import { getCollectionCTM } from "@/lib/contentParser.astro";
import { getTaxonomy } from "@/lib/taxonomyParser.astro";
import type { CollectionKey } from "astro:content";
import {
  getEntryRouteParam,
  getLocaleUrlCTM,
  supportedLanguages,
} from "./i18nUtils";
import { slugifyyy } from "./textConverter";

const { blogFolder, caseStudiesFolder } = config.settings;
const languageCodes = supportedLanguages.map((language) => language.languageCode);

const pageSlugTranslationMap: Record<string, string> = {
  contact: "iletisim",
  "corporate-about": "kurumsal-hakkimizda",
  "corporate-careers": "kurumsal-insan-kaynaklari",
  corporate: "kurumsal",
  gdpr: "kvkk",
  references: "referanslar",
  "why-alfa": "neden-alfa",
};

const reversePageSlugTranslationMap = Object.fromEntries(
  Object.entries(pageSlugTranslationMap).map(([key, value]) => [value, key]),
);

// Maps EN service customSlug → TR service customSlug
const serviceSlugTranslationMap: Record<string, string> = {
  "sap-consultancy": "sap-danismanlik",
  "artificial-intelligence": "yapay-zeka",
  "sap-ai-joule": "sap-ai-joule",
  "support-and-training": "destek-ve-egitim",
  "system-integration": "sistem-entegrasyonu",
  "quality-assurance": "kalite-guvence-hizmeti",
  "sap-solutions": "alfa-cozumleri/sap-cozumleri",
  "sap-consultancy/sap-is-u-consultancy": "sap-danismanlik/sap-is-u-danismanligi",
  "sap-consultancy/sap-crm-consultancy": "sap-danismanlik/sap-crm-danismanligi",
  "sap-consultancy/business-intelligence": "sap-danismanlik/is-zekasi-analitigi",
  "sap-consultancy/sap-erp-consultancy": "sap-danismanlik/sap-erp-danismanligi",
  "sap-consultancy/sap-technology-consultancy": "sap-danismanligi/sap-teknolojik-danismanlik",
  "sap-consultancy/sap-document-governance-and-archieving": "sap-danismanligi/sap-dokuman-yonetimi-ve-arsivleme",
  "sap-consultancy/sap-hana-s4-hana": "sap-danismanligi/sap-hana-s4hana",
  "alfa-solutions/alfa-e-arsiv": "alfa-cozumleri/alfa-e-arsiv",
  "alfa-solutions/alfa-e-defter": "alfa-cozumleri/alfa-e-defter",
  "alfa-solutions/alfa-e-fatura": "alfa-cozumleri/alfa-e-fatura",
  "alfa-solutions/alfa-e-mutabakat": "alfa-cozumleri/alfa-e-mutabakat",
  "alfa-solutions/alfa-organigram": "alfa-cozumleri/alfa-organigram",
  "sap-solutions/sap-plm": "alfa-cozumleri/sap-cozumleri/sap-plm",
  "sap-solutions/sap-workflow": "alfa-cozumleri/sap-cozumleri/sap-is-akisi",
  "sap-solutions/sap-portal": "alfa-cozumleri/sap-cozumleri/sap-portal",
  "sap-solutions/sap-mobile": "alfa-cozumleri/sap-mobile",
  "sap-solutions/software-development": "alfa-cozumleri/yazilim-gelistirme",
};

const reverseServiceSlugTranslationMap = Object.fromEntries(
  Object.entries(serviceSlugTranslationMap).map(([key, value]) => [value, key]),
);

// Service listing page URL segment per language
const serviceBasePaths: Record<string, string> = {
  en: "services",
  tr: "hizmetler",
};

const allServiceBaseSegments = new Set(Object.values(serviceBasePaths));

// Maps multi-segment page paths (without locale prefix) EN → TR
const multiSegmentPageTranslationMap: Record<string, string> = {
  "corporate/about": "kurumsal/hakkimizda",
  "corporate/careers": "kurumsal/insan-kaynaklari",
};

const reverseMultiSegmentPageTranslationMap = Object.fromEntries(
  Object.entries(multiSegmentPageTranslationMap).map(([key, value]) => [value, key]),
);

// Pages served at a fixed root-level URL regardless of locale (no /tr/ prefix)
const fixedUrlPages: Record<string, string> = {
  kvkk: "/kvkk/",
};

const translatePageSlug = (
  slug: string,
  sourceLang: string | undefined,
  targetLang: string | undefined,
): string | null => {
  const resolvedSourceLang = sourceLang || config.settings.multilingual.defaultLanguage;

  if (resolvedSourceLang === targetLang) {
    return slug;
  }

  if (resolvedSourceLang === "en" && targetLang === "tr") {
    return pageSlugTranslationMap[slug] || null;
  }

  if (resolvedSourceLang === "tr" && targetLang === "en") {
    return reversePageSlugTranslationMap[slug] || null;
  }

  return null;
};

const translateServiceSlug = (
  slug: string,
  sourceLang: string | undefined,
  targetLang: string | undefined,
): string => {
  const resolvedSourceLang = sourceLang || config.settings.multilingual.defaultLanguage;

  if (resolvedSourceLang === targetLang) return slug;

  if (resolvedSourceLang === "en" && targetLang === "tr") {
    return serviceSlugTranslationMap[slug] || slug;
  }

  if (resolvedSourceLang === "tr" && targetLang === "en") {
    return reverseServiceSlugTranslationMap[slug] || slug;
  }

  return slug;
};

const translateMultiSegmentPath = (
  path: string,
  sourceLang: string | undefined,
  targetLang: string | undefined,
): string | null => {
  const resolvedSourceLang = sourceLang || config.settings.multilingual.defaultLanguage;

  if (resolvedSourceLang === targetLang) return path;

  if (resolvedSourceLang === "en" && targetLang === "tr") {
    return multiSegmentPageTranslationMap[path] || null;
  }

  if (resolvedSourceLang === "tr" && targetLang === "en") {
    return reverseMultiSegmentPageTranslationMap[path] || null;
  }

  return null;
};

const stripLocalePrefix = (pathname: string): string => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments[0] && languageCodes.includes(segments[0])) {
    const strippedPath = `/${segments.slice(1).join("/")}`;
    return strippedPath === "/" ? strippedPath : strippedPath.replace(/\/+$/, "");
  }

  return normalizedPath === "/" ? normalizedPath : normalizedPath.replace(/\/+$/, "");
};

const normalizeSlug = (value?: string): string => slugifyyy(value || "");

const getEntryTranslationKey = (entryId: string): string =>
  entryId.split("/").slice(1).join("/");

const findLocalizedEntryRouteParam = async (
  collection: CollectionKey,
  currentSlug: string,
  sourceLang: string | undefined,
  targetLang: string | undefined,
): Promise<string | null> => {
  const currentEntries = await getCollectionCTM(collection, sourceLang);
  const currentEntry = currentEntries.find(
    (entry) => normalizeSlug(getEntryRouteParam(entry)) === normalizeSlug(currentSlug),
  );

  if (!currentEntry) {
    return null;
  }

  const translationKey = getEntryTranslationKey(currentEntry.id);
  const targetEntries =
    sourceLang === targetLang
      ? currentEntries
      : await getCollectionCTM(collection, targetLang);

  const targetEntry = targetEntries.find(
    (entry) => getEntryTranslationKey(entry.id) === translationKey,
  );

  return targetEntry ? getEntryRouteParam(targetEntry) : null;
};

const findLocalizedCategorySlug = async (
  currentSlug: string,
  sourceLang: string | undefined,
  targetLang: string | undefined,
): Promise<string | null> => {
  const currentCategories = await getTaxonomy(
    blogFolder as "blog",
    "categories",
    sourceLang,
  );
  const currentCategory = currentCategories.find((category) => {
    const candidates = [category.slug, ...(category.aliases || [])];
    return candidates.some((candidate) => normalizeSlug(candidate) === normalizeSlug(currentSlug));
  });

  if (!currentCategory) {
    return null;
  }

  const sourceKeys = new Set(
    [currentCategory.slug, ...(currentCategory.aliases || [])].map(normalizeSlug),
  );
  const targetCategories =
    sourceLang === targetLang
      ? currentCategories
      : await getTaxonomy(blogFolder as "blog", "categories", targetLang);

  const targetCategory = targetCategories.find((category) => {
    const candidates = [category.slug, ...(category.aliases || [])].map(normalizeSlug);
    return candidates.some((candidate) => sourceKeys.has(candidate));
  });

  return targetCategory?.slug || null;
};

export const getLocalizedPathnameCTM = async (
  pathname: string,
  sourceLang: string | undefined,
  targetLang: string | undefined,
): Promise<string> => {
  const basePath = stripLocalePrefix(pathname);
  const segments = basePath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return getLocaleUrlCTM("/", targetLang);
  }

  if (
    segments[0] === blogFolder &&
    segments[1] === "category" &&
    segments[2]
  ) {
    const localizedCategorySlug = await findLocalizedCategorySlug(
      segments[2],
      sourceLang,
      targetLang,
    );

    return getLocaleUrlCTM(
      localizedCategorySlug || segments[2],
      targetLang,
      `/${blogFolder}/category`,
    );
  }

  if (
    segments[0] === blogFolder &&
    segments[1] &&
    segments[1] !== "page" &&
    segments[1] !== "category"
  ) {
    const localizedEntrySlug = await findLocalizedEntryRouteParam(
      blogFolder as CollectionKey,
      segments[1],
      sourceLang,
      targetLang,
    );

    return getLocaleUrlCTM(
      localizedEntrySlug || segments[1],
      targetLang,
      `/${blogFolder}`,
    );
  }

  // Service routes: handles both EN (/services/...) and TR (/tr/hizmetler/...)
  if (allServiceBaseSegments.has(segments[0])) {
    const resolvedSource = sourceLang || config.settings.multilingual.defaultLanguage;
    const targetBase =
      serviceBasePaths[targetLang || config.settings.multilingual.defaultLanguage] ||
      serviceBasePaths[config.settings.multilingual.defaultLanguage];

    if (!segments[1] || segments[1] === "page") {
      return getLocaleUrlCTM(`/${targetBase}`, targetLang);
    }

    const fullSlug = segments.slice(1).join("/");
    const translatedSlug = translateServiceSlug(fullSlug, sourceLang, targetLang);
    return getLocaleUrlCTM(`/${targetBase}/${translatedSlug}`, targetLang);
  }

  if (
    segments[0] === caseStudiesFolder &&
    segments[1] &&
    segments[1] !== "page"
  ) {
    const localizedEntrySlug = await findLocalizedEntryRouteParam(
      caseStudiesFolder as CollectionKey,
      segments[1],
      sourceLang,
      targetLang,
    );

    return getLocaleUrlCTM(
      localizedEntrySlug || segments[1],
      targetLang,
      `/${caseStudiesFolder}`,
    );
  }

  // Multi-segment page routes (e.g., /corporate/about/ <-> /tr/kurumsal/hakkimizda/)
  if (segments.length > 1) {
    const joinedPath = segments.join("/");
    const translatedPath = translateMultiSegmentPath(joinedPath, sourceLang, targetLang);
    if (translatedPath) {
      return getLocaleUrlCTM(`/${translatedPath}`, targetLang);
    }
  }

  if (segments.length === 1) {
    // Check for fixed root-level pages (no locale prefix, e.g. /kvkk/)
    if (fixedUrlPages[segments[0]]) {
      return fixedUrlPages[segments[0]];
    }

    const localizedPageSlug = await findLocalizedEntryRouteParam(
      "pages" as CollectionKey,
      segments[0],
      sourceLang,
      targetLang,
    );

    if (localizedPageSlug) {
      if (fixedUrlPages[localizedPageSlug]) {
        return fixedUrlPages[localizedPageSlug];
      }
      return getLocaleUrlCTM(localizedPageSlug, targetLang);
    }

    const translatedPageSlug = translatePageSlug(segments[0], sourceLang, targetLang);
    if (translatedPageSlug) {
      if (fixedUrlPages[translatedPageSlug]) {
        return fixedUrlPages[translatedPageSlug];
      }
      return getLocaleUrlCTM(translatedPageSlug, targetLang);
    }
  }

  return getLocaleUrlCTM(basePath, targetLang);
};
