/**
 * Decorative line illustrations for the About feature cards.
 * Drawn in the theme's primary/accent colours so they work in light and dark mode,
 * and faded out towards the card's text with a mask.
 */
import { cn } from "@/lib/utils";

export type FeatureArtName = "fullstack" | "ai" | "uiux" | "api" | "data" | "quality";

const P = "hsl(var(--primary))";
const A = "hsl(var(--accent))";
const MONO = { fontFamily: "'JetBrains Mono', monospace" };

const FullStack = () => (
  <>
    {[
      { y: 18, label: "UI", c: P },
      { y: 62, label: "API", c: A },
      { y: 106, label: "DB", c: P },
    ].map((layer) => (
      <g key={layer.label}>
        <rect x="62" y={layer.y} width="124" height="30" rx="7" fill={layer.c} fillOpacity="0.08" stroke={layer.c} strokeWidth="1.5" />
        <circle cx="76" cy={layer.y + 15} r="3.5" fill={layer.c} />
        <rect x="88" y={layer.y + 11} width="44" height="3" rx="1.5" fill={layer.c} opacity="0.6" />
        <rect x="88" y={layer.y + 18} width="28" height="3" rx="1.5" fill={layer.c} opacity="0.35" />
        <text x="174" y={layer.y + 19.5} textAnchor="end" fontSize="9" fill={layer.c} style={MONO}>
          {layer.label}
        </text>
      </g>
    ))}
    <path d="M44 22 V132" stroke={P} strokeWidth="1.5" strokeDasharray="4 5" className="feature-art-flow" />
    <path d="M38 124 L44 134 L50 124" stroke={P} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const AI = () => {
  const layers = [
    [40, 80, 120].map((y) => ({ x: 70, y })),
    [25, 62, 98, 135].map((y) => ({ x: 120, y })),
    [55, 105].map((y) => ({ x: 170, y })),
  ];
  return (
    <>
      {layers.slice(0, -1).flatMap((layer, li) =>
        layer.flatMap((a, ai) =>
          layers[li + 1].map((b, bi) => (
            <line
              key={`${li}-${ai}-${bi}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={(ai + bi) % 3 === 0 ? A : P}
              strokeOpacity={(ai + bi) % 3 === 0 ? 0.7 : 0.35}
              strokeWidth="1.2"
            />
          )),
        ),
      )}
      {layers.flat().map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="7" fill="hsl(var(--card))" stroke={i % 4 === 0 ? A : P} strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="2.5" fill={i % 4 === 0 ? A : P} className="feature-art-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        </g>
      ))}
      <text x="170" y="150" textAnchor="middle" fontSize="8" fill={A} style={MONO}>
        LLM
      </text>
    </>
  );
};

const UIUX = () => (
  <>
    <rect x="48" y="14" width="142" height="122" rx="9" fill={P} fillOpacity="0.05" stroke={P} strokeWidth="1.5" />
    <path d="M48 32 H190" stroke={P} strokeWidth="1.2" strokeOpacity="0.6" />
    {[60, 70, 80].map((x, i) => (
      <circle key={x} cx={x} cy="23" r="3" fill={i === 0 ? A : P} opacity={0.4 + i * 0.2} />
    ))}
    <rect x="60" y="42" width="78" height="8" rx="4" fill={P} opacity="0.55" />
    <rect x="60" y="56" width="54" height="5" rx="2.5" fill={P} opacity="0.3" />
    <rect x="60" y="68" width="34" height="11" rx="5.5" fill={A} opacity="0.75" />
    <rect x="148" y="42" width="30" height="37" rx="6" fill={A} fillOpacity="0.15" stroke={A} strokeWidth="1.2" />
    {[60, 102, 144].map((x) => (
      <g key={x}>
        <rect x={x} y="90" width="34" height="36" rx="5" fill={P} fillOpacity="0.08" stroke={P} strokeWidth="1.2" strokeOpacity="0.6" />
        <rect x={x + 6} y="114" width="20" height="3" rx="1.5" fill={P} opacity="0.5" />
      </g>
    ))}
    {/* cursor */}
    <g className="feature-art-float">
      <path d="M150 60 L150 80 L155 75 L159 84 L163 82 L159 73 L166 73 Z" fill="hsl(var(--foreground))" stroke="hsl(var(--card))" strokeWidth="1.2" />
    </g>
  </>
);

const API = () => (
  <>
    <rect x="34" y="40" width="46" height="70" rx="8" fill={P} fillOpacity="0.06" stroke={P} strokeWidth="1.5" />
    <text x="57" y="80" textAnchor="middle" fontSize="16" fill={P} style={MONO}>
      {"{ }"}
    </text>
    <rect x="148" y="40" width="46" height="70" rx="8" fill={A} fillOpacity="0.06" stroke={A} strokeWidth="1.5" />
    {[56, 70, 84].map((y) => (
      <rect key={y} x="157" y={y} width="28" height="5" rx="2.5" fill={A} opacity="0.5" />
    ))}
    <path d="M84 62 H144" stroke={P} strokeWidth="1.5" strokeDasharray="5 5" className="feature-art-flow" />
    <path d="M139 57 L145 62 L139 67" stroke={P} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M144 90 H84" stroke={A} strokeWidth="1.5" strokeDasharray="5 5" className="feature-art-flow" />
    <path d="M89 85 L83 90 L89 95" stroke={A} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* lock */}
    <g transform="translate(114 18)">
      <path d="M-7 4 V-1 a7 7 0 0 1 14 0 V4" fill="none" stroke={P} strokeWidth="1.8" />
      <rect x="-11" y="4" width="22" height="17" rx="4" fill="hsl(var(--card))" stroke={P} strokeWidth="1.8" />
      <circle cx="0" cy="12" r="2.4" fill={P} />
    </g>
    <text x="114" y="56" textAnchor="middle" fontSize="7.5" fill={P} style={MONO}>
      JWT
    </text>
    <text x="114" y="108" textAnchor="middle" fontSize="7.5" fill={A} style={MONO}>
      200 OK
    </text>
  </>
);

const Cylinder = ({ x, color, dashed }: { x: number; color: string; dashed?: boolean }) => (
  <g stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.07" strokeDasharray={dashed ? "4 4" : undefined}>
    <path d={`M${x} 46 V112 a26 9 0 0 0 52 0 V46`} />
    <ellipse cx={x + 26} cy="46" rx="26" ry="9" />
    <path d={`M${x} 68 a26 9 0 0 0 52 0`} fill="none" />
    <path d={`M${x} 90 a26 9 0 0 0 52 0`} fill="none" />
  </g>
);

const Data = () => (
  <>
    <Cylinder x={36} color={P} dashed />
    <Cylinder x={134} color={A} />
    <path d="M96 79 H128" stroke={P} strokeWidth="1.8" strokeDasharray="4 4" className="feature-art-flow" />
    <path d="M122 73 L129 79 L122 85" stroke={P} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <text x="62" y="140" textAnchor="middle" fontSize="8.5" fill={P} style={MONO}>
      v1
    </text>
    <text x="160" y="140" textAnchor="middle" fontSize="8.5" fill={A} style={MONO}>
      v2
    </text>
    <text x="112" y="68" textAnchor="middle" fontSize="7" fill={P} style={MONO} opacity="0.8">
      migrate
    </text>
  </>
);

const Quality = () => {
  const stages = [
    { x: 46, label: "build" },
    { x: 92, label: "lint" },
    { x: 138, label: "test" },
    { x: 184, label: "ship" },
  ];
  return (
    <>
      {/* git branch */}
      <path d="M46 34 H184" stroke={P} strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M70 34 C 80 34, 80 14, 92 14 H 128 C 140 14, 140 34, 150 34" stroke={A} strokeWidth="1.5" fill="none" />
      {[46, 92, 110, 128, 184].map((x, i) => (
        <circle key={i} cx={x} cy={x > 90 && x < 130 ? 14 : 34} r="3.5" fill="hsl(var(--card))" stroke={x > 90 && x < 130 ? A : P} strokeWidth="1.5" />
      ))}
      {/* pipeline */}
      <path d="M46 86 H184" stroke={P} strokeWidth="1.5" strokeDasharray="4 5" className="feature-art-flow" />
      {stages.map((s, i) => (
        <g key={s.label}>
          <circle cx={s.x} cy="86" r="14" fill="hsl(var(--card))" stroke={i === stages.length - 1 ? A : P} strokeWidth="1.8" />
          <path
            d={`M${s.x - 5.5} 86 l3.8 4 l7.2 -8`}
            stroke={i === stages.length - 1 ? A : P}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x={s.x} y="116" textAnchor="middle" fontSize="8" fill={P} style={MONO} opacity="0.85">
            {s.label}
          </text>
        </g>
      ))}
      <text x="115" y="146" textAnchor="middle" fontSize="7.5" fill={A} style={MONO}>
        SAST · secrets · deps ✓
      </text>
    </>
  );
};

const art: Record<FeatureArtName, () => JSX.Element> = {
  fullstack: FullStack,
  ai: AI,
  uiux: UIUX,
  api: API,
  data: Data,
  quality: Quality,
};

const FeatureArt = ({ name, className }: { name: FeatureArtName; className?: string }) => {
  const Art = art[name];
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 160"
      preserveAspectRatio="xMaxYMin meet"
      className={cn(
        "feature-art pointer-events-none absolute right-0 top-0 h-[78%] w-[82%] opacity-45 transition-all duration-700 ease-out group-hover:-translate-x-1 group-hover:translate-y-1 group-hover:scale-105 group-hover:opacity-90",
        className,
      )}
    >
      <Art />
    </svg>
  );
};

export default FeatureArt;
