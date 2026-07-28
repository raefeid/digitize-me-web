import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import EditableText from "@/components/cms/EditableText";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } }),
};

const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" className="h-8 w-8" aria-hidden="true">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h27.5z" fill="#00ac47" />
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.85l5.85 11.5z" fill="#ea4335" />
    <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
    <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
  </svg>
);

const OneDriveIcon = () => (
  <svg viewBox="0 0 32 20" className="h-8 w-8" aria-hidden="true">
    <path d="M12.2 5.6 18 9.1l3.5-1.5a5.7 5.7 0 0 1 2.3-.4A8.2 8.2 0 0 0 9.1 4.9a6.4 6.4 0 0 1 3.1.7z" fill="#0364B8" />
    <path d="M12.2 5.6a6.4 6.4 0 0 0-3.4-1 6.5 6.5 0 0 0-5.2 10.3l5.1-2.2 2.3-1 5-2.2 2-.9z" fill="#0078D4" />
    <path d="M23.8 7.2h-.3a5.7 5.7 0 0 0-2 .4L18 9.1l1 1.3 4.6 5.6 1.9.8a5.3 5.3 0 0 0-1.7-9.6z" fill="#1490DF" />
    <path d="M8.7 12.7 6.4 13.7l-2.8 1.2A6.5 6.5 0 0 0 8.8 18h14.9a5.3 5.3 0 0 0 4.8-1.2l-4.9-5.6z" fill="#28A8EA" />
  </svg>
);

const DropboxIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
    <path
      fill="#0061FF"
      d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"
    />
  </svg>
);

const SharePointIcon = () => (
  <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
    <circle cx="12.5" cy="10" r="8" fill="#036C70" />
    <circle cx="21" cy="16.5" r="7" fill="#1A9BA1" />
    <circle cx="16.5" cy="24" r="5.5" fill="#37C6D0" />
    <path
      d="M14.9 10.6H6.6v12.8h8.3a1.4 1.4 0 0 0 1.4-1.4V12a1.4 1.4 0 0 0-1.4-1.4z"
      fill="#000"
      opacity=".1"
    />
    <rect x="1" y="9.5" width="14" height="14" rx="1.4" fill="#03787C" />
    <path
      d="M6.3 16.5c-.4-.2-.7-.4-.9-.7a1.7 1.7 0 0 1-.3-1c0-.5.2-1 .6-1.4.5-.4 1.1-.6 1.9-.6.6 0 1.2.1 1.7.3v1.4a3 3 0 0 0-1.6-.4c-.3 0-.6 0-.8.2a.6.6 0 0 0-.3.5c0 .2 0 .3.2.5l.9.4c.6.2 1.1.5 1.4.8.3.4.4.8.4 1.2 0 .6-.2 1.1-.7 1.5-.4.3-1 .5-1.8.5-.7 0-1.4-.1-2-.4v-1.5a3 3 0 0 0 1.9.7c.4 0 .7 0 .9-.2a.6.6 0 0 0 .3-.5c0-.2 0-.4-.2-.5l-1-.5z"
      fill="#fff"
    />
  </svg>
);

const BoxIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
    <path
      fill="#0061D5"
      d="M.959 5.523c-.54 0-.959.42-.959.899v7.549a4.59 4.59 0 004.613 4.494 4.717 4.717 0 004.135-2.457c.779 1.438 2.337 2.457 4.074 2.457 2.577 0 4.674-2.037 4.674-4.613.06-2.457-2.037-4.495-4.613-4.495-1.738 0-3.295.959-4.074 2.397-.78-1.438-2.338-2.397-4.135-2.397-1.079 0-2.038.36-2.817.899V6.422a.92.92 0 00-.898-.899zM17.602 9.26a.95.95 0 00-.704.158c-.36.3-.479.899-.18 1.318l2.397 3.116-2.396 3.115c-.3.42-.24.96.18 1.26.419.3 1.016.298 1.316-.122l2.039-2.636 2.096 2.697c.3.36.899.419 1.318.12.36-.3.42-.84.121-1.259l-2.338-3.115 2.338-3.057c.3-.419.298-1.018-.121-1.318-.48-.3-1.019-.24-1.318.18l-2.096 2.576-2.04-2.695c-.149-.18-.373-.3-.612-.338zM4.613 11.154c1.558 0 2.817 1.26 2.817 2.758 0 1.558-1.259 2.756-2.817 2.756-1.558 0-2.816-1.198-2.816-2.756 0-1.498 1.258-2.758 2.816-2.758zm8.27 0c1.558 0 2.816 1.26 2.816 2.758-.06 1.558-1.318 2.756-2.816 2.756-1.558 0-2.817-1.198-2.817-2.756 0-1.498 1.259-2.758 2.817-2.758Z"
    />
  </svg>
);

const SalesforceIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
    <path
      fill="#00A1E0"
      d="M10.006 5.415a4.195 4.195 0 013.045-1.306c1.56 0 2.954.9 3.69 2.205.63-.3 1.35-.45 2.1-.45 2.85 0 5.159 2.34 5.159 5.22s-2.31 5.22-5.176 5.22c-.345 0-.69-.044-1.02-.104a3.75 3.75 0 01-3.3 1.95c-.6 0-1.155-.15-1.65-.375A4.314 4.314 0 018.88 20.4a4.302 4.302 0 01-4.05-2.82c-.27.062-.54.076-.825.076-2.204 0-4.005-1.8-4.005-4.05 0-1.5.811-2.805 2.01-3.51-.255-.57-.39-1.2-.39-1.846 0-2.58 2.1-4.65 4.65-4.65 1.53 0 2.85.705 3.72 1.8"
    />
  </svg>
);

const SapIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
    <path
      fill="#0FAAFF"
      d="M0 6.064v11.872h12.13L24 6.064zm3.264 2.208h.005c.863.001 1.915.245 2.676.633l-.82 1.43c-.835-.404-1.255-.442-1.73-.467-.708-.038-1.064.215-1.069.488-.007.332.669.633 1.305.838.964.306 2.19.715 2.377 1.9L7.77 8.437h2.046l2.064 5.576-.007-5.575h2.37c2.257 0 3.318.764 3.318 2.519 0 1.575-1.09 2.514-2.936 2.514h-.763l-.01 2.094-3.588-.003-.25-.908c-.37.122-.787.189-1.23.189-.456 0-.885-.071-1.263-.2l-.358.919-2 .006.09-.462c-.029.025-.057.05-.087.074-.535.43-1.208.629-2.037.644l-.213.002a5.075 5.075 0 0 1-2.581-.675l.73-1.448c.79.467 1.286.572 1.956.558.347-.007.598-.07.761-.239a.557.557 0 0 0 .156-.369c.007-.376-.53-.553-1.185-.756-.531-.164-1.135-.389-1.606-.735-.559-.41-.825-.924-.812-1.65a1.99 1.99 0 0 1 .566-1.377c.519-.537 1.357-.863 2.363-.863zm10.597 1.67v1.904h.521c.694 0 1.247-.23 1.248-.964 0-.709-.554-.94-1.248-.94zm-5.087.767l-.748 2.362c.223.085.481.133.757.133.268 0 .52-.047.742-.126l-.736-2.37z"
    />
  </svg>
);

const ZohoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
    <path
      fill="#E42527"
      d="M8.66 6.897a1.299 1.299 0 0 0-1.205.765l-.642 1.44-.062-.385A1.291 1.291 0 0 0 5.27 7.648l-4.185.678A1.291 1.291 0 0 0 .016 9.807l.678 4.18a1.293 1.293 0 0 0 1.27 1.087c.074 0 .143-.01.216-.017l4.18-.678c.436-.07.784-.351.96-.723l2.933 1.307a1.304 1.304 0 0 0 .988.026c.321-.12.575-.365.716-.678l.28-.629.038.276a1.297 1.297 0 0 0 1.455 1.103l3.712-.501a1.29 1.29 0 0 0 1.03.514h4.236c.713 0 1.29-.58 1.291-1.291V9.545c0-.712-.58-1.291-1.291-1.291h-4.236c-.079 0-.155.008-.23.022a1.309 1.309 0 0 0-.275-.288c-.275-.21-.614-.3-.958-.253l-4.197.571c-.155.021-.3.07-.432.14L9.159 7.01a1.27 1.27 0 0 0-.499-.113zm-.025.705c.077 0 .159.013.24.052l2.971 1.324c-.128.238-.18.508-.142.782l.357 2.596h.002l-.745 1.672a.59.59 0 0 1-.777.296l-3.107-1.385-.004-.041-.41-2.526L8.1 7.95a.589.589 0 0 1 .536-.348zm-3.159.733c.125 0 .245.039.343.112.13.09.21.227.237.382l.234 1.446-.56 1.259a1.27 1.27 0 0 0-.026.987c.12.322.364.575.678.717l.295.131a.585.585 0 0 1-.428.314l-4.185.678a.59.59 0 0 1-.674-.485l-.678-4.18a.588.588 0 0 1 .485-.674l4.185-.678c.03-.004.064-.01.094-.01zm11.705.09a.59.59 0 0 1 .415.173 1.287 1.287 0 0 0-.416.947v4.237c0 .033.003.065.005.097l-3.55.482a.586.586 0 0 1-.66-.502l-.191-1.403.899-2.017a1.29 1.29 0 0 0-.333-1.5l3.754-.51c.026-.004.051-.004.077-.004zm1.3.532h4.227c.326 0 .588.266.588.588v4.237a.589.589 0 0 1-.588.588h-4.237a.564.564 0 0 1-.12-.013c.47-.246.758-.765.684-1.318zm-5.988.309.254.113c.296.133.43.48.296.777l-.432.97-.207-1.465a.58.58 0 0 1 .09-.395zm5.39.538.453 3.325a.583.583 0 0 1-.453.65zM6.496 11.545l.17 1.052a.588.588 0 0 1-.293-.776z"
    />
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
