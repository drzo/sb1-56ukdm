import './style.css';
import { HyperonDAS } from './hyperon/HyperonDAS';
import { MeTTaIntegration } from './hyperon/MeTTaIntegration';
import { NodeType, LinkType } from './types/AtomTypes';
import { MetagraphViewer } from './components/MetagraphViewer';

// Initialize components
const hyperonDAS = new HyperonDAS();
const metta = new MeTTaIntegration();

// Initialize the application
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>Hyperon AtomSpace Explorer</h1>
    <div class="controls">
      <button id="addNode">Add Node</button>
      <button id="addLink">Add Link</button>
      <button id="queryAtoms">Query Atoms</button>
      <button id="runMeTTa">Run MeTTa</button>
    </div>
    <div id="metagraph" class="metagraph"></div>
    <pre id="output" class="output"></pre>
  </div>
`;

// Initialize viewer after DOM is ready
let viewer: MetagraphViewer;

async function initialize() {
  // Initialize viewer
  const metagraphElement = document.getElementById('metagraph');
  if (metagraphElement) {
    viewer = new MetagraphViewer(metagraphElement);
  }
  
  // Add event listeners
  document.getElementById('addNode')?.addEventListener('click', async () => {
    const node = await hyperonDAS.addNode(NodeType.CONCEPT, 'Human', {
      strength: 0.9,
      confidence: 0.8
    });
    updateOutput([node]);
    updateVisualization();
  });

  document.getElementById('addLink')?.addEventListener('click', async () => {
    const human = await hyperonDAS.addNode(NodeType.CONCEPT, 'Human');
    const mammal = await hyperonDAS.addNode(NodeType.CONCEPT, 'Mammal');
    const link = await hyperonDAS.addLink(LinkType.INHERITANCE, [human, mammal]);
    
    updateOutput([human, mammal, link]);
    updateVisualization();
  });

  document.getElementById('queryAtoms')?.addEventListener('click', async () => {
    const results = await hyperonDAS.query({
      type: NodeType.CONCEPT,
      truthValue: {
        strength: [0.8, 1.0],
        confidence: [0.7, 1.0]
      }
    });
    updateOutput(results);
  });

  document.getElementById('runMeTTa')?.addEventListener('click', async () => {
    metta.addTemplate('reasoning', 'If {subject} is a {category}, then it has {property}', 
      ['subject', 'category', 'property']);
    
    const result = await metta.executeTemplate('reasoning', {
      subject: 'Human',
      category: 'Mammal',
      property: 'consciousness'
    });
    
    updateOutput([result]);
  });

  // Initial visualization
  updateVisualization();
}

// Helper functions
function updateOutput(data: any[]) {
  const output = document.getElementById('output');
  if (output) {
    output.textContent = JSON.stringify(data, null, 2);
  }
}

async function updateVisualization() {
  if (viewer) {
    const atoms = await hyperonDAS.getAllAtoms();
    viewer.updateGraph(atoms);
  }
}

// Start the application when DOM is ready
window.addEventListener('DOMContentLoaded', initialize);