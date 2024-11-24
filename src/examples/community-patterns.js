import { EchoSpace } from '../integration/echo-space.js';

// Create integrated system
const echoSpace = new EchoSpace();

// Define some community patterns
const patterns = [
  {
    id: 'local_market',
    name: 'Local Market',
    context: 'Community needs access to daily goods',
    problem: 'Lack of accessible shopping options',
    solution: 'Create central marketplace for local vendors'
  },
  {
    id: 'skill_sharing',
    name: 'Skill Sharing Network', 
    context: 'Community has diverse skills and knowledge',
    problem: 'Knowledge transfer is informal and limited',
    solution: 'Establish skill sharing program and workshops'
  },
  {
    id: 'youth_mentoring',
    name: 'Youth Mentoring',
    context: 'Young people need guidance and opportunities',
    problem: 'Gap between youth and experienced community members',
    solution: 'Create mentoring partnerships and programs'
  }
];

// Map patterns to system
console.log('Mapping community patterns to EchoSpace...');
patterns.forEach(pattern => {
  echoSpace.mapPattern(pattern);
});

// Connect related patterns
console.log('\nConnecting related patterns...');
echoSpace.connectPatterns('local_market', 'skill_sharing', 'enables');
echoSpace.connectPatterns('skill_sharing', 'youth_mentoring', 'supports');

// Get system state
console.log('\nIntegrated system state:');
const state = echoSpace.getSystemState();
console.log(JSON.stringify(state, null, 2));