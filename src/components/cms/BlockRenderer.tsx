import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PageBlock } from "@/hooks/useCustomPages";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";

const Icon = ({ name, className }: { name?: string; className?: string }) => {
  if (!name) return <Sparkles className={className} />;
  const Cmp = (LucideIcons as any)[name];
  if (!Cmp) return <Sparkles className={className} />;
  return <Cmp className={className} />;
};

const linkProps = (href: string) => {
  const external = /^https?:\/\//.test(href);
  return external
    ? { as: "a" as const, href, target: "_blank", rel: "noopener noreferrer" }
    : { as: "link" as const, to: href };
};

const SmartButton = ({
  href,
  children,
  variant,
  size,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "sm" | "lg" | "default";
}) => {
  const { lang } = useLanguage();
  const p = linkProps(href);
  return (
    <Button asChild variant={variant} size={size}>
      {p.as === "a" ? (
        <a href={p.href} target={p.target} rel={p.rel}>
          {children}
        </a>
      ) : (
        <Link to={localizeInternalPath(p.to, lang)}>{children}</Link>
      )}
    </Button>
  );
};

/** Render a single block. Pure presentational component. */
export const BlockRenderer = ({ block }: { block: PageBlock }) => {
  switch (block.type) {
    case "hero":
      return (
        <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
          <div className="container-max px-4 relative">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
              <div className="max-w-2xl">
                {block.eyebrow && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-5">
                    <Sparkles size={12} />
                    {block.eyebrow}
                  </div>
                )}
                {block.title && (
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6">
                    {block.title}
                  </h1>
                )}
                {block.desc && (
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
                    {block.desc}
                  </p>
                )}
                {block.cta_label && (
                  <SmartButton href={block.cta_link || "#"} size="lg">
                    {block.cta_label}
                    <ArrowRight className="w-4 h-4" />
                  </SmartButton>
                )}
              </div>
              {block.image && (
                <div className="order-first lg:order-last">
                  <img
                    src={block.image}
                    alt={block.title ?? ""}
                    className="w-full h-auto rounded-2xl object-contain"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case "rich_text":
      return (
        <section className="py-12 md:py-16">
          <div className="container-max px-4">
            <div
              className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{ __html: block.html || "" }}
            />
          </div>
        </section>
      );

    case "cards":
      return (
        <section className="py-16 md:py-20">
          <div className="container-max px-4">
            {block.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
                {block.title}
              </h2>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {(block.cards ?? []).map((c, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                  {c.icon && (
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <Icon name={c.icon} className="w-6 h-6 text-accent" />
                    </div>
                  )}
                  {c.title && (
                    <h3 className="text-lg font-semibold text-foreground mb-2">{c.title}</h3>
                  )}
                  {c.desc && <p className="text-sm text-muted-foreground">{c.desc}</p>}
                </Card>
              ))}
            </div>
          </div>
        </section>
      );

    case "image":
      if (!block.url) return null;
      return (
        <section className="py-12 md:py-16">
          <div className="container-max px-4">
            <figure className="max-w-4xl mx-auto">
              <img
                src={block.url}
                alt={block.alt ?? ""}
                className="w-full h-auto rounded-2xl shadow-lg"
                loading="lazy"
              />
              {block.caption && (
                <figcaption className="mt-3 text-sm text-muted-foreground text-center">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="py-16 md:py-20">
          <div className="container-max px-4">
            <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
              {block.title && (
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{block.title}</h2>
              )}
              {block.desc && (
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto whitespace-pre-line">
                  {block.desc}
                </p>
              )}
              {block.cta_label && (
                <SmartButton href={block.cta_link || "#"} size="lg">
                  {block.cta_label}
                </SmartButton>
              )}
            </Card>
          </div>
        </section>
      );

    case "stats": {
      const stats = (block.stats ?? []).filter((s) => s.value || s.label);
      if (stats.length === 0) return null;
      // Pick a sensible column count so 4 stats stay on one row, 3 stats divide nicely.
      const cols =
        stats.length <= 2
          ? "grid-cols-1 sm:grid-cols-2"
          : stats.length === 3
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 md:grid-cols-4";
      return (
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* subtle grid + gradient backdrop for the "modern minimal tech" feel */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-gradient-to-r from-transparent via-accent/5 to-transparent pointer-events-none"
          />
          <div className="container-max px-4 relative">
            {block.title && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-center mb-12 md:mb-16">
                {block.title}
              </h2>
            )}
            <div
              className={`grid ${cols} gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60 bg-card/40 backdrop-blur-sm`}
            >
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  className="bg-card group relative px-6 py-8 md:py-10 text-center transition-colors hover:bg-accent/[0.03]"
                >
                  {/* tiny accent rule above each value */}
                  <div className="mx-auto mb-3 h-px w-8 bg-accent/40 group-hover:w-12 group-hover:bg-accent transition-all duration-300" />
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {s.value}
                  </div>
                  {s.label && (
                    <div className="mt-2 text-xs md:text-sm uppercase tracking-[0.14em] text-muted-foreground font-medium">
                      {s.label}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "logo_strip": {
      const logos = (block.logos ?? []).filter((l) => l.url);
      if (logos.length === 0) return null;
      return (
        <section className="py-12 md:py-16 border-y border-border/60 bg-muted/20">
          <div className="container-max px-4">
            {block.title && (
              <p className="text-center text-[11px] md:text-xs text-muted-foreground/80 font-semibold uppercase tracking-[0.22em] mb-8">
                {block.title}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 items-center gap-x-8 gap-y-10">
              {logos.map((l, i) => {
                const img = (
                  <img
                    src={l.url}
                    alt={l.alt ?? ""}
                    loading="lazy"
                    className="max-h-10 md:max-h-12 w-auto mx-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300 select-none"
                  />
                );
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    className="flex items-center justify-center"
                  >
                    {l.href ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        aria-label={l.alt || `Logo ${i + 1}`}
                      >
                        {img}
                      </a>
                    ) : (
                      img
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
};
