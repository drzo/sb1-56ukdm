import React from 'react';
import Header from '../components/Header';
import IntegrationCard from '../components/IntegrationCard';
import SecureStorageSection from '../components/SecureStorageSection';
import { Github, Gitlab, MessageSquare, MessagesSquare, Database, Key, Lock, Cloud } from 'lucide-react';

interface IntegrationsProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

interface AppButton {
  icon: React.ReactNode;
  name: string;
  category: string;
  status: 'connected' | 'disconnected';
  description: string;
}

export default function Integrations({ isDark, setIsDark }: IntegrationsProps) {
  const apps: AppButton[] = [
    // Development Tools
    { icon: <Github className="w-6 h-6" />, name: 'GitHub', category: 'Development', status: 'connected', description: 'Code repository and version control' },
    { icon: <Gitlab className="w-6 h-6" />, name: 'GitLab', category: 'Development', status: 'disconnected', description: 'DevOps platform' },
    
    // Communication
    { icon: <MessageSquare className="w-6 h-6" />, name: 'Slack', category: 'Communication', status: 'connected', description: 'Team messaging and collaboration' },
    { icon: <MessagesSquare className="w-6 h-6" />, name: 'Discord', category: 'Communication', status: 'disconnected', description: 'Voice and text chat' },
    
    // Storage & Security
    { icon: <Database className="w-6 h-6" />, name: 'Vault', category: 'Security', status: 'connected', description: 'Secure secret storage' },
    { icon: <Key className="w-6 h-6" />, name: 'KeyStore', category: 'Security', status: 'connected', description: 'API key management' },
    { icon: <Lock className="w-6 h-6" />, name: 'Secrets', category: 'Security', status: 'disconnected', description: 'Encrypted data storage' },
    { icon: <Cloud className="w-6 h-6" />, name: 'CloudStore', category: 'Storage', status: 'connected', description: 'Cloud file storage' },
  ];

  const categories = Array.from(new Set(apps.map(app => app.category)));

  return (
    <main className="flex-1 flex flex-col">
      <Header title="Integrations" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Integration Groups */}
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {apps
                  .filter(app => app.category === category)
                  .map(app => (
                    <IntegrationCard
                      key={app.name}
                      icon={app.icon}
                      name={app.name}
                      description={app.description}
                      status={app.status}
                    />
                  ))}
              </div>
            </div>
          ))}

          <SecureStorageSection />
        </div>
      </div>
    </main>
  );
}