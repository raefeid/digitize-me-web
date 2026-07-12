import { Database, Cloud, Code2, FileSpreadsheet, Mail, Briefcase } from "lucide-react";
import { useMotionPreference } from "@/hooks/useReducedMotion";

/**
 * Animated SVG: external apps stream data into the central Digitize me hub,
 * which then streams structured output downstream. SVG-only animation
 * (animateMotion) for great perf and zero JS runtime cost.
 *
 * Reduced motion: dots are hidden, lines stay visible.
 * Mobile: fewer source nodes, smaller canvas.
 */
const SOURCES = [
  { icon: Database, label: "ERP" },
  { icon: Briefcase, label: "CRM" },
  { icon: Cloud, label: "Drive" },
  { icon: FileSpreadsheet, label: "Sheets" },
  { icon: Mail, label: "Email" },
  { icon: Code2, label: "API" },
];

const IntegrationsDataFlow = ({ className = "" }: { className?: string }) => {
  const { reduced, mobile } = useMotionPreference();
  const sources = mobile ? SOURCES.slice(0, 4) : SOURCES;
  const W = 800;
  const H = mobile ? 320 : 400;
  const cx = W / 2;
  const cy = H / 2;
  const sourceX = 80;
  const outX = W - 80;

  return (
    <div className={`relative w-full ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id="flow-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="hsl(var(--border))" />
            <stop offset="0.5" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            <stop offset="1" stopColor="hsl(var(--border))" />
          </linearGradient>
          <radialGradient id="hub-glow">
            <stop offset="0" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
            <stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hub glow */}
        <circle cx={cx} cy={cy} r="140" fill="url(#hub-glow)" />

        {/* Source → hub paths */}
        {sources.map((_, i) => {
          const sy = (H / (sources.length + 1)) * (i + 1);
          const d = `M${sourceX + 28} ${sy} C ${cx - 120} ${sy}, ${cx - 80} ${cy}, ${cx - 32} ${cy}`;
          return (
            <g key={`in-${i}`}>
              <path d={d} stroke="url(#flow-line)" strokeWidth="2" fill="none" strokeDasharray="4 6" />
              {!reduced && (
                <circle r="3.5" fill="hsl(var(--accent))">
                  <animateMotion dur={`${3.5 + i * 0.4}s`} repeatCount="indefinite" path={d} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Hub → output paths */}
        {[0.3, 0.5, 0.7].map((ratio, i) => {
          const oy = H * ratio;
          const d = `M${cx + 32} ${cy} C ${cx + 80} ${cy}, ${cx + 120} ${oy}, ${outX - 28} ${oy}`;
          return (
            <g key={`out-${i}`}>
              <path d={d} stroke="url(#flow-line)" strokeWidth="2" fill="none" strokeDasharray="4 6" />
              {!reduced && (
                <circle r="3.5" fill="hsl(var(--primary))">
                  <animateMotion dur={`${3 + i * 0.5}s`} begin={`${i * 0.7}s`} repeatCount="indefinite" path={d} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Source nodes */}
        {sources.map((s, i) => {
          const Icon = s.icon;
          const sy = (H / (sources.length + 1)) * (i + 1);
          return (
            <g key={`src-${i}`}>
              <circle cx={sourceX} cy={sy} r="26" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
              <foreignObject x={sourceX - 10} y={sy - 10} width="20" height="20">
                <div className="w-5 h-5 flex items-center justify-center text-accent">
                  <Icon size={18} />
                </div>
              </foreignObject>
              <text x={sourceX} y={sy + 44} textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--muted-foreground))">
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Output nodes */}
        {["JSON", "CSV", "API"].map((lbl, i) => {
          const ratio = [0.3, 0.5, 0.7][i];
          const oy = H * ratio;
          return (
            <g key={`out-n-${i}`}>
              <rect x={outX - 28} y={oy - 16} width="56" height="32" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <text x={outX} y={oy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(var(--foreground))">
                {lbl}
              </text>
            </g>
          );
        })}

        {/* Central hub */}
        <g>
          <circle cx={cx} cy={cy} r="36" fill="hsl(var(--accent))" />
          <circle cx={cx} cy={cy} r="36" fill="none" stroke="hsl(var(--accent))" strokeOpacity="0.3" strokeWidth="14">
            {!reduced && (
              <animate attributeName="r" values="36;48;36" dur="3s" repeatCount="indefinite" />
            )}
          </circle>
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="hsl(var(--accent-foreground))">
            dm
          </text>
        </g>
      </svg>
    </div>
  );
};

export default IntegrationsDataFlow;
