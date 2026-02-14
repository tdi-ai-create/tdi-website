'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

interface StateData {
  state: string;
  count: number;
}

interface USMapChartProps {
  data: StateData[];
  onStateClick?: (state: string) => void;
  selectedState?: string;
}

// State name to abbreviation mapping
const stateAbbreviations: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC', 'Puerto Rico': 'PR'
};

// Abbreviation to full name mapping
const stateNames: Record<string, string> = Object.fromEntries(
  Object.entries(stateAbbreviations).map(([name, abbr]) => [abbr, name])
);

export default function USMapChart({ data, onStateClick, selectedState }: USMapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a map of state abbreviation to count
  const stateDataMap = new Map<string, number>();
  data.forEach(d => {
    // Handle both abbreviations and full names
    const abbr = d.state.length === 2 ? d.state : stateAbbreviations[d.state];
    if (abbr) {
      stateDataMap.set(abbr, d.count);
    }
  });

  const maxCount = Math.max(...data.map(d => d.count), 1);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 500;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Color scale using TDI teal
    const colorScale = d3.scaleQuantile<string>()
      .domain([0, maxCount])
      .range(['#F3F4F6', '#E8F6F7', '#A8DDE0', '#5BBEC4', '#3A9BA0', '#1a6b69']);

    // Fetch US topology
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(res => res.json())
      .then((us: any) => {
        setIsLoading(false);

        const states = topojson.feature(us, us.objects.states) as any;

        // Projection for continental US
        const projection = d3.geoAlbersUsa()
          .fitSize([width, height], states);

        const path = d3.geoPath().projection(projection);

        // Draw states
        svg.append('g')
          .selectAll('path')
          .data(states.features)
          .join('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => {
            const stateName = d.properties.name;
            const abbr = stateAbbreviations[stateName];
            const count = stateDataMap.get(abbr) || 0;
            return count > 0 ? colorScale(count) : '#F3F4F6';
          })
          .attr('stroke', (d: any) => {
            const stateName = d.properties.name;
            const abbr = stateAbbreviations[stateName];
            return selectedState === abbr ? '#2B3A67' : '#FFFFFF';
          })
          .attr('stroke-width', (d: any) => {
            const stateName = d.properties.name;
            const abbr = stateAbbreviations[stateName];
            return selectedState === abbr ? 2 : 0.5;
          })
          .attr('cursor', 'pointer')
          .on('mouseenter', function(event: MouseEvent, d: any) {
            const stateName = d.properties.name;
            const abbr = stateAbbreviations[stateName];
            const count = stateDataMap.get(abbr) || 0;

            d3.select(this)
              .attr('stroke', '#2B3A67')
              .attr('stroke-width', 2);

            if (tooltipRef.current) {
              tooltipRef.current.style.display = 'block';
              tooltipRef.current.style.left = `${event.offsetX + 10}px`;
              tooltipRef.current.style.top = `${event.offsetY - 30}px`;
              tooltipRef.current.innerHTML = `
                <div class="font-medium">${stateName}</div>
                <div class="text-sm">${count} user${count !== 1 ? 's' : ''}</div>
              `;
            }
          })
          .on('mousemove', function(event: MouseEvent) {
            if (tooltipRef.current) {
              tooltipRef.current.style.left = `${event.offsetX + 10}px`;
              tooltipRef.current.style.top = `${event.offsetY - 30}px`;
            }
          })
          .on('mouseleave', function(_, d: any) {
            const stateName = d.properties.name;
            const abbr = stateAbbreviations[stateName];
            d3.select(this)
              .attr('stroke', selectedState === abbr ? '#2B3A67' : '#FFFFFF')
              .attr('stroke-width', selectedState === abbr ? 2 : 0.5);

            if (tooltipRef.current) {
              tooltipRef.current.style.display = 'none';
            }
          })
          .on('click', function(_, d: any) {
            const stateName = d.properties.name;
            const abbr = stateAbbreviations[stateName];
            if (onStateClick) {
              onStateClick(abbr);
            }
          });

        // Add state borders
        svg.append('path')
          .datum(topojson.mesh(us, us.objects.states, (a: any, b: any) => a !== b))
          .attr('fill', 'none')
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 0.5)
          .attr('d', path as any);
      })
      .catch(err => {
        console.error('Error loading map:', err);
        setError('Failed to load map');
        setIsLoading(false);
      });
  }, [data, selectedState, maxCount, onStateClick]);

  if (error) {
    return (
      <div className="h-[350px] flex items-center justify-center text-gray-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BBEC4]"></div>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-[350px]" />
      <div
        ref={tooltipRef}
        className="absolute hidden bg-[#2B3A67] text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-20"
        style={{ display: 'none' }}
      />
      {/* Color Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#F3F4F6' }} />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#A8DDE0' }} />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#5BBEC4' }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#1a6b69' }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
