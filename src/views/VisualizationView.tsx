import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PathwayVisualizer } from '@/bio/visualization/PathwayVisualizer'
import { ProteinNetworkVisualizer } from '@/bio/visualization/ProteinNetworkVisualizer'
import { BioAtomSpace } from '@/bio/core/BioAtomSpace'
import { ViewSelector } from '@/components/visualization/ViewSelector'
import { NetworkLayout } from '@/components/visualization/NetworkLayout'
import { Logger } from '@/cogutil/Logger'

const bioAtomSpace = new BioAtomSpace();

export function VisualizationView() {
  const [activeView, setActiveView] = useState<'protein' | 'pathway'>('protein');
  const [networkData, setNetworkData] = useState({ nodes: [], edges: [] });

  const handleViewChange = (view: 'protein' | 'pathway') => {
    setActiveView(view);
    // Reset network data when changing views
    setNetworkData({ nodes: [], edges: [] });
  };

  const handleDepthChange = async (depth: number) => {
    try {
      // Update network data based on active view and depth
      const data = activeView === 'protein'
        ? await bioAtomSpace.getProteinNetwork(depth)
        : await bioAtomSpace.getPathwayNetwork(depth);
      setNetworkData(data);
    } catch (error) {
      Logger.error('Failed to update network data:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bio-Network Visualization</CardTitle>
        <ViewSelector 
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </CardHeader>
      <CardContent>
        <NetworkLayout
          visualizer={activeView === 'protein' ? ProteinNetworkVisualizer : PathwayVisualizer}
          data={networkData}
          onDepthChange={handleDepthChange}
          className="space-y-4"
        />
      </CardContent>
    </Card>
  );
}