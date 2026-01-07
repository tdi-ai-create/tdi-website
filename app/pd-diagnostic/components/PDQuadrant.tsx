// PDQuadrant.tsx - The 4 Types of PD Visual

export default function PDQuadrant({ highlightQuadrant }: { highlightQuadrant?: 'A' | 'B' | 'C' | 'D' | null }) {
  const quadrants = [
    {
      id: 'B',
      name: 'INSPIRATION-DRIVEN PD',
      tagline: 'High energy, short-term lift',
      position: 'top-left',
      bgColor: '#D4E4ED',
      textColor: '#1e2749',
      taglineColor: '#666666'
    },
    {
      id: 'D',
      name: 'EMBEDDED PRACTICE',
      tagline: 'Consistent support, sustained outcomes',
      position: 'top-right',
      bgColor: '#1B4965',
      textColor: '#ffffff',
      taglineColor: '#B8D4E8'
    },
    {
      id: 'A',
      name: 'COMPLIANCE-FOCUSED PD',
      tagline: 'Meets requirements, limited classroom translation',
      position: 'bottom-left',
      bgColor: '#E8E8E8',
      textColor: '#1e2749',
      taglineColor: '#666666'
    },
    {
      id: 'C',
      name: 'FRAGMENTED GROWTH',
      tagline: 'Strong pockets, uneven experience',
      position: 'bottom-right',
      bgColor: '#DDE3E8',
      textColor: '#1e2749',
      taglineColor: '#666666'
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-bold text-center mb-6" style={{ color: '#1B4965' }}>
        The 4 Types of PD
      </h3>

      {/* Grid Container */}
      <div className="relative">
        {/* Y-Axis Label */}
        <div className="absolute -left-8 md:-left-12 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
          <span className="text-xs md:text-sm font-bold tracking-wide" style={{ color: '#333333' }}>
            STAFF COVERAGE
          </span>
        </div>

        {/* Y-Axis Range Labels */}
        <div className="absolute -left-4 md:-left-6 top-4 text-xs" style={{ color: '#666666' }}>
          <span className="writing-mode-vertical">Whole-Staff</span>
        </div>
        <div className="absolute -left-4 md:-left-6 bottom-4 text-xs" style={{ color: '#666666' }}>
          <span className="writing-mode-vertical">Core-Focused</span>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-1 ml-4">
          {/* Top Row */}
          {quadrants.filter(q => q.position.includes('top')).map(quad => (
            <div
              key={quad.id}
              className={`
                aspect-square p-4 md:p-6 rounded-xl flex flex-col justify-center items-center text-center
                transition-all duration-300
                ${highlightQuadrant === quad.id ? 'ring-4 ring-offset-2 ring-blue-500 scale-105' : ''}
                ${highlightQuadrant && highlightQuadrant !== quad.id ? 'opacity-40' : ''}
              `}
              style={{ backgroundColor: quad.bgColor }}
            >
              <h4
                className="text-sm md:text-base font-bold leading-tight mb-2"
                style={{ color: quad.textColor }}
              >
                {quad.name}
              </h4>
              <p
                className="text-xs md:text-sm italic"
                style={{ color: quad.taglineColor }}
              >
                {quad.tagline}
              </p>
            </div>
          ))}

          {/* Bottom Row */}
          {quadrants.filter(q => q.position.includes('bottom')).map(quad => (
            <div
              key={quad.id}
              className={`
                aspect-square p-4 md:p-6 rounded-xl flex flex-col justify-center items-center text-center
                transition-all duration-300
                ${highlightQuadrant === quad.id ? 'ring-4 ring-offset-2 ring-blue-500 scale-105' : ''}
                ${highlightQuadrant && highlightQuadrant !== quad.id ? 'opacity-40' : ''}
              `}
              style={{ backgroundColor: quad.bgColor }}
            >
              <h4
                className="text-sm md:text-base font-bold leading-tight mb-2"
                style={{ color: quad.textColor }}
              >
                {quad.name}
              </h4>
              <p
                className="text-xs md:text-sm italic"
                style={{ color: quad.taglineColor }}
              >
                {quad.tagline}
              </p>
            </div>
          ))}
        </div>

        {/* X-Axis Label */}
        <div className="text-center mt-4">
          <span className="text-xs md:text-sm font-bold tracking-wide" style={{ color: '#333333' }}>
            PD STRUCTURE
          </span>
        </div>

        {/* X-Axis Range Labels */}
        <div className="flex justify-between px-4 mt-1">
          <span className="text-xs" style={{ color: '#666666' }}>Event-Based</span>
          <span className="text-xs" style={{ color: '#666666' }}>System-Based</span>
        </div>

        {/* Subtle Progress Arrow (optional - dashed line from bottom-left to top-right) */}
        <div className="absolute inset-0 pointer-events-none ml-4">
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#999999" />
              </marker>
            </defs>
            <line
              x1="15" y1="85" x2="85" y2="15"
              stroke="#999999"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs mt-4 italic" style={{ color: '#888888' }}>
        Most schools don't start in Embedded Practice — they move there over time.
      </p>
    </div>
  );
}
