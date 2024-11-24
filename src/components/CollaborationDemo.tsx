import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

export function CollaborationDemo() {
  const [document, setDocument] = useState('Collaborative document content...');
  const [collaborators, setCollaborators] = useState(['User 1', 'User 2']);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocument(e.target.value);
    // Simulate real-time sync
    setTimeout(() => {
      console.log('Document synced to network');
    }, 500);
  };

  return (
    <div className="mt-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">Active Collaborators</h3>
        <div className="mt-1 flex space-x-2">
          {collaborators.map((user, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {user}
            </span>
          ))}
        </div>
      </div>
      <textarea
        value={document}
        onChange={handleDocumentChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        rows={4}
      />
    </div>
  );
}