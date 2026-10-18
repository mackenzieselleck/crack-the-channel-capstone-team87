'use client';

// draws circuit from whitelisted tokens
const COL = 56;
const ROW = 56;
const LEFT = 52;
const BOX = 36;

export function gateLabel(token: string) {
  const [name] = token.split(' ');
  return name === 'cx' ? 'CNOT' : name.toUpperCase();
}

// used for accessible labels
export function describeToken(token: string) {
  const [name, a, b] = token.split(' ');
  return name === 'cx' ? `CNOT ${a}→${b}` : `${name.toUpperCase()} on q${a}`;
}

export function CircuitDiagram({
  tokens,
  numQubits,
  onRemove,
  label,
}: {
  tokens: string[];
  numQubits: number;
  // when set, gates become buttons that remove themselves
  onRemove?: (index: number) => void;
  label: string;
}) {
  const cols = Math.max(tokens.length, 1);
  // minimum width keeps empty-circuit message readable
  const width = Math.max(LEFT + cols * COL + 24, 360);
  const height = numQubits * ROW + 8;
  const y = (q: number) => 4 + ROW / 2 + q * ROW;
  const x = (i: number) => LEFT + i * COL + COL / 2;

  return (
    <div className="overflow-x-auto rounded-lg border border-[#233049] bg-[#0D1728] p-3">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label}: ${tokens.length ? tokens.map(describeToken).join(', ') : 'no gates'}`}
        className="block"
      >
        {Array.from({ length: numQubits }, (_, q) => (
          <g key={q}>
            <text x={8} y={y(q) + 5} fontSize="13" fill="#8B95AC" fontFamily="ui-monospace, monospace">
              q{q}
            </text>
            <line x1={LEFT - 12} x2={width - 8} y1={y(q)} y2={y(q)} stroke="#34425A" strokeWidth="2" />
          </g>
        ))}

        {tokens.length === 0 && (
          <text x={LEFT + 6} y={y(0) - 12} fontSize="12" fill="#69758A">
            No gates yet (identity)
          </text>
        )}

        {tokens.map((token, i) => {
          const [name, a, b] = token.split(' ');
          const removable = !!onRemove;
          const common = removable
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': `Remove ${describeToken(token)} (gate ${i + 1})`,
                onClick: () => onRemove(i),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRemove(i);
                  }
                },
                className: 'cursor-pointer outline-none [&:focus-visible>*]:stroke-white [&:hover>*]:opacity-80',
              }
            : {};

          if (name === 'cx') {
            const c = Number(a);
            const t = Number(b);
            return (
              <g key={i} {...common}>
                <line x1={x(i)} x2={x(i)} y1={y(c)} y2={y(t)} stroke="#4C8DFF" strokeWidth="2" />
                <circle cx={x(i)} cy={y(c)} r={6} fill="#4C8DFF" />
                <circle cx={x(i)} cy={y(t)} r={12} fill="#0D1728" stroke="#4C8DFF" strokeWidth="2" />
                <line x1={x(i) - 12} x2={x(i) + 12} y1={y(t)} y2={y(t)} stroke="#4C8DFF" strokeWidth="2" />
                <line x1={x(i)} x2={x(i)} y1={y(t) - 12} y2={y(t) + 12} stroke="#4C8DFF" strokeWidth="2" />
              </g>
            );
          }
          const q = Number(a);
          return (
            <g key={i} {...common}>
              <rect
                x={x(i) - BOX / 2}
                y={y(q) - BOX / 2}
                width={BOX}
                height={BOX}
                rx={6}
                fill="#14284A"
                stroke="#4C8DFF"
                strokeWidth="1.5"
              />
              <text
                x={x(i)}
                y={y(q) + 5}
                textAnchor="middle"
                fontSize="15"
                fontWeight="600"
                fill="#E7ECF5"
              >
                {gateLabel(token)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
