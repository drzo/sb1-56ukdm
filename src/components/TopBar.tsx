import React from 'react';
import { useNetworkStore } from '../store/networkStore';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Save,
  Share2
} from 'lucide-react';

const TopBar: React.FC = () => {
  const { viewConfig, zoomIn, zoomOut, resetView } = useNetworkStore();

  const handleSave = () => {
    const state = useNetworkStore.getState();
    const dataStr = JSON.stringify(state.network);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'network-state.json');
    linkElement.click();
  };

  const handleShare = () => {
    const state = useNetworkStore.getState();
    const stateStr = JSON.stringify(state.network);
    const compressed = btoa(stateStr);
    const shareUrl = `${window.location.origin}?state=${compressed}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share URL copied to clipboard!');
    });
  };

  return (
    <div className="h-16 bg-gray-900 fixed top-0 left-16 right-0 flex items-center justify-between px-6 border-b border-gray-800">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">Echo State Network Visualizer</h1>
        <div className="h-6 w-px bg-gray-700" />
        <div className="flex items-center space-x-2">
          <button 
            onClick={zoomIn}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={zoomOut}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={resetView}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Maximize2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save State</span>
        </button>
        <button 
          onClick={handleShare}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;