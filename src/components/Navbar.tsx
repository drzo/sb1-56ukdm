import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 
      'bg-blue-500 text-white' : 
      'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white';
  };

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/cogutils', label: 'CogUtils ReservoirPy' },
    { path: '/characters', label: 'Characters' },
    { path: '/memory', label: 'Memory' },
    { path: '/echospace', label: 'EchoSpace' },
    { path: '/patterns', label: 'Pattern Space' },
    { path: '/namespaces', label: 'NameSpace' }
  ];

  return (
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-4">
            {links.map(({ path, label }) => (
              <Link 
                key={path}
                to={path} 
                className={`flex items-center px-4 rounded-md transition-colors ${isActive(path)}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}