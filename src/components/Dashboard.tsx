import { useState } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import ReservoirViz from './ReservoirViz';
import NetworkViz from './NetworkViz';
import CharacterOperations from './dashboard/CharacterOperations';
import { Modal } from './dashboard/UIComponents';
import { useQuery } from '@tanstack/react-query';
import { processInput } from '../lib/reservoir';

export default function Dashboard() {
  const [input, setInput] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: state, refetch } = useQuery({
    queryKey: ['reservoirState'],
    queryFn: () => processInput(input),
    enabled: false
  });

  const handleProcess = () => {
    const randomInput = Math.random() * 2 - 1;
    setInput(randomInput);
    refetch();
  };

  return (
    <DashboardLayout>
      {/* Reservoir Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Reservoir Computing</h2>
          <button
            onClick={handleProcess}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Process Random Input
          </button>
        </div>
        <div className="h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <ReservoirViz state={state} />
        </div>
      </div>

      {/* Network Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Network Visualization</h2>
        </div>
        <div className="h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <NetworkViz />
        </div>
      </div>

      {/* Characters Section */}
      <div className="card">
        <CharacterOperations onAddCharacter={() => setIsModalOpen(true)} />
      </div>

      <Modal
        title="Add Character"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {/* Character form content */}
      </Modal>
    </DashboardLayout>
  );
}