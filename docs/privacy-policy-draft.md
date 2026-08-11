# Privacy Policy — Draft Skeleton (for legal review)

> **⚠️ DRAFT — NOT LEGAL ADVICE.** This is a structured starting template for a
> UAE SaaS that manages customer documents. It is **not** a finished policy and is
> **not** a substitute for qualified legal counsel. Every `[BRACKETED]` item needs
> your input, and the whole document must be reviewed and approved by a lawyer
> admitted in the UAE (and, if you serve EU/UK residents, someone competent on
> GDPR) **before it is published**. Do not machine-translate the approved text into
> Arabic — use a professional legal translator, since the Arabic version is what
> UAE authorities will read.

**Governing law:** UAE Federal Decree-Law No. 45 of 2021 on the Protection of
Personal Data ("PDPL") and its Executive Regulations. `[COUNSEL: confirm whether
DIFC DPL 2020 or ADGM DPR 2021 also apply based on the entity's free-zone status,
and whether GDPR applies to any EU-facing processing.]`

**Last updated:** `[DATE]` (keep this accurate; it is a CMS field today and can
silently drift — see "Operational notes" at the end).

---

## 0. Who we are (the Controller)

- **Legal entity:** `[FULL REGISTERED LEGAL NAME — e.g. "Infasme … LLC", not the brand "Digitize me"]`
- **Trade licence / registration no.:** `[NUMBER]`
- **Registered address:** `[STREET, Dubai, United Arab Emirates]`
- **Privacy contact / Data Protection Officer:** `[NAME or role]`, `[privacy@digitizeme.ae — create this mailbox; do not use the generic info@ address for rights requests]`

`[COUNSEL: PDPL Art. 10 requires appointing a Data Protection Officer in certain
cases (high-risk / large-scale / sensitive-data processing). Confirm whether a DPO
appointment and registration is mandatory here; document management of customer
files likely qualifies.]`

---

## 1. Scope and our two roles — Controller vs. Processor

This is the most important distinction for this business and is currently missing:

- **We act as a *Controller*** for personal data we decide the purposes of: website
  visitors, sales leads, and account/billing data.
- **We act as a *Processor*** for the **documents and their contents that customers
  upload** to the platform. The customer is the Controller of any personal data
  inside those documents; we process it **only on the customer's documented
  instructions**, under a separate **Data Processing Agreement (DPA)**.
  `[ACTION: publish a DPA — enterprise buyers will require it and PDPL Art. 26
  requires a processor contract. There is no DPA today.]`

This policy covers our **Controller** activities. Processing of uploaded document
content is governed by the DPA and the customer agreement.

---

## 2. Personal data we collect

**As Controller (this site & your account):**
- Identity & contact: name, work email, phone, company, job title.
- Account & billing: subscription plan, billing details `[COUNSEL: confirm we never
  store card numbers — payment is handled by [PROCESSOR], see §6].`
- Lead / enquiry data: form submissions, including message content, plus
  `utm_source/medium/campaign` and the page path (captured on the contact form).
- Usage & device data: IP address, browser/device type, pages viewed, session
  activity, and — **only where you consent** — analytics and session-analytics data
  (see §5).

**As Processor (uploaded content):** the documents you upload and any personal data
they contain. `[Describe categories at a high level; details belong in the DPA.]`

`[COUNSEL: PDPL treats some data as "sensitive" (health, biometric, religious,
etc.). Customer documents may contain sensitive personal data. State how that is
handled and whether explicit consent / additional safeguards apply — PDPL Art. 5.]`

---

## 3. Lawful basis for processing (PDPL Art. 4)

We process personal data only where a lawful basis applies:

| Purpose | Lawful basis |
|---|---|
| Providing and maintaining the service, account management | Performance of a contract |
| Responding to sales enquiries / demo requests | Consent / steps prior to a contract |
| Analytics and marketing cookies | **Consent** (opt-in — see §5) |
| Security, fraud prevention, service improvement | Legitimate interests `[COUNSEL: confirm this basis is recognised for the relevant processing under PDPL]` |
| Billing, tax, regulatory record-keeping | Legal obligation |

---

## 4. How we use your information

- Provide, operate and secure the document-management service (OCR, classification,
  search, storage).
- Manage your account, subscription and billing.
- Respond to enquiries and provide support.
- Send service/administrative messages, and — with consent — marketing.
- Measure and improve the site and product (with consent for non-essential
  analytics).
- Comply with legal obligations and enforce our terms.

We do **not** use the **contents of uploaded documents** for advertising, and we do
**not** sell personal data.

---

## 5. Cookies and similar technologies

*(This section replaces the old "manage cookie preferences through your browser
settings" wording, which no longer reflects how the site works.)*

No non-essential cookie or tracker loads until you make a choice in our cookie
banner. We use three categories:

- **Strictly necessary** — required to run the site; always on.
- **Analytics** *(opt-in)* — `[Google Analytics 4, Microsoft Clarity, Hotjar]` to
  understand usage. `[COUNSEL/PRIVACY: Clarity and Hotjar record session
  interactions; describe this plainly and confirm it is disclosed adequately.]`
- **Marketing** *(opt-in)* — `[Meta Pixel, LinkedIn Insight, TikTok Pixel, Google
  Tag Manager]` for advertising and measurement.

You can change your choice at any time via **"Cookie preferences"** in the site
footer. `[List actual cookies/retention in a cookie table — recommended.]`

---

## 6. Sharing and sub-processors

We do not sell, rent, or trade personal data. We share it only with vetted service
providers under contract, including `[keep this list accurate and public]`:

| Sub-processor | Purpose | Location |
|---|---|---|
| `[Supabase / hosting provider]` | Application database, auth, storage | `[region]` |
| `[A2 Hosting]` | Website hosting | `[region]` |
| `[Google (Analytics/Fonts)]` | Analytics, fonts | `[region]` |
| `[Payment processor]` | Billing | `[region]` |
| `[Email/notification provider]` | Transactional email | `[region]` |

`[ACTION: maintain this as a versioned sub-processor list and link to it. Enterprise
procurement will ask for it.]`

---

## 7. International data transfers (PDPL Art. 22–23)

Some providers above may process data outside the UAE. Where we transfer personal
data abroad, we rely on `[an adequacy decision / standard contractual clauses /
your explicit consent]` and take steps to ensure an equivalent level of protection.
`[COUNSEL: complete based on where hosting and sub-processors actually are. This is
currently undisclosed and is a PDPL requirement.]`

---

## 8. Data retention

- Account data: for the life of the account, then deleted or anonymised within
  `[90] days` of closure unless a longer period is legally required.
- Lead/enquiry data: `[retention period — currently leads accumulate with no
  defined retention; set one]`.
- Uploaded documents: retained per the customer agreement / DPA; deleted on request
  or on termination per `[terms]`.
- Backups and legally required records: `[period]`.

---

## 9. How we protect your data

`[Confirm each claim is accurate before publishing — do not overstate.]`
Encryption in transit (TLS) and at rest `[AES-256 — confirm]`, role-based access
controls, row-level security on the database, least-privilege access, and regular
review. Security headers (CSP, HSTS, etc.) are enforced at the edge.

---

## 10. Your rights (PDPL Art. 13–17)

Subject to conditions in the PDPL, you may:
- **Access** the personal data we hold about you.
- **Correct** inaccurate or incomplete data.
- **Delete** your data ("right to erasure").
- **Restrict** or **object to** certain processing.
- **Port** your data to another controller.
- **Withdraw consent** at any time (without affecting prior lawful processing).

To exercise any right, contact `[privacy@digitizeme.ae]`. We will respond within
`[30 days / the period required by the PDPL Executive Regulations — confirm]`. We may
verify your identity first.

---

## 11. Personal-data breach notification

If a personal-data breach occurs that poses a risk to your rights, we will notify the
`[UAE Data Office]` and affected individuals as required by PDPL Art. 9 and its
Regulations, without undue delay. `[COUNSEL: confirm the notification trigger and
timeline in the Executive Regulations.]`

---

## 12. Children

The service is not directed to children under `[18/21 — confirm]`, and we do not
knowingly collect their personal data.

---

## 13. Complaints

If you believe we have mishandled your personal data, you may lodge a complaint with
the **UAE Data Office** `[add contact/route]`, without prejudice to any other remedy.

---

## 14. Changes to this policy

We may update this policy; we will post the new version here and update the "Last
updated" date. Material changes will be `[communicated how?]`.

---

## 15. Contact

`[Legal entity name]` — `[privacy@digitizeme.ae]` — `[registered address, Dubai, UAE]`

---

## Operational notes (remove before publishing)

**Required actions this draft surfaced (not just wording):**
1. **Publish a DPA and a sub-processor list** — needed for the Processor role (§1, §6)
   and for enterprise sales. Neither exists today.
2. **Create a real rights/DPO mailbox** (`privacy@`) — don't route rights requests to
   the generic `info@` (§0, §10).
3. **Set a leads retention policy** — lead rows currently accumulate PII indefinitely
   (§8).
4. **Confirm the security claims** (encryption specifics) before repeating them (§9).
5. **Decide DPO appointment / Data Office registration** obligations (§0).
6. **Add a privacy-consent checkbox + link on the contact form** (point-of-collection
   notice) — separate from this document but related.

**How to put the approved text live:**
- The privacy page body is a single rich-text CMS field
  (`page="privacy", section="body", key="content"`), edited via the admin Visual
  Editor — no code change needed. The English/Arabic fallbacks in
  `src/pages/PrivacyPolicy.tsx` should also be updated so the pre-CMS default is
  correct, and the `last_updated` CMS field kept in sync.
- Have the **Arabic** version produced by a professional legal translator, not
  machine-translated.
