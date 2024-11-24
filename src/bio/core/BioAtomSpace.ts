import { AtomSpace } from '../../atomspace';
import { NodeType, LinkType } from '../../types/AtomTypes';
import { Logger } from '../../cogutil/Logger';
import { TruthValue } from '../../types/Atom';
import { Node } from '../../types/Node';
import { GeneInfo, ProteinInfo, PathwayInfo, DiseaseInfo } from '../types/BioTypes';

export class BioAtomSpace extends AtomSpace {
  constructor() {
    super();
    Logger.info('BioAtomSpace initialized');
  }

  addGene(info: GeneInfo, tv?: TruthValue): Node {
    const gene = this.addNode(NodeType.GENE, info.symbol, tv);
    const organism = this.addNode(NodeType.ORGANISM, info.organism);
    this.addLink(LinkType.LOCATED, [gene, organism]);
    Logger.info(`Added gene: ${info.symbol} (${info.organism})`);
    return gene;
  }

  addProtein(info: ProteinInfo, tv?: TruthValue): Node {
    const protein = this.addNode(NodeType.PROTEIN, info.id, tv);
    Logger.info(`Added protein: ${info.id}`);
    return protein;
  }

  addPathway(info: PathwayInfo, tv?: TruthValue): Node {
    const pathway = this.addNode(NodeType.PATHWAY, info.id, tv);
    Logger.info(`Added pathway: ${info.id}`);
    return pathway;
  }

  addDisease(info: DiseaseInfo, tv?: TruthValue): Node {
    const disease = this.addNode(NodeType.DISEASE, info.id, tv);
    Logger.info(`Added disease: ${info.id}`);
    return disease;
  }

  getGeneBySymbol(symbol: string): Node | undefined {
    const genes = this.getAtomsByType(NodeType.GENE);
    return genes.find(gene => (gene as Node).getName() === symbol) as Node;
  }
}