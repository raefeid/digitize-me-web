import { useState } from "react";
import {
  Pencil,
  Image as ImageIcon,
  Languages,
  FileBox,
  Search,
  HelpCircle,
  Megaphone,
  Plug,
  Building,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/**
 * AdminHelpPanel — friendly in-product guide for non-technical admins.
 * Lives at the "help" tab in /admin and is also surfaced from the dashboard.
 *
 * Content is intentionally hardcoded (English) — this is operational
 * documentation, not marketing copy, so it doesn't need to live in the CMS.
 */

type Topic = {
  id: string;
  icon: typeof Pencil;
  title: string;
  summary: string;
  body: { heading?: string; text: string; bullets?: string[] }[];
};

const TOPICS: Topic[] = [
  {
    id: "visual-edit",
    icon: Pencil,
    title: "Edit text & images visually",
    summary: "Click any text or image on your live site and change it in place.",
    body: [
      {
        text: "From the dashboard, click the big purple card “Edit your website visually”. Your homepage opens in edit mode.",
      },
      {
        heading: "What you can do",
        text: "",
        bullets: [
          "Click any heading, paragraph or button to rewrite it.",
          "Click any image to swap it from your Media Library or upload a new one.",
          "Use the language toggle (top bar) to write the Arabic version of the same field.",
          "Press Save when done — changes are live immediately.",
        ],
      },
      {
        heading: "When to use the form editors instead",
        text: "Some content (pricing plans, blog posts, industries, FAQs) lives in dedicated editors because it’s structured data. You’ll see them grouped under “Page editors” on the dashboard.",
      },
    ],
  },
  {
    id: "bilingual",
    icon: Languages,
    title: "Manage Arabic & English content",
    summary: "Every text field has an EN value and an optional AR override.",
    body: [
      {
        text: "Digitize me is bilingual. Almost every field accepts both an English value and an Arabic translation.",
      },
      {
        heading: "In the visual editor",
        text: "Switch the language using the toggle at the top of the page. The text you type is saved into the active language only — the other language is untouched.",
      },
      {
        heading: "In Site Content (advanced)",
        text: "Each row has a Value (EN) and Value (AR) field. If AR is empty, visitors who have Arabic selected will see the English fallback.",
      },
    ],
  },
  {
    id: "media",
    icon: ImageIcon,
    title: "Upload & organise media",
    summary: "Use the Media Library for all images, logos, and short videos.",
    body: [
      {
        text: "Open Media Library from the dashboard. You can upload one or many files at once.",
      },
      {
        heading: "Tips",
        text: "",
        bullets: [
          "Use the folder filter to keep things tidy (e.g. integrations, hero, blog).",
          "Each file shows a recommendation badge — green means the size and dimensions are good for the web.",
          "Click “CSV” to download an inventory of every uploaded file (useful for audits and handovers).",
          "Use the copy-URL button to grab the public link for a file you want to paste somewhere.",
        ],
      },
    ],
  },
  {
    id: "industries",
    icon: Building,
    title: "Edit Industry pages",
    summary: "Each industry has its own structured editor with bilingual fields.",
    body: [
      {
        text: "Open the “Industries page” editor from the dashboard. Inside you’ll find a list of all 14 industries.",
      },
      {
        heading: "What you can edit per industry",
        text: "",
        bullets: [
          "Hero title, subtitle and CTA",
          "Pain points, solutions and use cases (each list is fully bilingual)",
          "Before/after comparison and final CTA",
          "Publish / unpublish toggle (unpublished industries are hidden from visitors and the sitemap)",
        ],
      },
      {
        heading: "Inline editing",
        text: "You can also visit any /industries/<slug> page directly and turn on edit mode to tweak text in context.",
      },
    ],
  },
  {
    id: "search",
    icon: Search,
    title: "Find a specific piece of content",
    summary: "Use the Site Content search bar to locate any text by keyword.",
    body: [
      {
        text: "Open Site Content (under Advanced settings on the dashboard). The search bar at the top filters across every page, section, key, and both EN/AR values.",
      },
      {
        text: "Matching pages auto-expand and non-matching pages are hidden, so you can edit straight away.",
      },
    ],
  },
  {
    id: "promotions",
    icon: Megaphone,
    title: "Run a sale or banner",
    summary: "Promotions show as banners, modals or inline cards on the public site.",
    body: [
      {
        text: "Open “Promotions” from the dashboard. Create a new promotion, choose where it appears (top banner / modal / inline), schedule its start and end, and toggle it active.",
      },
      {
        heading: "Best practice",
        text: "",
        bullets: [
          "Always set an end date — promotions hide automatically when expired.",
          "Use the Arabic field too — bilingual visitors notice when only one language updates.",
        ],
      },
    ],
  },
  {
    id: "integrations",
    icon: Plug,
    title: "Add or hide an integration",
    summary: "The /integrations page is fully data-driven from the Integrations editor.",
    body: [
      {
        text: "Open “Integrations page” from the dashboard. Each card on the public page corresponds to one row here.",
      },
      {
        heading: "Per integration",
        text: "",
        bullets: [
          "Edit name, description, logo, category and link",
          "Toggle visibility without deleting (useful for partners that pause)",
          "Reorder cards by dragging in the list",
        ],
      },
    ],
  },
  {
    id: "pages",
    icon: FileBox,
    title: "Build a new page",
    summary: "Use Custom Pages to add a landing page without a developer.",
    body: [
      {
        text: "Open “Custom pages” from the dashboard. Create a draft, give it a slug (the URL), then use the block editor to drop in headings, text, images, CTAs and FAQ blocks.",
      },
      {
        text: "Pages stay as drafts until you publish them. Once published, they appear in your sitemap automatically.",
      },
    ],
  },
];

const AdminHelpPanel = () => {
  const [open, setOpen] = useState<string | null>("visual-edit");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle size={20} className="text-accent" /> Admin help
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Plain-English guides for the most common things you’ll do in the admin.
          </p>
        </div>
        <a
          href="mailto:support@digitizeme.com?subject=Admin%20help%20request"
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
        >
          Need more help? Email support <ExternalLink size={11} />
        </a>
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              The fastest way to learn: try Visual Editing
            </p>
            <p className="text-xs text-muted-foreground">
              From the dashboard, click <strong>Edit your website visually</strong>. You’ll see your live homepage with editable text and images. Click anything to change it. Save when you’re done.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isOpen = open === topic.id;
          return (
            <div
              key={topic.id}
              className="border border-border rounded-xl bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpen(isOpen ? null : topic.id)}
                className="w-full flex items-start gap-3 p-4 text-start hover:bg-muted/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {topic.title}
                    </span>
                    {isOpen ? (
                      <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{topic.summary}</p>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-4 space-y-3 text-sm text-foreground/90 leading-relaxed">
                  {topic.body.map((block, i) => (
                    <div key={i}>
                      {block.heading && (
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {block.heading}
                        </h4>
                      )}
                      {block.text && <p className="text-sm text-muted-foreground">{block.text}</p>}
                      {block.bullets && (
                        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc ps-5">
                          {block.bullets.map((b, j) => (
                            <li key={j}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHelpPanel;
