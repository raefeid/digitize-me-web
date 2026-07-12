/**
 * Industry SEO helpers — keyword-rich title/description templates and
 * auto-generated FAQs for /industries/<slug> landing pages.
 *
 * The goal: every industry gets a high-intent, query-matching landing page
 * targeting keywords like "{Industry} OCR", "{Industry} document management",
 * "AI document processing for {Industry}". Outputs are deterministic so
 * crawlers + AI assistants see consistent answers; admins can override any
 * field via the existing IndustrySeoOverrideEditor (CMS site_content) and
 * faq_json key for FAQs.
 */
import type { FaqItem } from "@/lib/jsonLd";

export interface IndustrySeoMeta {
  title: string;
  description: string;
  keywords: string;
}

export interface IndustryLandingContent {
  heroEyebrow: string;
  heroSupporting: string;
  challengeHeading: string;
  challengeIntro: string;
  solutionHeading: string;
  solutionIntro: string;
  useCasesHeading: string;
  useCasesIntro: string;
  featuresHeading: string;
  featuresIntro: string;
  testimonialsHeading: string;
  faqHeading: string;
  faqIntro: string;
  ctaHeading: string;
  keywordPillars: string[];
}

export interface IndustryKeywordAnalysis {
  websiteThemes: string[];
  primaryKeywords: string[];
  solutionKeywords: string[];
  longTailKeywords: string[];
  localKeywords: string[];
  recommendedMetaKeywords: string;
}

export interface IndustryStructuredDataInput {
  baseUrl: string;
  path: string;
  industryName: string;
  industryDescription: string;
  keywords: string;
  solutions: string[];
  useCases: string[];
  lang?: "en" | "ar";
}

const WEBSITE_KEYWORD_THEMES_EN = [
  "Arabic OCR",
  "AI document management",
  "intelligent document processing",
  "document digitization",
  "enterprise document search",
  "workflow automation",
];

const WEBSITE_KEYWORD_THEMES_AR = [
  "OCR عربي",
  "إدارة المستندات بالذكاء الاصطناعي",
  "معالجة المستندات الذكية",
  "أرشفة رقمية",
  "البحث في المستندات",
  "أتمتة سير العمل",
];

const cleanKeyword = (value: string) => value.replace(/\s+/g, " ").replace(/[,:;]+$/g, "").trim();

const uniqueKeywords = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = cleanKeyword(item).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const toKeywordFragments = (items: string[], limit = 3) =>
  uniqueKeywords(
    items
      .flatMap((item) => item.split(/[,.]| and | with /i))
      .map((item) => cleanKeyword(item))
      .filter((item) => item.length > 2),
  ).slice(0, limit);

export const analyzeIndustryKeywords = (
  industryName: string,
  details: {
    headline?: string;
    description?: string;
    painPoints?: string[];
    solutions?: string[];
    useCases?: string[];
  },
  lang: "en" | "ar" = "en",
): IndustryKeywordAnalysis => {
  const fragments = toKeywordFragments([
    details.headline ?? "",
    details.description ?? "",
    ...(details.painPoints ?? []),
    ...(details.solutions ?? []),
    ...(details.useCases ?? []),
  ]);

  if (lang === "ar") {
    const primaryKeywords = uniqueKeywords([
      `OCR ${industryName}`,
      `إدارة مستندات ${industryName}`,
      `معالجة الوثائق للـ ${industryName}`,
      `أرشفة رقمية ${industryName}`,
    ]).slice(0, 4);

    const solutionKeywords = uniqueKeywords([
      `OCR عربي ${industryName}`,
      `أتمتة مستندات ${industryName}`,
      ...fragments.map((fragment) => `${industryName} ${fragment}`),
    ]).slice(0, 4);

    const longTailKeywords = uniqueKeywords([
      `أفضل نظام OCR لقطاع ${industryName}`,
      `برنامج إدارة المستندات لقطاع ${industryName}`,
      `أتمتة أرشفة ${industryName}`,
      ...fragments.map((fragment) => `${fragment} في ${industryName}`),
    ]).slice(0, 4);

    const localKeywords = uniqueKeywords([
      `${industryName} في مصر`,
      `${industryName} في السعودية`,
      `${industryName} في الإمارات`,
      `${industryName} في الخليج`,
    ]).slice(0, 4);

    return {
      websiteThemes: WEBSITE_KEYWORD_THEMES_AR,
      primaryKeywords,
      solutionKeywords,
      longTailKeywords,
      localKeywords,
      recommendedMetaKeywords: uniqueKeywords([
        ...primaryKeywords,
        ...solutionKeywords.slice(0, 2),
        ...localKeywords.slice(0, 2),
        "OCR عربي",
        "إدارة المستندات",
      ]).join(", "),
    };
  }

  const primaryKeywords = uniqueKeywords([
    `${industryName} OCR`,
    `${industryName} document management`,
    `AI document processing for ${industryName}`,
    `${industryName} document automation`,
  ]).slice(0, 4);

  const solutionKeywords = uniqueKeywords([
    `${industryName} digital archive`,
    `${industryName} workflow automation`,
    ...fragments.map((fragment) => `${industryName} ${fragment.toLowerCase()}`),
  ]).slice(0, 4);

  const longTailKeywords = uniqueKeywords([
    `best OCR software for ${industryName}`,
    `${industryName} document management system`,
    `bilingual OCR for ${industryName}`,
    ...fragments.map((fragment) => `${fragment.toLowerCase()} for ${industryName}`),
  ]).slice(0, 4);

  const localKeywords = uniqueKeywords([
    `${industryName} OCR UAE`,
    `${industryName} OCR Saudi Arabia`,
    `${industryName} OCR Egypt`,
    `${industryName} document management MENA`,
  ]).slice(0, 4);

  return {
    websiteThemes: WEBSITE_KEYWORD_THEMES_EN,
    primaryKeywords,
    solutionKeywords,
    longTailKeywords,
    localKeywords,
    recommendedMetaKeywords: uniqueKeywords([
      ...primaryKeywords,
      ...solutionKeywords.slice(0, 2),
      ...localKeywords.slice(0, 2),
      "Arabic OCR",
      "AI document management",
    ]).join(", "),
  };
};

/**
 * Build keyword-stacked SEO meta for an industry.
 * Title stays under ~60 chars where possible; description under ~160.
 */
export const buildIndustrySeo = (
  industryName: string,
  headline: string,
  lang: "en" | "ar" = "en",
): IndustrySeoMeta => {
  const keywords = analyzeIndustryKeywords(industryName, { headline }, lang);
  if (lang === "ar") {
    return {
      title: `حلول ${industryName} | OCR وإدارة المستندات بالذكاء الاصطناعي`.slice(0, 60),
      description: `حلول OCR عربي وإدارة المستندات وأتمتة الأرشفة لقطاع ${industryName}. ${headline}`.slice(
        0,
        160,
      ),
      keywords: keywords.recommendedMetaKeywords,
    };
  }
  return {
    title: `${industryName} Document Management & OCR | Digitize me`.slice(0, 60),
    description: `AI document management, Arabic OCR, and intelligent document processing built for ${industryName}. ${headline}`.slice(
      0,
      160,
    ),
    keywords: keywords.recommendedMetaKeywords,
  };
};

export const buildIndustryLandingContent = (
  industryName: string,
  details: {
    headline: string;
    description: string;
    painPoints: string[];
    solutions: string[];
    useCases: string[];
  },
  lang: "en" | "ar" = "en",
): IndustryLandingContent => {
  const keywords = analyzeIndustryKeywords(industryName, details, lang);
  const primary = keywords.primaryKeywords[0] ?? industryName;
  const solutionKeyword = keywords.solutionKeywords[0] ?? primary;
  const longTail = keywords.longTailKeywords[0] ?? primary;

  if (lang === "ar") {
    return {
      heroEyebrow: `حلول ${industryName}`,
      heroSupporting: `منصة ${primary} مصممة لفرق ${industryName} التي تحتاج إلى وصول أسرع للمستندات، وOCR عربي وإنجليزي، وضبط أقوى لسير العمل والامتثال.`,
      challengeHeading: `تحديات إدارة مستندات ${industryName}`,
      challengeIntro: `هذه أكثر العوائق التي تبطئ فرق ${industryName} عندما تعتمد على الأرشيف الورقي أو البحث اليدوي أو مشاركة الملفات غير المنظمة.`,
      solutionHeading: `${solutionKeyword} لفرق ${industryName}`,
      solutionIntro: `استخدم Digitize me لبناء أرشيف رقمي قابل للبحث، وتسريع الاسترجاع، وربط كل مستند بالسياق التشغيلي الذي يحتاجه فريقك.`,
      useCasesHeading: `حالات استخدام ${industryName} ذات الأولوية`,
      useCasesIntro: `استخدم هذه الصفحة كمرجع سريع لأكثر السيناريوهات التي تستفيد من OCR العربي وإدارة المستندات الذكية داخل ${industryName}.`,
      featuresHeading: `ميزات المنصة التي تدعم ${industryName}`,
      featuresIntro: `من OCR إلى التصنيف الذكي والبحث الكامل — هذه القدرات هي التي تجعل ${industryName} أسرع وأكثر دقة وقابلية للتوسع.`,
      testimonialsHeading: `لماذا يثق فريق ${industryName} في Digitize me`,
      faqHeading: `أسئلة شائعة حول OCR وإدارة مستندات ${industryName}`,
      faqIntro: `إجابات واضحة على الأسئلة التي يطرحها قادة ${industryName} قبل اختيار نظام OCR وأرشفة رقمية مناسب.`,
      ctaHeading: `ابدأ خطة ${longTail}`,
      keywordPillars: keywords.primaryKeywords.slice(0, 2).concat(keywords.longTailKeywords.slice(0, 2)).slice(0, 4),
    };
  }

  return {
    heroEyebrow: `${industryName} document management`,
    heroSupporting: `${primary} for ${industryName} teams that need faster retrieval, bilingual Arabic-English OCR, and tighter control over search, compliance, and workflow automation.`,
    challengeHeading: `${industryName} document management challenges slowing teams down`,
    challengeIntro: `These are the operational bottlenecks that make ${industryName} teams lose time, miss context, and struggle to retrieve critical files when they need them most.`,
    solutionHeading: `${solutionKeyword} that gives ${industryName} teams instant control`,
    solutionIntro: `Digitize me turns fragmented archives into a searchable, secure system tailored to ${industryName} workflows, approvals, audits, and day-to-day retrieval needs.`,
    useCasesHeading: `High-intent ${industryName} use cases for OCR and automation`,
    useCasesIntro: `Use this page as a blueprint for where Arabic OCR, AI classification, and faster retrieval create the biggest gains inside a modern ${industryName} operation.`,
    featuresHeading: `Platform capabilities built for ${industryName}`,
    featuresIntro: `From OCR to AI classification and full-text search, these features support the workflows that matter most in ${industryName}.`,
    testimonialsHeading: `Why ${industryName} teams trust Digitize me`,
    faqHeading: `${industryName} OCR and document management FAQs`,
    faqIntro: `Straight answers to the questions ${industryName} buyers ask before choosing OCR software and document management tools.`,
    ctaHeading: `Plan your ${longTail}`,
    keywordPillars: keywords.primaryKeywords.slice(0, 2).concat(keywords.longTailKeywords.slice(0, 2)).slice(0, 4),
  };
};

/**
 * Auto-generate 5 high-intent FAQs targeting "people also ask" style queries.
 * These are emitted as JSON-LD FAQPage AND rendered as visible accordions
 * for AEO (answer engine optimization). Admins can override the entire set
 * by writing JSON to site_content (page=industry_<slug>, section=seo,
 * key=faq_json) — see SEOHead → parseFaqsFromCms.
 */
export const buildIndustryFaqs = (
  industryName: string,
  painPoints: string[],
  solutions: string[],
  lang: "en" | "ar" = "en",
): FaqItem[] => {
  const firstPain = painPoints[0] ?? "";
  const firstSolution = solutions[0] ?? "";
  const secondSolution = solutions[1] ?? firstSolution;

  if (lang === "ar") {
    return [
      {
        question: `كيف يساعد OCR قطاع ${industryName}؟`,
        answer: `يقوم محرك OCR متعدد اللغات (عربي وإنجليزي) باستخراج النص من المستندات الممسوحة والصور وملفات PDF بدقة عالية، ما يجعل أرشيف ${industryName} قابلاً للبحث الفوري في ثوانٍ بدلاً من ساعات.`,
      },
      {
        question: `ما أهم تحديات إدارة المستندات في ${industryName}؟`,
        answer: `${firstPain} هي من أبرز المشاكل، ونعالجها عبر ${firstSolution}.`,
      },
      {
        question: `هل تدعمون اللغة العربية بالكامل؟`,
        answer: `نعم. كل واجهات Digitize me و OCR والبحث ولوحات الإدارة تدعم العربية والإنجليزية، مع التعرف الدقيق على النصوص العربية الممسوحة وحتى المكتوبة بخط اليد في الكثير من الحالات.`,
      },
      {
        question: `هل يمكن دمج Digitize me مع أنظمة ERP و CRM الموجودة لدينا؟`,
        answer: `نعم، نوفر تكاملات جاهزة (SAP, Oracle, Microsoft Dynamics, Salesforce, Google Drive, OneDrive) و REST API لربط أي نظام داخلي.`,
      },
      {
        question: `كم يستغرق نشر الحل في ${industryName}؟`,
        answer: `معظم العملاء ينتقلون إلى الإنتاج خلال 2-4 أسابيع، يشمل ذلك الإعداد، والتدريب، وترحيل الأرشيف، والتكاملات.`,
      },
    ];
  }

  return [
    {
      question: `How does OCR work for ${industryName}?`,
      answer: `Our bilingual OCR engine (Arabic + English) extracts text from scanned documents, images, and PDFs with high accuracy — turning any ${industryName} archive into a fully searchable digital library that retrieves files in seconds instead of hours.`,
    },
    {
      question: `What are the biggest document-management challenges in ${industryName}?`,
      answer: `${firstPain} is one of the most common issues. Digitize me solves it by ${firstSolution.charAt(0).toLowerCase() + firstSolution.slice(1)}.`,
    },
    {
      question: `Does Digitize me support Arabic documents for ${industryName}?`,
      answer: `Yes. The full UI, OCR engine, and search are bilingual (Arabic + English), with high-accuracy recognition of printed and many handwritten Arabic documents — purpose-built for the UAE and wider MENA region.`,
    },
    {
      question: `Can ${industryName} teams integrate Digitize me with their existing ERP/CRM?`,
      answer: `Yes. Pre-built connectors are available for SAP, Oracle, Microsoft Dynamics, Salesforce, Google Drive, OneDrive and more, plus a REST API for any custom in-house system. ${secondSolution}`,
    },
    {
      question: `How long does deployment take for a ${industryName} organization?`,
      answer: `Most customers go live in 2-4 weeks. That includes onboarding, secure setup (cloud or on-premise), archive migration with bulk OCR, integration with existing systems, and team training.`,
    },
  ];
};

export const buildIndustryStructuredData = ({
  baseUrl,
  path,
  industryName,
  industryDescription,
  keywords,
  solutions,
  useCases,
  lang = "en",
}: IndustryStructuredDataInput): Record<string, unknown>[] => {
  const languageTag = lang === "ar" ? "ar" : "en";
  const softwareName =
    lang === "ar"
      ? `Digitize me لإدارة مستندات ${industryName}`
      : `Digitize me for ${industryName}`;
  const featureList = [...solutions, ...useCases].filter(Boolean).slice(0, 6);

  return [
    {
      "@type": "SoftwareApplication",
      "@id": `${baseUrl}${path}#softwareapplication`,
      name: softwareName,
      applicationCategory: "BusinessApplication",
      applicationSubCategory:
        lang === "ar"
          ? `برنامج OCR وإدارة مستندات لقطاع ${industryName}`
          : `${industryName} OCR and document management software`,
      operatingSystem: "Web, Windows, Linux",
      inLanguage: languageTag,
      description: industryDescription,
      audience: {
        "@type": "Audience",
        audienceType: industryName,
      },
      provider: { "@id": `${baseUrl}/#organization` },
      featureList,
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: `${baseUrl}/pricing`,
      },
    },
    {
      "@type": "Service",
      "@id": `${baseUrl}${path}#industry-service`,
      name:
        lang === "ar"
          ? `خدمات OCR وإدارة المستندات لقطاع ${industryName}`
          : `OCR and document management for ${industryName}`,
      description: industryDescription,
      serviceType:
        lang === "ar"
          ? `حلول OCR وأرشفة ذكية لقطاع ${industryName}`
          : `${industryName} OCR, document management, and workflow automation`,
      category: industryName,
      audience: {
        "@type": "Audience",
        audienceType: industryName,
      },
      provider: { "@id": `${baseUrl}/#organization` },
      areaServed: [
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "Saudi Arabia" },
        { "@type": "Country", name: "Egypt" },
      ],
      availableLanguage: ["en", "ar"],
      keywords,
      url: `${baseUrl}${path}`,
    },
  ];
};
