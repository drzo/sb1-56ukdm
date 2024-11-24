import { IntegratedMemory } from '../integration/memory-integration.js';

// Create integrated memory system
const memory = new IntegratedMemory();

// Example: Process community knowledge
console.log('Processing community knowledge...\n');

const inputs = [
  "John is a local business owner",
  "The community center hosts weekly meetings",
  "Create skill sharing program for youth",
  "Local markets support small businesses"
];

async function processInputs() {
  for (const input of inputs) {
    console.log(`Processing: "${input}"`);
    const result = await memory.process(input);
    
    console.log('\nExtracted information:');
    console.log('- Facts:', result.facts);
    console.log('- Episode:', result.episode);
    console.log('- Concepts:', result.concepts);
    console.log('- Procedures:', result.procedures);
    console.log('---\n');
  }

  // Query example
  console.log('Querying memory systems:');
  const query = {
    predicate: 'is',
    context: 'business',
    concept: 'John',
    threshold: 0.5
  };

  const results = memory.query(query);
  console.log('\nQuery results:', JSON.stringify(results, null, 2));
}

processInputs().catch(console.error);