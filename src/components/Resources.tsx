export function Resources() {
  const resources = [
    {
      title: 'Official Documentation',
      description: 'Comprehensive guides and API reference',
      link: 'https://cookbook.openai.com'
    },
    {
      title: 'GitHub Repository',
      description: 'Source code and examples',
      link: 'https://github.com/openai/openai-cookbook'
    },
    {
      title: 'Learning Resources',
      description: 'Additional tutorials and guides',
      link: 'https://cookbook.openai.com/resources'
    }
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Resources</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.link}
              className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-gray-600">{resource.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}