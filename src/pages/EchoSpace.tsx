import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import EchoStateNetwork from '../components/echospace/EchoStateNetwork';
import LiquidStateMachine from '../components/echospace/LiquidStateMachine';
import SemanticRidge from '../components/echospace/SemanticRidge';
import DeclarativeReservoir from '../components/echospace/DeclarativeReservoir';

export default function EchoSpace() {
  const [activeComponent, setActiveComponent] = useState('overview');

  const components = [
    { id: 'overview', label: 'System Overview' },
    { id: 'esn', label: 'Echo State Network' },
    { id: 'lsm', label: 'Liquid State Machine' },
    { id: 'ridge', label: 'Semantic Ridge' },
    { id: 'reservoir', label: 'Declarative Reservoir' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">
            EchoSpace Memory Architecture
          </h1>

          {/* Navigation */}
          <div className="flex flex-wrap gap-1 border-b dark:border-gray-700 mb-6">
            {components.map(component => (
              <button
                key={component.id}
                onClick={() => setActiveComponent(component.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                  ${activeComponent === component.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {component.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Visualization */}
            <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              {activeComponent === 'overview' && <SystemOverview />}
              {activeComponent === 'esn' && <EchoStateNetwork />}
              {activeComponent === 'lsm' && <LiquidStateMachine />}
              {activeComponent === 'ridge' && <SemanticRidge />}
              {activeComponent === 'reservoir' && <DeclarativeReservoir />}
            </div>

            {/* Right Column - Controls & Metrics */}
            <div className="space-y-4">
              <ComponentMetrics component={activeComponent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemOverview() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    // Create system components
    const components = [
      { id: 'esn', label: 'Episodic ESN', x: width * 0.25, y: height * 0.3 },
      { id: 'lsm', label: 'Procedural LSM', x: width * 0.75, y: height * 0.3 },
      { id: 'ridge', label: 'Semantic Ridge', x: width * 0.25, y: height * 0.7 },
      { id: 'reservoir', label: 'Declarative Reservoir', x: width * 0.75, y: height * 0.7 }
    ];

    // Draw connections
    const links = svg.append('g');
    
    // ESN to LSM
    links.append('path')
      .attr('d', d3.line()([[components[0].x, components[0].y], 
                           [components[1].x, components[1].y]]))
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)');

    // Ridge to Reservoir
    links.append('path')
      .attr('d', d3.line()([[components[2].x, components[2].y],
                           [components[3].x, components[3].y]]))
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)');

    // Vertical connections
    components.slice(0, 2).forEach((comp, i) => {
      links.append('path')
        .attr('d', d3.line()([[comp.x, comp.y],
                             [components[i + 2].x, components[i + 2].y]]))
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrow)');
    });

    // Add arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#3b82f6');

    // Draw components
    const nodes = svg.append('g')
      .selectAll('g')
      .data(components)
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.append('circle')
      .attr('r', 30)
      .attr('fill', '#3b82f6')
      .attr('class', 'transition-colors duration-300 hover:fill-blue-400');

    nodes.append('text')
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium fill-current dark:text-white')
      .text(d => d.label);

  }, []);

  return <svg ref={svgRef} className="w-full h-full" />;
}

function ComponentMetrics({ component }: { component: string }) {
  const { data: metrics } = useQuery({
    queryKey: ['echoMetrics', component],
    queryFn: async () => ({
      overview: {
        totalNodes: 256,
        connections: 1024,
        accuracy: 0.92,
        latency: '45ms'
      },
      esn: {
        reservoirSize: 100,
        spectralRadius: 0.95,
        inputScaling: 0.8,
        performance: 0.88
      },
      lsm: {
        neurons: 1000,
        synapses: 10000,
        firingRate: '25Hz',
        accuracy: 0.85
      },
      ridge: {
        dimensions: 512,
        regularization: 0.1,
        mappingAccuracy: 0.9,
        compression: 0.75
      },
      reservoir: {
        capacity: 1000,
        utilization: 0.65,
        retrievalSpeed: '30ms',
        consistency: 0.95
      }
    })
  });

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="text-lg font-medium mb-4 dark:text-white">
          System Metrics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(metrics[component as keyof typeof metrics]).map(([key, value]) => (
            <div key={key}>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              <div className="text-lg font-medium dark:text-white">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}