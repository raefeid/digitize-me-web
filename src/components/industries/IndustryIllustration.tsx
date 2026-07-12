import { motion } from "framer-motion";

const illustrations: Record<string, React.FC<{ className?: string }>> = {
  "law-firms": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      <motion.rect x="60" y="160" width="160" height="12" rx="2" fill="hsl(var(--accent))" opacity="0.3" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }} />
      <motion.rect x="80" y="140" width="120" height="16" rx="2" fill="hsl(var(--accent))" opacity="0.2" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.1 }} />
      {/* Pillars */}
      <motion.rect x="90" y="60" width="14" height="80" rx="2" fill="hsl(var(--accent))" opacity="0.6" initial={{ scaleY: 0, originY: 1 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: 0.3 }} style={{ transformOrigin: "97px 140px" }} />
      <motion.rect x="133" y="60" width="14" height="80" rx="2" fill="hsl(var(--accent))" opacity="0.6" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ transformOrigin: "140px 140px" }} />
      <motion.rect x="176" y="60" width="14" height="80" rx="2" fill="hsl(var(--accent))" opacity="0.6" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: 0.5 }} style={{ transformOrigin: "183px 140px" }} />
      {/* Pediment */}
      <motion.path d="M70 60 L140 20 L210 60 Z" fill="hsl(var(--accent))" opacity="0.4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 0.4, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} />
      {/* Scale */}
      <motion.circle cx="140" cy="42" r="5" fill="hsl(var(--accent))" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.9 }} />
      {/* Floating docs */}
      <motion.rect x="20" y="30" width="30" height="38" rx="3" fill="hsl(var(--accent))" opacity="0.15" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 0.15 }} transition={{ duration: 0.6, delay: 1 }} />
      <motion.rect x="230" y="50" width="30" height="38" rx="3" fill="hsl(var(--accent))" opacity="0.15" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 0.15 }} transition={{ duration: 0.6, delay: 1.1 }} />
    </svg>
  ),

  "accounting": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Calculator body */}
      <motion.rect x="85" y="30" width="110" height="150" rx="10" fill="hsl(var(--accent))" opacity="0.15" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.15 }} transition={{ duration: 0.6 }} />
      <motion.rect x="95" y="40" width="90" height="30" rx="4" fill="hsl(var(--accent))" opacity="0.4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
      {/* Calculator buttons */}
      {[0,1,2,3,4,5,6,7,8].map((i) => (
        <motion.rect key={i} x={100 + (i % 3) * 28} y={80 + Math.floor(i / 3) * 28} width="20" height="20" rx="3" fill="hsl(var(--accent))" opacity="0.3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }} />
      ))}
      {/* Chart bars */}
      <motion.rect x="20" y="120" width="16" height="60" rx="3" fill="hsl(var(--accent))" opacity="0.25" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 0.8 }} style={{ transformOrigin: "28px 180px" }} />
      <motion.rect x="40" y="100" width="16" height="80" rx="3" fill="hsl(var(--accent))" opacity="0.35" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 0.9 }} style={{ transformOrigin: "48px 180px" }} />
      {/* Dollar signs */}
      <motion.text x="235" y="70" fontSize="28" fill="hsl(var(--accent))" opacity="0.3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.3, y: 0 }} transition={{ delay: 1 }}>$</motion.text>
      <motion.text x="245" y="130" fontSize="18" fill="hsl(var(--accent))" opacity="0.2" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.1 }}>$</motion.text>
    </svg>
  ),

  "logistics": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Truck body */}
      <motion.rect x="30" y="100" width="130" height="70" rx="6" fill="hsl(var(--accent))" opacity="0.2" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 0.2 }} transition={{ duration: 0.7 }} />
      <motion.path d="M160 130 L200 130 L210 170 L160 170 Z" fill="hsl(var(--accent))" opacity="0.3" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 0.3 }} transition={{ duration: 0.7 }} />
      {/* Wheels */}
      <motion.circle cx="80" cy="175" r="14" fill="hsl(var(--accent))" opacity="0.4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
      <motion.circle cx="190" cy="175" r="14" fill="hsl(var(--accent))" opacity="0.4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 0.6 }} />
      {/* Route line */}
      <motion.path d="M30 50 Q100 30 140 50 Q180 70 250 40" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.3" strokeDasharray="6 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />
      {/* Location pins */}
      <motion.circle cx="30" cy="50" r="6" fill="hsl(var(--accent))" opacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
      <motion.circle cx="250" cy="40" r="6" fill="hsl(var(--accent))" opacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
      {/* Boxes */}
      <motion.rect x="50" y="108" width="20" height="20" rx="2" fill="hsl(var(--accent))" opacity="0.35" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 0.35 }} transition={{ delay: 0.9 }} />
      <motion.rect x="75" y="108" width="20" height="20" rx="2" fill="hsl(var(--accent))" opacity="0.25" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 0.25 }} transition={{ delay: 1 }} />
    </svg>
  ),

  "real-estate": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Building 1 */}
      <motion.rect x="40" y="60" width="60" height="130" rx="4" fill="hsl(var(--accent))" opacity="0.2" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6 }} style={{ transformOrigin: "70px 190px" }} />
      {/* Building 2 tall */}
      <motion.rect x="110" y="30" width="50" height="160" rx="4" fill="hsl(var(--accent))" opacity="0.3" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ transformOrigin: "135px 190px" }} />
      {/* Building 3 */}
      <motion.rect x="170" y="80" width="70" height="110" rx="4" fill="hsl(var(--accent))" opacity="0.15" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ transformOrigin: "205px 190px" }} />
      {/* Windows */}
      {[0,1,2,3].map(r => [0,1].map(c => (
        <motion.rect key={`w1-${r}-${c}`} x={50 + c * 24} y={75 + r * 28} width="14" height="10" rx="1" fill="hsl(var(--accent))" opacity="0.4" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 + (r * 2 + c) * 0.05 }} />
      )))}
      {/* Key icon */}
      <motion.circle cx="250" cy="50" r="10" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.3" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      <motion.line x1="255" y1="58" x2="265" y2="70" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1 }} />
    </svg>
  ),

  "healthcare": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Cross */}
      <motion.rect x="118" y="40" width="44" height="120" rx="6" fill="hsl(var(--accent))" opacity="0.2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} />
      <motion.rect x="80" y="78" width="120" height="44" rx="6" fill="hsl(var(--accent))" opacity="0.2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} />
      {/* Heartbeat line */}
      <motion.path d="M20 180 L80 180 L100 150 L120 200 L140 160 L160 190 L180 180 L260 180" stroke="hsl(var(--accent))" strokeWidth="2.5" opacity="0.4" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} />
      {/* Stethoscope hint */}
      <motion.circle cx="45" cy="60" r="18" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.25" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
      <motion.path d="M45 78 Q45 110 60 120" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.25" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1 }} />
      {/* Clipboard */}
      <motion.rect x="220" y="40" width="36" height="48" rx="4" fill="hsl(var(--accent))" opacity="0.15" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 0.15 }} transition={{ delay: 1.1 }} />
      <motion.rect x="228" y="35" width="20" height="8" rx="3" fill="hsl(var(--accent))" opacity="0.25" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
    </svg>
  ),

  "education": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Graduation cap */}
      <motion.path d="M140 40 L40 80 L140 120 L240 80 Z" fill="hsl(var(--accent))" opacity="0.25" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 0.25 }} transition={{ duration: 0.6 }} />
      <motion.rect x="130" y="80" width="20" height="50" fill="hsl(var(--accent))" opacity="0.2" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 }} style={{ transformOrigin: "140px 80px" }} />
      {/* Book stack */}
      <motion.rect x="50" y="150" width="80" height="12" rx="2" fill="hsl(var(--accent))" opacity="0.3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 0.3 }} transition={{ delay: 0.5 }} />
      <motion.rect x="55" y="136" width="70" height="12" rx="2" fill="hsl(var(--accent))" opacity="0.25" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 0.25 }} transition={{ delay: 0.6 }} />
      <motion.rect x="52" y="122" width="75" height="12" rx="2" fill="hsl(var(--accent))" opacity="0.2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 0.2 }} transition={{ delay: 0.7 }} />
      {/* Certificate */}
      <motion.rect x="180" y="130" width="60" height="45" rx="4" fill="hsl(var(--accent))" opacity="0.15" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
      <motion.circle cx="210" cy="160" r="8" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.3" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      {/* Tassel */}
      <motion.path d="M200 80 Q210 100 205 120" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9 }} />
    </svg>
  ),

  "manufacturing": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Factory */}
      <motion.rect x="30" y="100" width="80" height="90" rx="4" fill="hsl(var(--accent))" opacity="0.2" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6 }} style={{ transformOrigin: "70px 190px" }} />
      {/* Chimney */}
      <motion.rect x="50" y="60" width="20" height="40" fill="hsl(var(--accent))" opacity="0.3" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 }} style={{ transformOrigin: "60px 100px" }} />
      {/* Smoke */}
      <motion.circle cx="60" cy="45" r="8" fill="hsl(var(--accent))" opacity="0.1" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 0.1 }} transition={{ delay: 0.8, duration: 1 }} />
      <motion.circle cx="55" cy="30" r="12" fill="hsl(var(--accent))" opacity="0.08" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 0.08 }} transition={{ delay: 1, duration: 1 }} />
      {/* Gear */}
      <motion.circle cx="200" cy="80" r="30" stroke="hsl(var(--accent))" strokeWidth="6" opacity="0.2" fill="none" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
      <motion.circle cx="200" cy="80" r="10" fill="hsl(var(--accent))" opacity="0.25" />
      {/* Conveyor belt */}
      <motion.line x1="130" y1="180" x2="270" y2="180" stroke="hsl(var(--accent))" strokeWidth="3" opacity="0.2" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} style={{ transformOrigin: "130px 180px" }} />
      {/* Products on belt */}
      {[0,1,2].map(i => (
        <motion.rect key={i} x={150 + i * 40} y={162} width="18" height="18" rx="2" fill="hsl(var(--accent))" opacity="0.3" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 0.3 }} transition={{ delay: 0.7 + i * 0.15 }} />
      ))}
    </svg>
  ),

  "construction": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Crane arm */}
      <motion.rect x="80" y="30" width="8" height="170" fill="hsl(var(--accent))" opacity="0.3" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.7 }} style={{ transformOrigin: "84px 200px" }} />
      <motion.line x1="84" y1="35" x2="220" y2="35" stroke="hsl(var(--accent))" strokeWidth="4" opacity="0.25" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4 }} style={{ transformOrigin: "84px 35px" }} />
      {/* Hook line */}
      <motion.line x1="200" y1="35" x2="200" y2="90" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.3" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.7 }} style={{ transformOrigin: "200px 35px" }} />
      {/* Hook */}
      <motion.path d="M194 90 Q194 102 200 102 Q206 102 206 90" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.4" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
      {/* Building under construction */}
      <motion.rect x="140" y="120" width="80" height="80" rx="2" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.2" fill="none" strokeDasharray="8 4" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5 }} />
      {/* Hard hat */}
      <motion.path d="M20 160 Q20 140 40 140 Q60 140 60 160" fill="hsl(var(--accent))" opacity="0.3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      <motion.rect x="15" y="158" width="50" height="6" rx="2" fill="hsl(var(--accent))" opacity="0.35" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
    </svg>
  ),

  "government": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Dome */}
      <motion.path d="M80 120 Q80 40 140 40 Q200 40 200 120" fill="hsl(var(--accent))" opacity="0.15" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.15 }} transition={{ duration: 0.7 }} />
      <motion.rect x="60" y="120" width="160" height="60" rx="4" fill="hsl(var(--accent))" opacity="0.2" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 }} style={{ transformOrigin: "140px 180px" }} />
      {/* Columns */}
      {[0,1,2,3].map(i => (
        <motion.rect key={i} x={80 + i * 36} y={125} width="10" height="50" rx="2" fill="hsl(var(--accent))" opacity="0.35" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5 + i * 0.1 }} style={{ transformOrigin: `${85 + i * 36}px 175px` }} />
      ))}
      {/* Flag */}
      <motion.line x1="140" y1="40" x2="140" y2="15" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.4" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.8 }} style={{ transformOrigin: "140px 40px" }} />
      <motion.rect x="142" y="15" width="18" height="12" rx="1" fill="hsl(var(--accent))" opacity="0.35" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1 }} style={{ transformOrigin: "142px 21px" }} />
      {/* Shield */}
      <motion.path d="M240 70 L260 80 L260 100 Q260 115 250 120 Q240 115 240 100 Z" fill="hsl(var(--accent))" opacity="0.2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
    </svg>
  ),

  "banking-finance": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Bank building */}
      <motion.path d="M60 80 L140 30 L220 80" fill="hsl(var(--accent))" opacity="0.2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 0.2, y: 0 }} transition={{ duration: 0.5 }} />
      <motion.rect x="70" y="80" width="140" height="100" rx="2" fill="hsl(var(--accent))" opacity="0.15" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.2 }} style={{ transformOrigin: "140px 180px" }} />
      {/* Columns */}
      {[0,1,2].map(i => (
        <motion.rect key={i} x={90 + i * 40} y={85} width="10" height="90" rx="2" fill="hsl(var(--accent))" opacity="0.3" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.4 + i * 0.1 }} style={{ transformOrigin: `${95 + i * 40}px 175px` }} />
      ))}
      {/* Coin stack */}
      {[0,1,2].map(i => (
        <motion.ellipse key={`coin-${i}`} cx="30" cy={150 - i * 12} rx="18" ry="6" fill="hsl(var(--accent))" opacity={0.2 + i * 0.1} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.1 }} />
      ))}
      {/* Lock */}
      <motion.rect x="240" y="80" width="24" height="20" rx="3" fill="hsl(var(--accent))" opacity="0.3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
      <motion.path d="M246 80 Q246 65 252 65 Q258 65 258 80" stroke="hsl(var(--accent))" strokeWidth="2.5" opacity="0.35" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1 }} />
    </svg>
  ),

  "import-export": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Ship */}
      <motion.path d="M40 140 L60 170 L220 170 L240 140 Z" fill="hsl(var(--accent))" opacity="0.25" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 0.25 }} transition={{ duration: 0.7 }} />
      <motion.rect x="120" y="90" width="40" height="50" rx="2" fill="hsl(var(--accent))" opacity="0.2" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 }} style={{ transformOrigin: "140px 140px" }} />
      {/* Containers */}
      <motion.rect x="80" y="115" width="35" height="25" rx="2" fill="hsl(var(--accent))" opacity="0.3" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 0.3 }} transition={{ delay: 0.5 }} />
      <motion.rect x="165" y="115" width="35" height="25" rx="2" fill="hsl(var(--accent))" opacity="0.3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 0.3 }} transition={{ delay: 0.6 }} />
      {/* Waves */}
      <motion.path d="M10 185 Q40 175 70 185 Q100 195 130 185 Q160 175 190 185 Q220 195 250 185 Q270 178 280 182" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.4 }} />
      {/* Globe hint */}
      <motion.circle cx="250" cy="50" r="22" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.2" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
      <motion.ellipse cx="250" cy="50" rx="10" ry="22" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.15" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
    </svg>
  ),

  "oil-gas": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Oil rig */}
      <motion.path d="M100 40 L80 190 M180 40 L200 190" stroke="hsl(var(--accent))" strokeWidth="3" opacity="0.25" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.7 }} style={{ transformOrigin: "140px 40px" }} />
      <motion.line x1="90" y1="40" x2="190" y2="40" stroke="hsl(var(--accent))" strokeWidth="4" opacity="0.3" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 }} />
      {/* Cross beams */}
      <motion.line x1="88" y1="90" x2="192" y2="90" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.15" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5 }} />
      <motion.line x1="85" y1="140" x2="195" y2="140" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.15" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.6 }} />
      {/* Flame */}
      <motion.path d="M140 40 Q130 20 140 10 Q150 20 140 40" fill="hsl(var(--accent))" opacity="0.4" initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ delay: 0.8, duration: 0.6 }} />
      {/* Drop */}
      <motion.path d="M40 100 Q40 80 50 80 Q60 80 60 100 Q60 115 50 120 Q40 115 40 100" fill="hsl(var(--accent))" opacity="0.2" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 0.2 }} transition={{ delay: 1 }} />
      {/* Pipeline */}
      <motion.path d="M200 190 L260 190 L260 160" stroke="hsl(var(--accent))" strokeWidth="4" opacity="0.2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.5 }} />
    </svg>
  ),

  "insurance": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Shield */}
      <motion.path d="M140 30 L200 55 L200 120 Q200 170 140 190 Q80 170 80 120 L80 55 Z" fill="hsl(var(--accent))" opacity="0.15" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.7 }} />
      <motion.path d="M140 50 L185 68 L185 115 Q185 155 140 172 Q95 155 95 115 L95 68 Z" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.3 }} />
      {/* Checkmark */}
      <motion.path d="M120 110 L135 125 L165 90" stroke="hsl(var(--accent))" strokeWidth="4" opacity="0.5" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1 }} />
      {/* Umbrella */}
      <motion.path d="M230 80 Q230 55 250 55 Q270 55 270 80" fill="hsl(var(--accent))" opacity="0.2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
      <motion.line x1="250" y1="55" x2="250" y2="110" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.25" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 1.3 }} style={{ transformOrigin: "250px 55px" }} />
      {/* Document */}
      <motion.rect x="15" y="60" width="35" height="45" rx="4" fill="hsl(var(--accent))" opacity="0.15" initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 0.15 }} transition={{ delay: 0.8 }} />
    </svg>
  ),

  "retail": ({ className }) => (
    <svg viewBox="0 0 280 220" className={className} fill="none">
      {/* Shopping bag */}
      <motion.path d="M90 80 L80 190 L200 190 L190 80 Z" fill="hsl(var(--accent))" opacity="0.15" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 0.15 }} transition={{ duration: 0.6 }} />
      <motion.path d="M115 80 Q115 50 140 50 Q165 50 165 80" stroke="hsl(var(--accent))" strokeWidth="3" opacity="0.3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
      {/* Barcode */}
      {[0,1,2,3,4,5,6].map(i => (
        <motion.rect key={i} x={100 + i * 12} y={120} width={i % 2 === 0 ? 4 : 6} height={30} fill="hsl(var(--accent))" opacity="0.3" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5 + i * 0.05 }} style={{ transformOrigin: `${102 + i * 12}px 150px` }} />
      ))}
      {/* Price tag */}
      <motion.circle cx="230" cy="70" r="15" fill="hsl(var(--accent))" opacity="0.2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
      <motion.circle cx="225" cy="65" r="3" fill="hsl(var(--accent))" opacity="0.4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
      {/* Cart */}
      <motion.path d="M20 140 L40 140 L55 180 L15 180" stroke="hsl(var(--accent))" strokeWidth="2" opacity="0.2" fill="none" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1 }} />
      <motion.circle cx="25" cy="188" r="5" fill="hsl(var(--accent))" opacity="0.25" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }} />
      <motion.circle cx="50" cy="188" r="5" fill="hsl(var(--accent))" opacity="0.25" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
    </svg>
  ),
};

interface IndustryIllustrationProps {
  slug: string;
  className?: string;
}

const IndustryIllustration = ({ slug, className = "" }: IndustryIllustrationProps) => {
  const Illustration = illustrations[slug];
  if (!Illustration) return null;
  return (
    <div className={`w-full max-w-[280px] mx-auto ${className}`}>
      <Illustration />
    </div>
  );
};

export default IndustryIllustration;
