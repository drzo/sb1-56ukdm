import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useAtomSpace } from '../../lib/atomspace';
import { AtomGraphRenderer } from './AtomGraphRenderer';
import { AtomGraphControls } from './AtomGraphControls';

export const AtomGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const atomSpace = useAtomSpace();

  return (
    <div className="space-y-4">
      <AtomGraphControls />
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <AtomGraphRenderer svgRef={svgRef} atoms={Array.from(atomSpace.atoms.values())} />
      </div>
    </div>
  );
};