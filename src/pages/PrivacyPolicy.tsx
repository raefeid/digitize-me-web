import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import EditableText from "@/components/cms/EditableText";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * Privacy Policy.
 *
 * The entire body is a single rich-text CMS field (page="privacy",
 * section="body", key="content") so legal/marketing can update it without
 * a deploy. Headings, last-updated date, and meta tags are also editable
 * via the CMS.
 */
const PrivacyPolicy = () => {
  const { isRTL } = useLanguage();
  const { getContent } = useSiteContent("privacy");

  // Long defaults — these become the initial visible text until an admin
  // overrides them in the CMS / Visual Editor.
  const fallbackBody = isRTL
    ? `<h2>١. مقدمة</h2>
<p>مرحبًا بك في Digitize me ("نحن" أو "لنا"). نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام منصتنا وخدماتنا.</p>

<h2>٢. المعلومات التي نجمعها</h2>
<h3>المعلومات الشخصية</h3>
<ul><li>الاسم وعنوان البريد الإلكتروني</li><li>اسم الشركة والمسمى الوظيفي</li><li>رقم الهاتف</li><li>معلومات الفواتير والدفع</li></ul>
<h3>بيانات الاستخدام</h3>
<ul><li>عنوان IP ونوع المتصفح</li><li>الصفحات التي تمت زيارتها ومدة الجلسة</li><li>المستندات التي تم رفعها ومعالجتها (البيانات الوصفية فقط)</li><li>أنماط استخدام الميزات</li></ul>

<h2>٣. كيف نستخدم معلوماتك</h2>
<p>نستخدم معلوماتك من أجل:</p>
<ul><li>توفير وصيانة خدمات إدارة المستندات</li><li>معالجة وتصنيف مستنداتك باستخدام تقنية الذكاء الاصطناعي و OCR</li><li>إدارة حسابك واشتراكك</li><li>التواصل معك بشأن تحديثات الخدمة</li><li>تحسين منصتنا وتجربة المستخدم</li><li>الامتثال للالتزامات القانونية</li></ul>

<h2>٤. أمن البيانات</h2>
<p>نطبق تدابير أمنية على مستوى المؤسسات لحماية بياناتك، بما في ذلك تشفير AES-256 للبيانات أثناء النقل وأثناء التخزين، والتحكم في الوصول المستند إلى الأدوار، وعمليات التدقيق الأمني المنتظمة، والامتثال لمعايير حماية البيانات في دولة الإمارات العربية المتحدة.</p>

<h2>٥. تخزين البيانات</h2>
<p>بالنسبة لعملاء التثبيت المحلي: تبقى جميع البيانات على بنيتك التحتية الخاصة ولا تغادر مقرك أبدًا. بالنسبة لعملاء SaaS: يتم تخزين البيانات بشكل آمن في مراكز بيانات إقليمية مع الامتثال الكامل لقوانين البيانات المحلية.</p>

<h2>٦. مشاركة البيانات مع أطراف ثالثة</h2>
<p>لا نبيع أو نؤجر أو نتاجر ببياناتك الشخصية. قد نشارك المعلومات مع مزودي خدمات موثوقين يساعدوننا في تشغيل منصتنا، بموجب اتفاقيات سرية صارمة.</p>

<h2>٧. حقوقك</h2>
<p>لديك الحق في:</p>
<ul><li>الوصول إلى بياناتك الشخصية</li><li>تصحيح المعلومات غير الدقيقة</li><li>طلب حذف بياناتك</li><li>تصدير بياناتك بتنسيق قابل للنقل</li><li>إلغاء الاشتراك في اتصالات التسويق</li></ul>

<h2>٨. ملفات تعريف الارتباط</h2>
<p>نستخدم ملفات تعريف الارتباط الأساسية لتشغيل المنصة وملفات تحليلية لفهم كيفية استخدام خدماتنا. يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح.</p>

<h2>٩. الاحتفاظ بالبيانات</h2>
<p>نحتفظ ببياناتك طالما كان حسابك نشطًا أو حسب الحاجة لتقديم الخدمات. عند إلغاء حسابك، نحذف بياناتك الشخصية خلال ٩٠ يومًا، ما لم يكن الاحتفاظ مطلوبًا قانونيًا.</p>

<h2>١٠. تواصل معنا</h2>
<p>إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا:</p>
<ul><li>البريد الإلكتروني: <a href="mailto:info@digitizeme.ae">info@digitizeme.ae</a></li><li>الموقع: دبي، الإمارات العربية المتحدة</li></ul>`
    : `<h2>1. Introduction</h2>
<p>Welcome to Digitize me ("we," "us," or "our"). We are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform and services.</p>

<h2>2. Information We Collect</h2>
<h3>Personal Information</h3>
<ul><li>Name and email address</li><li>Company name and job title</li><li>Phone number</li><li>Billing and payment information</li></ul>
<h3>Usage Data</h3>
<ul><li>IP address and browser type</li><li>Pages visited and session duration</li><li>Documents uploaded and processed (metadata only)</li><li>Feature usage patterns</li></ul>

<h2>3. How We Use Your Information</h2>
<p>We use your information to:</p>
<ul><li>Provide and maintain our document management services</li><li>Process and classify your documents using AI and OCR technology</li><li>Manage your account and subscription</li><li>Communicate with you about service updates</li><li>Improve our platform and user experience</li><li>Comply with legal obligations</li></ul>

<h2>4. Data Security</h2>
<p>We implement enterprise-grade security measures to protect your data, including AES-256 encryption for data in transit and at rest, role-based access controls, regular security audits, and compliance with UAE data protection standards.</p>

<h2>5. Data Storage</h2>
<p>For on-premise customers: all data remains on your own infrastructure and never leaves your premises. For SaaS customers: data is stored securely in regional data centers with full compliance with local data laws.</p>

<h2>6. Third-Party Sharing</h2>
<p>We do not sell, rent, or trade your personal data. We may share information with trusted service providers who assist us in operating our platform, under strict confidentiality agreements.</p>

<h2>7. Your Rights</h2>
<p>You have the right to:</p>
<ul><li>Access your personal data</li><li>Correct inaccurate information</li><li>Request deletion of your data</li><li>Export your data in a portable format</li><li>Opt out of marketing communications</li></ul>

<h2>8. Cookies</h2>
<p>We use essential cookies to operate the platform and analytics cookies to understand how our services are used. You can manage cookie preferences through your browser settings.</p>

<h2>9. Data Retention</h2>
<p>We retain your data for as long as your account is active or as needed to provide services. Upon account cancellation, we delete your personal data within 90 days, unless retention is required by law.</p>

<h2>10. Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us:</p>
<ul><li>Email: <a href="mailto:info@digitizeme.ae">info@digitizeme.ae</a></li><li>Location: Dubai, United Arab Emirates</li></ul>`;

  return (
    <Layout>
      <SEOHead
        title={getContent("meta_title", "Privacy Policy | Digitize me")}
        description={getContent(
          "meta_description",
          "Learn how Digitize me collects, uses, and protects your personal data. Our commitment to your privacy and data security."
        )}
        titleAr="سياسة الخصوصية | Digitize me"
        descriptionAr="تعرف على كيفية جمع واستخدام وحماية Digitize me لبياناتك الشخصية."
        path="/privacy"
      />

      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max max-w-4xl mx-auto">
          <EditableText
            as="h1"
            page="privacy"
            section="hero"
            contentKey="title"
            fallback={isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
            className="text-4xl md:text-5xl font-bold text-foreground mb-4 block"
          />
          <EditableText
            as="p"
            page="privacy"
            section="hero"
            contentKey="last_updated"
            fallback={isRTL ? "آخر تحديث: ١٥ أبريل ٢٠٢٦" : "Last updated: April 15, 2026"}
            className="text-muted-foreground mb-2 block"
          />
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max max-w-4xl mx-auto prose prose-lg prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-accent max-w-none">
          <EditableText
            as="div"
            page="privacy"
            section="body"
            contentKey="content"
            fallback={fallbackBody}
            rich
            multiline
          />
        </div>
      </section>

      <CustomBlocksRenderer page="privacy" />
      <AddBlockButton page="privacy" />
    </Layout>
  );
};

export default PrivacyPolicy;
