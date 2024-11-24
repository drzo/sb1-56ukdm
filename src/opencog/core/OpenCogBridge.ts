import { AtomSpaceProvider } from '../../atomspace/core/AtomSpaceProvider';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import { BioAtomSpace } from '../../bio/core/BioAtomSpace';
import { MoleculeBuilder } from '../../chemistry/core/MoleculeBuilder';
import { LinkGrammarParser } from '../../nlp/LinkGrammarParser';
import { ProxyManager } from '../../proxy/ProxyManager';
import { NetworkManager } from '../../network/NetworkManager';

export class OpenCogBridge {
  private static instance: OpenCogBridge;
  private atomspace = AtomSpaceProvider.getInstance().getAtomSpace();
  private bioAtomSpace = new BioAtomSpace();
  private moleculeBuilder: MoleculeBuilder;
  private linkParser = new LinkGrammarParser();
  private proxyManager = ProxyManager.getInstance();
  private networkManager = NetworkManager.getInstance();

  private constructor() {
    this.moleculeBuilder = new MoleculeBuilder(this.atomspace);
    Logger.info('OpenCogBridge initialized');
  }

  public static getInstance(): OpenCogBridge {
    if (!OpenCogBridge.instance) {
      OpenCogBridge.instance = new OpenCogBridge();
    }
    return OpenCogBridge.instance;
  }

  async processQuery(query: string): Promise<any> {
    const timer = new Timer();
    try {
      // Parse natural language query
      const parseResult = await this.linkParser.parse(query);
      
      // Extract key concepts and relationships
      const concepts = await this.extractConcepts(parseResult);
      
      // Query across different atom spaces
      const results = await Promise.all([
        this.queryAtomSpace(concepts),
        this.queryBioSpace(concepts),
        this.queryChemSpace(concepts)
      ]);

      Logger.info(`Query processed in ${timer.stop()}ms`);
      return this.mergeResults(results);
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

  private mergeResults(results: any[][]): any {
    return {
      atoms: results[0],
      bioEntities: results[1],
      chemicals: results[2]
    };
  }
}