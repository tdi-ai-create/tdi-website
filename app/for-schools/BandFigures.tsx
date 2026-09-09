// ---------------------------------------------------------------------------
// The four shapes, drawn.
//
// Each offering is a different kind of ensemble, and the difference is the
// thing a leader has to understand before price means anything. These sit at
// the top of the offering cards rather than in a section of their own, because
// the comparison is only useful at the moment somebody is choosing.
//
// Drawn rather than photographed so they scale, stay sharp, and carry the
// page's own accent colours. Every figure is decorative reinforcement of the
// caption beside it, so each carries a role and a label for anyone who cannot
// see it.
// ---------------------------------------------------------------------------

const VIEWBOX = '0 0 210 108';

interface BandFigureProps {
  /** Which shape to draw. */
  shape: 'pulse' | 'focus' | 'cohort' | 'blueprint';
  /** The ensemble's name, in the card's accent colour. */
  name: string;
  /** One line saying what the picture is showing. */
  caption: string;
}

export default function BandFigure({ shape, name, caption }: BandFigureProps) {
  return (
    <div className="fs-band-fig">
      {shape === 'pulse' && <PulseFigure />}
      {shape === 'focus' && <FocusFigure />}
      {shape === 'cohort' && <CohortFigure />}
      {shape === 'blueprint' && <BlueprintFigure />}
      <p className="fs-band-name">{name}</p>
      <p className="fs-band-cap">{caption}</p>
    </div>
  );
}

/** Nobody is playing. Everyone sends a small signal in, and it reads as one line. */
function PulseFigure() {
  const xs = [18, 46, 74, 102, 130, 158, 186];
  const ys = [16, 11, 18, 9, 17, 12, 16];

  return (
    <svg
      viewBox={VIEWBOX}
      width="210"
      height="108"
      role="img"
      aria-label="Staff each sending a small signal in, read together as one line."
    >
      <g fill="var(--pulse)">
        {xs.map((x, i) => (
          <circle key={x} cx={x} cy={ys[i]} r="3.6" />
        ))}
      </g>
      <g stroke="#B9C0CC" strokeWidth="1.1" strokeDasharray="3 3">
        {xs.map((x, i) => (
          <path key={x} d={`M${x},${ys[i] + 5} L${x},52`} />
        ))}
      </g>
      <path
        d="M6,76 L34,76 L44,58 L58,92 L72,76 L104,76 L114,61 L128,89 L140,76 L172,76 L182,63 L194,83 L204,76"
        fill="none"
        stroke="var(--pulse)"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ranks of players, every one facing the same way. */
function FocusFigure() {
  const cols = [21, 63, 105, 147, 189];
  const rows = [6, 30, 54, 78];

  return (
    <svg
      viewBox={VIEWBOX}
      width="210"
      height="108"
      role="img"
      aria-label="Five ranks of players, every one facing the same direction."
    >
      <defs>
        <g id="fs-marcher" stroke="var(--navy)" fill="var(--navy)">
          <path d="M0,11 L0,3" strokeWidth="1.4" fill="none" />
          <path
            d="M-2.8,5.6 L0,2 L2.8,5.6"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="15.5" r="3.5" stroke="none" />
        </g>
      </defs>
      {cols.map((x) => rows.map((y) => <use key={`${x}-${y}`} href="#fs-marcher" x={x} y={y} />))}
    </svg>
  );
}

/** A ring facing inward. Colours differ, so some share a part and some do not.
    Every one of them carries the same mark, because the instrument is the same. */
function CohortFigure() {
  const singers = [
    { x: 105, y: 23, c: 'var(--cohort)' },
    { x: 139, y: 38, c: 'var(--cohort)' },
    { x: 153, y: 74, c: 'var(--focus)' },
    { x: 128, y: 100, c: 'var(--cohort)' },
    { x: 82, y: 100, c: 'var(--pulse)' },
    { x: 57, y: 74, c: 'var(--cohort)' },
    { x: 71, y: 38, c: 'var(--focus)' },
  ];

  return (
    <svg
      viewBox={VIEWBOX}
      width="210"
      height="108"
      role="img"
      aria-label="A small ring of singers facing each other. Different parts, one instrument."
    >
      <circle cx="105" cy="54" r="36" fill="none" stroke="#D8DCE4" strokeWidth="1.1" strokeDasharray="4 4" />
      <g strokeWidth="1.8" fill="none" strokeLinecap="round">
        {singers.map((s) => (
          <path key={`m-${s.x}-${s.y}`} d={`M${s.x - 6},${s.y - 17} q3,-4.5 6,0 q3,4.5 6,0`} stroke={s.c} />
        ))}
      </g>
      <g>
        {singers.map((s) => (
          <circle key={`s-${s.x}-${s.y}`} cx={s.x} cy={s.y} r="5" fill={s.c} />
        ))}
      </g>
    </svg>
  );
}

/** Every player on a different line, every line running back to one listener. */
function BlueprintFigure() {
  const players = [
    { x: 20, y: 45, c: 'var(--focus)' },
    { x: 52, y: 65, c: 'var(--pulse)' },
    { x: 72, y: 31, c: 'var(--cohort)' },
    { x: 104, y: 22, c: 'var(--gold)' },
    { x: 138, y: 27, c: 'var(--pulse)' },
    { x: 160, y: 58, c: 'var(--focus)' },
    { x: 192, y: 40, c: 'var(--cohort)' },
  ];

  return (
    <svg
      viewBox={VIEWBOX}
      width="210"
      height="108"
      role="img"
      aria-label="Seven players, each on a different line, every line running back to someone listening."
    >
      <g stroke="#B9C0CC" strokeWidth="1.1" fill="none">
        {players.map((p) => (
          <path key={`l-${p.x}`} d={`M105,88 L${p.x},${p.y}`} />
        ))}
      </g>
      <g fill="none" strokeWidth="1.8" strokeLinecap="round">
        {players.map((p) => (
          <path key={`m-${p.x}`} d={`M${p.x - 6},${p.y - 12} q3,-4.5 6,0 q3,4.5 6,0`} stroke={p.c} />
        ))}
      </g>
      <g>
        {players.map((p) => (
          <circle key={`p-${p.x}`} cx={p.x} cy={p.y} r="5" fill={p.c} />
        ))}
      </g>
      <circle cx="105" cy="88" r="9.5" fill="none" stroke="var(--navy)" strokeWidth="1.6" />
      <circle cx="105" cy="88" r="4" fill="var(--navy)" />
    </svg>
  );
}
