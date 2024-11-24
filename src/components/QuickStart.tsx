import { KeyIcon, CodeBracketIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export function QuickStart() {
  const steps = [
    {
      title: 'Create Account',
      description: 'Sign up for a free OpenAI account',
      icon: DocumentTextIcon,
      link: 'https://platform.openai.com/signup'
    },
    {
      title: 'Get API Key',
      description: 'Obtain your API key from the OpenAI dashboard',
      icon: KeyIcon,
      link: 'https://platform.openai.com/api-keys'
    },
    {
      title: 'Set Up Auth',
      description: 'Configure authentication using environment variables',
      icon: CodeBracketIcon,
      link: 'https://cookbook.openai.com/authentication'
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Start</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <a
              key={index}
              href={step.link}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <step.icon className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}