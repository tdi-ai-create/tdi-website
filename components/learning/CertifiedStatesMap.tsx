'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const stateAbbreviations: Record<string, string> = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE',
  '11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA',
  '20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN',
  '28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM',
  '36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI',
  '45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA',
  '54':'WV','55':'WI','56':'WY',
};

const stateNames: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',
  CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',
  LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',
  MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',
  NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',
  OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',
  SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
};

export default function CertifiedStatesMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!svgRef.current) return;

    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(r => r.json())
      .then((us: any) => {
        const states = topojson.feature(us, us.objects.states) as any;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 960;
        const height = 600;
        const projection = d3.geoAlbersUsa().fitSize([width, height], states);
        const path = d3.geoPath().projection(projection);

        svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

        const tooltip = d3.select(tooltipRef.current);

        svg.append('g')
          .selectAll('path')
          .data(states.features)
          .join('path')
          .attr('d', path as any)
          .attr('fill', '#1e2749')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.2)
          .style('cursor', 'pointer')
          .style('transition', 'fill 0.18s ease')
          .on('mouseover', function(event: any, d: any) {
            d3.select(this).attr('fill', '#2B3A67');
            const fips = String(d.id).padStart(2, '0');
            const abbr = stateAbbreviations[fips];
            const name = stateNames[abbr] || abbr || 'State';
            tooltip
              .style('opacity', 1)
              .html(`
                <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:#1e2749">${name}</div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <div style="width:22px;height:22px;border-radius:50%;background:#ffba06;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <span style="font-weight:700;font-size:14px;color:#1e2749;">Approved!</span>
                </div>
                <div style="font-size:12px;color:#6B7280;line-height:1.4;">Teachers Deserve It PD Credits are approved in this state</div>
              `);
          })
          .on('mousemove', function(event: any) {
            tooltip
              .style('left', (event.pageX + 14) + 'px')
              .style('top', (event.pageY - 14) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this).attr('fill', '#1e2749');
            tooltip.style('opacity', 0);
          });

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Map load failed:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Loading map...</div>
      )}
      <svg ref={svgRef} style={{ width: '100%', height: 'auto', maxWidth: 960 }} />
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          opacity: 0,
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: 10,
          padding: '12px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          pointerEvents: 'none',
          transition: 'opacity 0.15s ease',
          zIndex: 50,
          maxWidth: 280,
        }}
      />
    </div>
  );
}
