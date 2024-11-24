import { BioAtomSpace } from '../core/BioAtomSpace';
import { BioNodeType, BioLinkType } from '../types/BioTypes';
import { Logger } from '../../cogutil/Logger';
import { Node } from '../../types/Node';

export class ProteinAnalyzer {
  private bioAtomSpace: BioAtomSpace;

  constructor(bioAtomSpace: BioAtomSpace) {
    this.bioAtomSpace = bioAtomSpace;
  }

  findProteinInteractions(proteinId: string): Map<Node, number> {
    const protein = this.bioAtomSpace.getAtom(proteinId) as Node;
    if (!protein || protein.getType() !== BioNodeType.PROTEIN) {
      Logger.warn(`Invalid protein ID: ${proteinId}`);
      return new Map();
    }

    const interactions = new Map<Node, number>();
    const interactionLinks = this.bioAtomSpace.getIncoming(protein).filter(
      link => link.getType() === BioLinkType.INTERACTS
    );

    for (const link of interactionLinks) {
      const interactor = link.getOutgoingSet().find(
        atom => atom.getId() !== proteinId
      ) as Node;

      if (interactor) {
        const confidence = link.getTruthValue().confidence;
        interactions.set(interactor, confidence);
      }
    }

    return new Map([...interactions.entries()].sort((a, b) => b[1] - a[1]));
  }

  findProteinComplexes(minSize: number = 3): Node[][] {
    const proteins = this.bioAtomSpace.getAtomsByType(BioNodeType.PROTEIN) as Node[];
    const complexes: Node[][] = [];
    const visited = new Set<string>();

    for (const protein of proteins) {
      if (visited.has(protein.getId())) continue;

      const complex = this.expandComplex(protein, visited);
      if (complex.length >= minSize) {
        complexes.push(complex);
      }
    }

    return complexes;
  }

  private expandComplex(protein: Node, visited: Set<string>): Node[] {
    const complex = [protein];
    visited.add(protein.getId());

    const interactions = this.findProteinInteractions(protein.getId());
    for (const [interactor, confidence] of interactions) {
      if (!visited.has(interactor.getId()) && confidence > 0.7) {
        complex.push(...this.expandComplex(interactor, visited));
      }
    }

    return complex;
  }

  calculateProteinSimilarity(protein1Id: string, protein2Id: string): number {
    const protein1 = this.bioAtomSpace.getAtom(protein1Id) as Node;
    const protein2 = this.bioAtomSpace.getAtom(protein2Id) as Node;

    if (!protein1 || !protein2) {
      Logger.warn('Invalid protein IDs');
      return 0;
    }

    const interactions1 = new Set(
      Array.from(this.findProteinInteractions(protein1Id).keys())
        .map(p => p.getId())
    );
    const interactions2 = new Set(
      Array.from(this.findProteinInteractions(protein2Id).keys())
        .map(p => p.getId())
    );

    const intersection = new Set(
      [...interactions1].filter(x => interactions2.has(x))
    );
    const union = new Set([...interactions1, ...interactions2]);

    return intersection.size / union.size;
  }

  findFunctionalPartners(proteinId: string, minConfidence: number = 0.5): Node[] {
    const protein = this.bioAtomSpace.getAtom(proteinId) as Node;
    if (!protein) return [];

    const partners = new Set<Node>();
    
    // Direct interactions
    const interactions = this.findProteinInteractions(proteinId);
    for (const [partner, confidence] of interactions) {
      if (confidence >= minConfidence) {
        partners.add(partner);
      }
    }

    // Pathway-based associations
    const pathways = this.bioAtomSpace.getPathwaysByGene(
      this.getEncodingGene(protein)?.getName() || ''
    );

    for (const pathway of pathways) {
      const pathwayProteins = this.getPathwayProteins(pathway);
      pathwayProteins.forEach(p => {
        if (p.getId() !== proteinId) {
          partners.add(p);
        }
      });
    }

    return Array.from(partners);
  }

  private getEncodingGene(protein: Node): Node | undefined {
    const expressionLinks = this.bioAtomSpace.getIncoming(protein).filter(
      link => link.getType() === BioLinkType.EXPRESSES
    );

    return expressionLinks[0]?.getOutgoingSet().find(
      atom => atom.getType() === BioNodeType.GENE
    ) as Node;
  }

  private getPathwayProteins(pathway: Node): Node[] {
    const participatesLinks = this.bioAtomSpace.getIncoming(pathway).filter(
      link => link.getType() === BioLinkType.PARTICIPATES
    );

    return participatesLinks
      .map(link => link.getOutgoingSet()
        .find(atom => atom.getType() === BioNodeType.PROTEIN))
      .filter(Boolean) as Node[];
  }
}