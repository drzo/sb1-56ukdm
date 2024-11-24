import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

export function SecurityDemo() {
  const [input, setInput] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');

  const handleEncrypt = () => {
    const encryptedText = CryptoJS.AES.encrypt(input, 'secret-key').toString();
    setEncrypted(encryptedText);
  };

  const handleDecrypt = () => {
    const decryptedBytes = CryptoJS.AES.decrypt(encrypted, 'secret-key');
    setDecrypted(decryptedBytes.toString(CryptoJS.enc.Utf8));
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Input Text</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleEncrypt}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Encrypt
        </button>
        <button
          onClick={handleDecrypt}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          Decrypt
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Encrypted</label>
        <div className="mt-1 p-2 bg-gray-100 rounded-md">
          <code className="text-sm">{encrypted || 'No encrypted text yet'}</code>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Decrypted</label>
        <div className="mt-1 p-2 bg-gray-100 rounded-md">
          <code className="text-sm">{decrypted || 'No decrypted text yet'}</code>
        </div>
      </div>
    </div>
  );
}