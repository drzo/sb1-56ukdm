import React from 'react';
import { Brain, Code, Bug, Zap, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

export default function WelcomeCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-center space-x-2 mb-6">
        <Brain className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Welcome to ReservoirChat!</h1>
      </div>
      
      <p className="text-gray-600 mb-6 text-center">
        Your expert companion for Reservoir Computing, powered by ReservoirPy - the leading Python library for reservoir computing neural networks.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FeatureCard
          icon={Code}
          title="Implementation Help"
          description="Get assistance with reservoir computing models"
          color="indigo"
        />
        <FeatureCard
          icon={Bug}
          title="Debugging Support"
          description="Help with troubleshooting your code"
          color="purple"
        />
        <FeatureCard
          icon={Zap}
          title="Performance Tips"
          description="Optimize your models and workflows"
          color="blue"
        />
        <FeatureCard
          icon={BookOpen}
          title="Learning Resources"
          description="Access documentation and examples"
          color="green"
        />
      </div>

      <div className="flex justify-center mb-6">
        <Button
          size="lg"
          className="flex items-center space-x-2"
          onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Brain className="w-5 h-5" />
          <span>Try Interactive Demo</span>
        </Button>
      </div>

      <div className="text-sm text-gray-500 border-t pt-4">
        <p className="mb-2">
          Developed by Inria Bordeaux's Mnemosyne Lab and supported by BrainGPT (Inria) and DeepPool (ANR) projects.
        </p>
        <p className="text-xs">
          ⚠️ Beta version - Please verify critical information and avoid sharing personal data. Usage data analyzed for research purposes.
        </p>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'indigo' | 'purple' | 'blue' | 'green';
}

const FeatureCard = React.memo(({ icon: Icon, title, description, color }: FeatureCardProps) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg ${colorClasses[color]}`}>
      <Icon className="w-5 h-5 mt-1" />
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';