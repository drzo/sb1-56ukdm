export interface Repository {
  name: string;
  stars: number;
  description: string;
  category: 'Core Libraries' | 'Environment Collections' | 'Specialized Tools' | 'Development Tools';
}