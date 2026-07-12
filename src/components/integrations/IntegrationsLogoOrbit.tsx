import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Database, Cloud, Code2, Mail, FileSpreadsheet, MessageSquare, Briefcase, Boxes } from "lucide-react";
import { useMotionPreference } from "@/hooks/useReducedMotion";
import { useIntegrations } from "@/hooks/useIntegrations";
import digitizemeLogo from "@/assets/digitizeme-logo.png";

/**
 * Hero visual for /integrations: app logos slowly orbiting the central
 * Digitize me logo. The container measures itself with ResizeObserver and
 * derives all sizing (central logo, orbit radii, chip size) from the actual
 * rendered width — guaranteeing the logo stays perfectly centered with
 * balanced spacing on every breakpoint.
 *
 * Reduced motion: rotation pauses, items still rendered.
 */

const FALLBACK_ICONS = [Database, Cloud, Code2, Mail, FileSpreadsheet, MessageSquare, Briefcase, Boxes];

interface IntegrationsLogoOrbitProps {
  className?: string;
}

const IntegrationsLogoOrbit = ({ className = "" }: IntegrationsLogoOrbitProps) => {
  const { reduced, mobile } = useMotionPreference();
  const { data: integrations = [] } = useIntegrations();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(0);

  // Dev-only alignment overlay. Enable with ?debugOrbit=1 in the URL or
  // localStorage.debugOrbit = "1". Press "g" while focused to toggle.
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("debugOrbit") === "1";
    const fromLs = window.localStorage?.getItem("debugOrbit") === "1";
    setDebug(fromUrl || fromLs);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "g" && (e.ctrlKey || e.metaKey) && e.altKey) {
        setDebug((d) => {
          const next = !d;
          try {
            window.localStorage?.setItem("debugOrbit", next ? "1" : "0");
          } catch {
            /* ignore */
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setSize(w);
    });
    ro.observe(el);
    setSize(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const itemCount = mobile ? 5 : 8;

  // Derive everything from the measured container width.
  // Half is the radius of the available square; we lay things out from center.
  const half = size / 2;
  // Central logo: ~28% of width (clamped) keeps it balanced.
  const centralSize = Math.max(72, Math.min(160, size * 0.28));
  // Chip sizes scale gently with container width.
  const chipOuter = Math.max(40, Math.min(56, size * 0.11));
  const chipInner = Math.max(34, Math.min(48, size * 0.095));
  // Orbit radii: inner sits just outside the central logo, outer near the edge.
  // Provide breathing room between rings and away from container edge.
  const minInner = centralSize / 2 + chipInner / 2 + 14;
  const maxOuter = half - chipOuter / 2 - 6;
  // Distribute the two rings evenly across that band.
  const radiusInner = Math.max(minInner, half * 0.42);
  const radiusOuter = Math.max(radiusInner + chipOuter + 18, Math.min(maxOuter, half * 0.78));

  // Pick up to itemCount real logos, then fill with fallback icons
  const real = integrations.filter((i) => i.published && i.logo_url).slice(0, itemCount);
  const items: Array<{ logo?: string; name?: string; FallbackIcon?: typeof Database }> = [
    ...real.map((r) => ({ logo: r.logo_url ?? undefined, name: r.name })),
  ];
  while (items.length < itemCount) {
    const idx = items.length % FALLBACK_ICONS.length;
    items.push({ FallbackIcon: FALLBACK_ICONS[idx], name: `Integration ${items.length + 1}` });
  }

  // Split into two orbits
  const outer = items.slice(0, Math.ceil(itemCount / 2));
  const inner = items.slice(Math.ceil(itemCount / 2));

  const ready = size > 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-lg mx-auto aspect-square ${className}`}
      aria-hidden
    >
      {/* Soft glow */}
      <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-accent/15 via-primary/10 to-transparent blur-2xl" />

      {/* Dev-only alignment overlay (?debugOrbit=1 or Ctrl/Cmd+Alt+G) */}
      {ready && debug && (
        <div className="absolute inset-0 pointer-events-none z-50 font-mono text-[10px]">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-fuchsia-500/70" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-fuchsia-500/70" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-fuchsia-500 ring-2 ring-white" />
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-emerald-500"
            style={{
              width: centralSize,
              height: centralSize,
              marginLeft: -centralSize / 2,
              marginTop: -centralSize / 2,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-cyan-500"
            style={{
              width: radiusInner * 2,
              height: radiusInner * 2,
              marginLeft: -radiusInner,
              marginTop: -radiusInner,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-amber-500"
            style={{
              width: radiusOuter * 2,
              height: radiusOuter * 2,
              marginLeft: -radiusOuter,
              marginTop: -radiusOuter,
            }}
          />
          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur border border-border rounded-md px-2 py-1.5 leading-tight shadow-md pointer-events-auto">
            <div>w: {Math.round(size)}px {mobile ? "📱" : "🖥"}</div>
            <div><span className="text-emerald-600">●</span> central: {Math.round(centralSize)}</div>
            <div><span className="text-cyan-600">●</span> r-inner: {Math.round(radiusInner)}</div>
            <div><span className="text-amber-600">●</span> r-outer: {Math.round(radiusOuter)}</div>
            <div className="text-muted-foreground">gap: {Math.round(radiusInner - centralSize / 2)} / {Math.round(radiusOuter - radiusInner)}</div>
          </div>
        </div>
      )}

      {ready && (
        <>
          {/* Outer orbit ring */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-accent/15"
            style={{
              width: radiusOuter * 2,
              height: radiusOuter * 2,
              marginLeft: -radiusOuter,
              marginTop: -radiusOuter,
            }}
          />
          {reduced ? (
            <div className="absolute left-1/2 top-1/2">
              {outer.map((item, i) => {
                const angle = (i / outer.length) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radiusOuter;
                const y = Math.sin(angle) * radiusOuter;
                return (
                  <div
                    key={`o-${i}`}
                    className="absolute"
                    style={{ left: x - chipOuter / 2, top: y - chipOuter / 2 }}
                  >
                    <OrbitChip {...item} size={chipOuter} />
                  </div>
                );
              })}
            </div>
          ) : (
            <motion.div
              className="absolute left-1/2 top-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: mobile ? 60 : 40, repeat: Infinity, ease: "linear" }}
            >
              {outer.map((item, i) => {
                const angle = (i / outer.length) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radiusOuter;
                const y = Math.sin(angle) * radiusOuter;
                return (
                  <motion.div
                    key={`o-${i}`}
                    className="absolute"
                    style={{ left: x - chipOuter / 2, top: y - chipOuter / 2 }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: mobile ? 60 : 40, repeat: Infinity, ease: "linear" }}
                  >
                    <OrbitChip {...item} size={chipOuter} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Inner orbit ring */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-accent/10"
            style={{
              width: radiusInner * 2,
              height: radiusInner * 2,
              marginLeft: -radiusInner,
              marginTop: -radiusInner,
            }}
          />
          {reduced ? (
            <div className="absolute left-1/2 top-1/2">
              {inner.map((item, i) => {
                const angle = (i / inner.length) * Math.PI * 2 + Math.PI / 4;
                const x = Math.cos(angle) * radiusInner;
                const y = Math.sin(angle) * radiusInner;
                return (
                  <div
                    key={`i-${i}`}
                    className="absolute"
                    style={{ left: x - chipInner / 2, top: y - chipInner / 2 }}
                  >
                    <OrbitChip {...item} size={chipInner} small />
                  </div>
                );
              })}
            </div>
          ) : (
            <motion.div
              className="absolute left-1/2 top-1/2"
              animate={{ rotate: -360 }}
              transition={{ duration: mobile ? 50 : 30, repeat: Infinity, ease: "linear" }}
            >
              {inner.map((item, i) => {
                const angle = (i / inner.length) * Math.PI * 2 + Math.PI / 4;
                const x = Math.cos(angle) * radiusInner;
                const y = Math.sin(angle) * radiusInner;
                return (
                  <motion.div
                    key={`i-${i}`}
                    className="absolute"
                    style={{ left: x - chipInner / 2, top: y - chipInner / 2 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: mobile ? 50 : 30, repeat: Infinity, ease: "linear" }}
                  >
                    <OrbitChip {...item} size={chipInner} small />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* Central Digitize me logo — static when reduced motion is on.
          Double ring (border + inset highlight) keeps the white disc legible on
          both light and dark page backgrounds; layered shadow adds depth without
          looking heavy. Inner padding (~12% of disc) gives the logo breathing room. */}
      {(() => {
        const pad = centralSize * 0.12;
        const logoBox = centralSize - pad * 2;
        const Wrapper: any = reduced ? "div" : motion.div;
        const motionProps = reduced
          ? {}
          : {
              animate: { scale: [1, 1.04, 1] },
              transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const },
            };
        return (
          <Wrapper
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white flex items-center justify-center ring-1 ring-black/5"
            style={{
              width: centralSize || undefined,
              height: centralSize || undefined,
              padding: pad,
              boxShadow:
                "0 1px 0 hsl(var(--background) / 0.8) inset, 0 0 0 1px hsl(var(--border) / 0.6), 0 12px 32px -12px hsl(var(--accent) / 0.35), 0 24px 48px -16px hsl(0 0% 0% / 0.18)",
            }}
            {...motionProps}
          >
            <img
              src={digitizemeLogo}
              alt="Digitize me"
              className="object-contain"
              style={{ width: logoBox, height: logoBox }}
            />
          </Wrapper>
        );
      })()}
    </div>
  );
};

const OrbitChip = ({
  logo,
  name,
  FallbackIcon,
  small = false,
  size,
}: {
  logo?: string;
  name?: string;
  FallbackIcon?: typeof Database;
  small?: boolean;
  size: number;
}) => {
  const iconSize = Math.round(size * (small ? 0.42 : 0.46));
  return (
    <div
      className="rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      style={{ width: size, height: size }}
      title={name}
    >
      {logo ? (
        <img
          src={logo}
          alt={name ?? ""}
          className="object-contain"
          style={{ width: size * 0.6, height: size * 0.6 }}
          loading="lazy"
        />
      ) : FallbackIcon ? (
        <FallbackIcon size={iconSize} className="text-accent" />
      ) : null}
    </div>
  );
};

export default IntegrationsLogoOrbit;
