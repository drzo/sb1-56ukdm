import { AtomSpaceProvider } from '../../atomspace/core/AtomSpaceProvider';
import { BioAtomSpace } from '../../bio/core/BioAtomSpace';
import { MoleculeBuilder } from '../../chemistry/core/MoleculeBuilder';
import { LinkGrammarParser } from '../../nlp/LinkGrammarParser';
import { ProxyManager } from '../../proxy/ProxyManager';
import { NetworkManager } from '../../network/NetworkManager';
import { PLNReasoner } from '../reasoning/PLNReasoner';
import { AttentionBank } from '../attention/AttentionBank';
import { PatternMiner } from '../learning/PatternMiner';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import { RocksStorage } from '../../storage/RocksStorage';

export class OpenCogIntegration {
  private static instance: OpenCogIntegration;
  private atomspace = AtomSpaceProvider.getInstance().getAtomSpace();
  private bioAtomSpace = new BioAtomSpace();
  private moleculeBuilder: MoleculeBuilder;
  private linkParser = new LinkGrammarParser();
  private proxyManager = ProxyManager.getInstance();
  private networkManager = NetworkManager.getInstance();
  private reasoner = new PLNReasoner();
  private attentionBank = AttentionBank.getInstance();
  private patternMiner = new PatternMiner();
  private storage = RocksStorage.getInstance();

  private constructor() {
    this.moleculeBuilder = new MoleculeBuilder(this.atomspace);
    this.initializeComponents();
  }

  public static getInstance(): OpenCogIntegration {
    if (!OpenCogIntegration.instance) {
      OpenCogIntegration.instance = new OpenCogIntegration();
    }
    return OpenCogIntegration.instance;
  }

  private async initializeComponents(): Promise<void> {
    try {
      // Start network manager
      this.networkManager.startServer(3000);

      // Initialize attention values
      const atoms = await this.atomspace.getAllAtoms();
      atoms.forEach(atom => {
        this.attentionBank.updateSTI(atom, 0);
      });

      Logger.info('OpenCog components initialized');
    } catch (error) {
      Logger.error('Failed to initialize OpenCog components:', error);
      throw error;
    }
  }

  async processQuery(query: string): Promise<any> {
    const timer = new Timer();
    try {
      // Parse natural language query
      const parseResult = await this.linkParser.parse(query);
      
      // Extract key concepts and relationships
      const concepts = await this.extractConcepts(parseResult);
      
      // Query across different spaces
      const [atoms, bioResults, chemResults] = await Promise.all([
        this.queryAtomSpace(concepts),
        this.queryBioSpace(concepts),
        this.queryChemSpace(concepts)
      ]);

      // Mine patterns
      const patterns = await this.patternMiner.minePatterns(atoms);

      // Update attention values
      atoms.forEach(atom => {
        this.attentionBank.updateSTI(atom, 10);
      });

      // Perform reasoning
      const inferences = await this.performReasoning(atoms);

      Logger.info(`Query processed in ${timer.stop()}ms`);

      return {
        atoms,
        bioEntities: bioResults,
        chemicals: chemResults,
        patterns: patterns.slice(0, 5),
        inferences,
        attention: this.attentionBank.getAttentionDistribution()
      };
    } catch (error) {
      Logger.error('Failed to process query:', error);
      throw error;
    }
  }

  private async extractConcepts(parseResult: any): Promise<Set<string>> {
    const concepts = new Set<string>();
    
    parseResult.tokens.forEach((token: string, index: number) => {
      if (parseResult.tags[index].startsWith('N')) {
        concepts.add(token.toLowerCase());
      }
    });

    return concepts;
  }

  private async queryAtomSpace(concepts: Set<string>): Promise<any[]> {
    const results = [];
    for (const concept of concepts) {
      const matches = await AtomSpaceProvider.getInstance()
        .getQueryEngine()
        .query({ type: 'ConceptNode', name: concept });
      results.push(...matches);
    }
    return results;
  }

  private async queryBioSpace(concepts: Set<string>): Promise<any[]> {
    const results = [];
    for (const concept of concepts) {
      const gene = this.bioAtomSpace.getGeneBySymbol(concept);
      if (gene) {
        results.push({
          type: 'gene',
          data: gene,
          proteins: await this.bioAtomSpace.getProteinsByGene(concept),
          pathways: await this.bioAtomSpace.getPathwaysByGene(concept)
        });
      }
    }
    return results;
  }

  private async queryChemSpace(concepts: Set<string>): Promise<any[]> {
    const results = [];
    for (const concept of concepts) {
      try {
        const molecule = this.moleculeBuilder.buildFromSMILES(concept);
        if (molecule) {
          results.push({
            type: 'molecule',
            data: molecule,
            properties: this.moleculeBuilder.calculateMolecularProperties(concept)
          });
        }
      } catch {
        // Not a valid SMILES string, skip
      }
    }
    return results;
  }

  private async performReasoning(atoms: any[]): Promise<any[]> {
    const inferences = [];
    
    // Find potential premises and conclusions
    for (let i = 0; i < atoms.length - 1; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        try {
          const result = await this.reasoner.deductiveInference(
            [atoms[i]], 
            atoms[j]
          );
          if (result.valid) {
            inferences.push({
              type: 'deductive',
              premises: [atoms[i]],
              conclusion: atoms[j],
              confidence: result.confidence
            });
          }
        } catch (error) {
          Logger.error('Reasoning failed:', error);
        }
      }
    }

    return inferences;
  }

  async shutdown(): Promise<void> {
    try {
      // Save current state
      const atoms = await this.atomspace.getAllAtoms();
      for (const atom of atoms) {
        await this.storage.saveAtom(atom);
      }

      // Stop network manager
      this.networkManager.stop();

      // Close storage
      await this.storage.close();

      Logger.info('OpenCog components shut down');
    } catch (error) {
      Logger.error('Error during shutdown:', error);
      throw error;
    }
  }
}