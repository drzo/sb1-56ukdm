import React, { useState } from 'react';
import Header from '../components/Header';
import GroupChat from '../components/GroupChat';

interface ChatProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function Chat({ isDark, setIsDark }: ChatProps) {
  return (
    <main className="flex-1 flex flex-col">
      <Header title="Chat Interface" isDark={isDark} setIsDark={setIsDark} />
      <div className="flex-1">
        <GroupChat isDark={isDark} />
      </div>
    </main>
  );
}