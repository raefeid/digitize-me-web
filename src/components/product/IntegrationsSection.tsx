import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import EditableText from "@/components/cms/EditableText";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } }),
};

const GoogleDriveIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <path d="M24 8L10 32h28L24 8z" fill="#0F9D58" />
    <path d="M24 8l14 24h-8L20 16l4-8z" fill="#F4B400" />
    <path d="M10 32l6 10h22l-6-10H10z" fill="#4285F4" />
  </svg>
);

const OneDriveIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <path d="M24 10c-5 0-9 3-10 8-4 1-7 5-7 9 0 5 4 9 9 9h16c5 0 9-4 9-9 0-4-3-8-7-9-1-5-5-8-10-8z" fill="#0078D4" />
  </svg>
);

const DropboxIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <path d="M14 8L4 14l10 6 10-6-10-6zm20 0L24 14l10 6 10-6-10-6zM4 25l10 6 10-6v2l-10 6-10-6v-2zm24 0l10 6 10-6v2l-10 6-10-6v-2z" fill="#0061FF" />
  </svg>
);

const SharePointIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#0078D4" />
    <path d="M16 32V16h4v16h-4zm8-10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-4c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" fill="#fff" />
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <path d="M24 4L6 13v22l18 9 18-9V13L24 4zm-2 28l-8-4v-8l8 4v8zm4 0v-8l8-4v8l-8 4z" fill="#0061D5" />
  </svg>
);

const SalesforceIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <path d="M36 20c-2 0-3.8 1-4.9 2.5C30.4 18.6 27.4 16 24 16c-4.2 0-7.7 3-8.8 7-3.3.6-5.7 3.5-5.7 6.9 0 3.9 3.2 7 7.1 7h19.4c4.2 0 7.6-3.4 7.6-7.5S40.2 20 36 20z" fill="#00A1E0" />
  </svg>
);

const SapIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <rect x="4" y="8" width="40" height="32" rx="6" fill="#0077C0" />
    <text x="24" y="30" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Arial, sans-serif">SAP</text>
  </svg>
);

const ZohoIcon = () => (
  <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
    <rect x="4" y="8" width="40" height="32" rx="6" fill="#E42527" />
    <text x="24" y="31" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="Arial, sans-serif">Z</text>
  </svg>
);

const integrations = [
  { id: "gdrive", name: "Google Drive", status: "available" as const, icon: GoogleDriveIcon },
  { id: "onedrive", name: "Microsoft OneDrive", status: "available" as const, icon: OneDriveIcon },
  { id: "dropbox", name: "Dropbox", status: "available" as const, icon: DropboxIcon },
  { id: "sharepoint", name: "Microsoft SharePoint", status: "available" as const, icon: SharePointIcon },
  { id: "box", name: "Box", status: "coming" as const, icon: BoxIcon },
  { id: "salesforce", name: "Salesforce", status: "coming" as const, icon: SalesforceIcon },
  { id: "sap", name: "SAP", status: "coming" as const, icon: SapIcon },
  { id: "zoho", name: "Zoho", status: "coming" as const, icon: ZohoIcon },
];

const statusClass = (status: "available" | "coming") =>
  status === "available"
    ? "bg-[hsl(var(--badge-available-bg))] text-[hsl(var(--badge-available-fg))] border-[hsl(var(--badge-available-border))]"
    : "bg-[hsl(var(--badge-coming-bg))] text-[hsl(var(--badge-coming-fg))] border-[hsl(var(--badge-coming-border))]";

const IntegrationsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-max">
        <div className="mx-auto max-w-3xl text-center">
          <EditableText
            page="product"
            section="integrations"
            contentKey="product_integrations_badge"
            fallback={t("product.integrations.badge")}
            className="text-sm font-semibold uppercase tracking-wider text-accent"
          />
          <EditableText
            as="h2"
            page="product"
            section="integrations"
            contentKey="product_integrations_title"
            fallback={t("product.integrations.title")}
            className="mt-3 block text-3xl font-bold text-foreground md:text-4xl lg:text-5xl"
            rich
          />
          <EditableText
            as="p"
            page="product"
            section="integrations"
            contentKey="product_integrations_desc"
            fallback={t("product.integrations.desc")}
            multiline
            className="mt-4 text-muted-foreground md:text-lg"
            rich
          />
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-accent/40 hover:shadow-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={index}
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-muted p-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon />
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.name}</h3>
                <span
                  className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(item.status)}`}
                >
                  {t(`product.integrations.${item.status}`)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
