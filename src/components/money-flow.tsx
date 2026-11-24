import { money } from '@/lib/format';

export type FlowItem = { key: string; label: string; value: number; color: string };

// SVG-ийн дотоод хэмжээ — дэлгэцийн өргөнд тааруулж томруулна.
const W = 340;
const H = 340;
const GAP = 10;
const SOURCE_W = 84;
const NODE_W = 24;
const LABEL_W = 116;
const LABEL_H = 32;

/** Орлогоос ангилал руу урсах Sankey маягийн график. */
export function MoneyFlow({ income, items }: { income: number; items: FlowItem[] }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const n = items.length;
  const usable = H - GAP * (n - 1);
  // Өгөгдөлгүй үед бүгдийг тэнцүү харуулна. Жижиг ангилал хамгийн багадаа 14px.
  const raw = items.map((i) => Math.max(14, total > 0 ? (i.value / total) * usable : usable / n));
  const scale = usable / raw.reduce((s, h) => s + h, 0);
  const hs = raw.map((h) => h * scale);

  const nodeX = W - LABEL_W - NODE_W;
  const sourceY = (H - usable) / 2;

  const flows: { it: FlowItem; d: string; y: number; h: number }[] = [];
  for (let i = 0, ly = sourceY, ry = 0; i < n; i++) {
    const h = hs[i];
    const mx = (SOURCE_W + nodeX) / 2;
    const d = `M${SOURCE_W},${ly} C${mx},${ly} ${mx},${ry} ${nodeX},${ry} L${nodeX},${ry + h} C${mx},${ry + h} ${mx},${ly + h} ${SOURCE_W},${ly + h} Z`;
    flows.push({ it: items[i], d, y: ry, h });
    ly += h;
    ry += h + GAP;
  }

  // Шошгуудыг давхцуулахгүйгээр байрлуулна (доош түлхээд, хэтэрвэл дээш шилжүүлнэ).
  const tops: number[] = [];
  flows.forEach(({ y, h }, i) => {
    const want = y + h / 2 - LABEL_H / 2;
    tops.push(i === 0 ? Math.max(0, want) : Math.max(want, tops[i - 1] + LABEL_H));
  });
  for (let i = n - 1; i >= 0; i--) {
    tops[i] = Math.min(tops[i], i === n - 1 ? H - LABEL_H : tops[i + 1] - LABEL_H);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Мөнгөний урсгал">
      {flows.map(({ it, d }) => (
        <path key={`f-${it.key}`} d={d} fill={it.color} opacity={0.35} />
      ))}
      <rect x={0} y={sourceY} width={SOURCE_W} height={usable} rx={14} fill="#4fc3f7" />
      <text x={SOURCE_W / 2} y={H / 2 - 4} textAnchor="middle" fill="white" fontSize={14} fontWeight={600}>
        Орлого
      </text>
      <text x={SOURCE_W / 2} y={H / 2 + 14} textAnchor="middle" fill="white" fontSize={11}>
        {money(income)}
      </text>
      {flows.map(({ it, y, h }, i) => (
        <g key={`n-${it.key}`}>
          <rect x={nodeX} y={y} width={NODE_W} height={h} rx={6} fill={it.color} />
          <text x={nodeX + NODE_W + 8} y={tops[i] + 13} fontSize={13} fontWeight={600} fill="#1f2933">
            {it.label}
          </text>
          <text x={nodeX + NODE_W + 8} y={tops[i] + 28} fontSize={11} fill="#7b8794">
            {money(it.value)} ({total > 0 ? Math.round((it.value / total) * 100) : 0}%)
          </text>
        </g>
      ))}
    </svg>
  );
}
