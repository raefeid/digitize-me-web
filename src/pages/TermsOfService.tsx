import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import EditableText from "@/components/cms/EditableText";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * Terms of Service.
 *
 * The entire body is a single rich-text CMS field (page="terms",
 * section="body", key="content") so legal/marketing can update it without
 * a deploy. Headings, last-updated date, and meta tags are also editable.
 */
const TermsOfService = () => {
  const { isRTL } = useLanguage();
  const { getContent } = useSiteContent("terms");

  const fallbackBody = isRTL
    ? `<h2>١. قبول الشروط</h2>
<p>باستخدام منصة Digitize me وخدماتها، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام خدماتنا.</p>

<h2>٢. وصف الخدمة</h2>
<p>Digitize me هي منصة لإدارة المستندات مدعومة بالذكاء الاصطناعي توفر خدمات المسح الضوئي والتعرف البصري على الحروف والتصنيف والبحث والاسترجاع للمستندات. نقدم حلول SaaS السحابية والتثبيت المحلي.</p>

<h2>٣. الحسابات والتسجيل</h2>
<p>عند إنشاء حساب، فإنك توافق على:</p>
<ul><li>تقديم معلومات دقيقة وكاملة</li><li>الحفاظ على أمان بيانات اعتماد حسابك</li><li>إخطارنا فورًا بأي وصول غير مصرح به</li><li>تحمل المسؤولية عن جميع الأنشطة تحت حسابك</li></ul>

<h2>٤. خطط الاشتراك والدفع</h2>
<p>نقدم ثلاثة إصدارات: إصدار الأفراد (مجاني)، إصدار الشركات الصغيرة، وإصدار المؤسسات. الاشتراكات المدفوعة تُجدد تلقائيًا ما لم يتم إلغاؤها. الأسعار قابلة للتغيير مع إشعار مسبق لمدة ٣٠ يومًا.</p>

<h2>٥. الاستخدام المقبول</h2>
<p>أنت توافق على عدم:</p>
<ul><li>رفع محتوى غير قانوني أو ضار أو مسيء</li><li>محاولة الوصول غير المصرح به إلى أنظمتنا</li><li>استخدام الخدمة لانتهاك حقوق الملكية الفكرية</li><li>إعادة بيع أو إعادة توزيع خدماتنا دون إذن</li><li>تحميل المنصة بشكل مفرط بعمليات آلية</li></ul>

<h2>٦. الملكية الفكرية</h2>
<p>تحتفظ أنت بملكية جميع المستندات والبيانات التي ترفعها على المنصة. Digitize me تحتفظ بجميع حقوق الملكية الفكرية للمنصة والتقنية وخوارزميات الذكاء الاصطناعي ومحرك Fotognize IDP.</p>

<h2>٧. توفر الخدمة</h2>
<p>نسعى لتوفير وقت تشغيل بنسبة ٩٩.٩٪ لعملاء SaaS. قد تحدث فترات صيانة مجدولة مع إشعار مسبق. بالنسبة للتثبيت المحلي، يعتمد التوفر على بنيتك التحتية.</p>

<h2>٨. حدود المسؤولية</h2>
<p>إلى أقصى حد يسمح به القانون، لن تكون Digitize me مسؤولة عن أي أضرار غير مباشرة أو عرضية أو تبعية ناشئة عن استخدامك للخدمة. مسؤوليتنا الإجمالية لا تتجاوز المبلغ الذي دفعته خلال الاثني عشر شهرًا السابقة.</p>

<h2>٩. الإنهاء</h2>
<p>يمكنك إلغاء حسابك في أي وقت. نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط. عند الإنهاء، ستتاح لك فترة ٣٠ يومًا لتصدير بياناتك.</p>

<h2>١٠. القانون الحاكم</h2>
<p>تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة وتُفسر وفقًا لها. أي نزاعات تخضع للاختصاص القضائي الحصري لمحاكم دبي.</p>

<h2>١١. تعديلات على الشروط</h2>
<p>قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة. استمرار استخدامك للخدمة يشكل قبولًا للشروط المحدثة.</p>

<h2>١٢. تواصل معنا</h2>
<p>لأي أسئلة حول هذه الشروط، يرجى التواصل معنا:</p>
<ul><li>البريد الإلكتروني: <a href="mailto:info@digitizeme.ae">info@digitizeme.ae</a></li><li>الموقع: دبي، الإمارات العربية المتحدة</li></ul>`
    : `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using the Digitize me platform and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

<h2>2. Service Description</h2>
<p>Digitize me is an AI-powered document management platform that provides document scanning, OCR, classification, search, and retrieval services. We offer both cloud-based SaaS and on-premise deployment options.</p>

<h2>3. Accounts &amp; Registration</h2>
<p>When creating an account, you agree to:</p>
<ul><li>Provide accurate and complete information</li><li>Maintain the security of your account credentials</li><li>Notify us immediately of any unauthorized access</li><li>Be responsible for all activities under your account</li></ul>

<h2>4. Subscription Plans &amp; Payment</h2>
<p>We offer three editions: Individuals Edition (free), SMEs Edition, and Enterprise Edition. Paid subscriptions auto-renew unless cancelled. Prices are subject to change with 30 days' prior notice.</p>

<h2>5. Acceptable Use</h2>
<p>You agree not to:</p>
<ul><li>Upload illegal, harmful, or abusive content</li><li>Attempt unauthorized access to our systems</li><li>Use the service to violate intellectual property rights</li><li>Resell or redistribute our services without permission</li><li>Overload the platform with automated processes</li></ul>

<h2>6. Intellectual Property</h2>
<p>You retain ownership of all documents and data you upload to the platform. Digitize me retains all intellectual property rights to the platform, technology, AI algorithms, and the Fotognize IDP engine.</p>

<h2>7. Service Availability</h2>
<p>We strive to maintain 99.9% uptime for SaaS customers. Scheduled maintenance windows may occur with prior notice. For on-premise deployments, availability depends on your infrastructure.</p>

<h2>8. Limitation of Liability</h2>
<p>To the maximum extent permitted by law, Digitize me shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you in the preceding twelve months.</p>

<h2>9. Termination</h2>
<p>You may cancel your account at any time. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, you will have a 30-day window to export your data.</p>

<h2>10. Governing Law</h2>
<p>These terms are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.</p>

<h2>11. Changes to Terms</h2>
<p>We may update these terms from time to time. We will notify you of material changes via email or platform notification. Your continued use of the service constitutes acceptance of the updated terms.</p>

<h2>12. Contact Us</h2>
<p>For questions about these terms, please contact us:</p>
<ul><li>Email: <a href="mailto:info@digitizeme.ae">info@digitizeme.ae</a></li><li>Location: Dubai, United Arab Emirates</li></ul>`;

  return (
    <Layout>
      <SEOHead
        title={getContent("meta_title", "Terms of Service | Digitize me")}
        description={getContent(
          "meta_description",
          "Read the Terms of Service for Digitize me document management platform. Understand your rights, responsibilities, and our service commitments."
        )}
        titleAr="شروط الخدمة | Digitize me"
        descriptionAr="اقرأ شروط خدمة منصة Digitize me لإدارة المستندات."
        path="/terms"
      />

      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max max-w-4xl mx-auto">
          <EditableText
            as="h1"
            page="terms"
            section="hero"
            contentKey="title"
            fallback={isRTL ? "شروط الخدمة" : "Terms of Service"}
            className="text-4xl md:text-5xl font-bold text-foreground mb-4 block"
          />
          <EditableText
            as="p"
            page="terms"
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
            page="terms"
            section="body"
            contentKey="content"
            fallback={fallbackBody}
            rich
            multiline
          />
        </div>
      </section>

      <CustomBlocksRenderer page="terms" />
      <AddBlockButton page="terms" />
    </Layout>
  );
};

export default TermsOfService;
