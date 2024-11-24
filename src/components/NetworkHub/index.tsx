import React from 'react';
import { NetworkGraph } from './NetworkGraph';
import { MessageFlow } from './MessageFlow';
import { InstanceControls } from './InstanceControls';

export const NetworkHub: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <NetworkGraph />
      </div>
      <div className="space-y-4">
        <InstanceControls />
        <MessageFlow />
      </div>
    </div>
  );
};