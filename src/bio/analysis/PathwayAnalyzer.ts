import { BioAtomSpace } from '../core/BioAtomSpace';
import { BioNodeType, BioLinkType } from '../types/BioTypes';
import { Logger } from '../../cogutil/Logger';
import { Statistics } from '../../cogutil/Statistics';
import { Node } from '../../types/Node';

export class PathwayAnalyzer {
  private bioAtomSpace: BioAtomSpace;

  constructor(bioAtomSpace: BioAtomSpace) {
    this.bioAtomSpace = bioAtomSpace;
  }

  findEnrichedPathways(geneList: string[], pValueThreshold: number = 0.05): Map<Node, number> {
    const enrichment = new Map<Node, number>();
    const allPathways = this.bioAtomSpace.getAtomsByType(BioNodeType.PATHWAY);
    const totalGenes = this.bioAtomSpace.getAtomsByType(BioNodeType.GENE).length;

    for (const pathway of allPathways) {
      const pathwayGenes = this.getPathwayGenes(pathway as Node);
      const overlap = pathwayGenes.filter(gene => geneList.includes(gene.getName()));
      
      const pValue = this.calculateHypergeometricTest(
        overlap.length,
        geneList.length,
        pathwayGenes.length,
        totalGenes
      );

      if (pValue <= pValueThreshold) {
        enrichment.set(pathway as Node, pValue);
      }
    }

    return new Map([...enrichment.entries()].sort((a, b) => a[1] - b[1]));
  }

  findConnectedPathways(pathwayId: string): Node[] {
    const pathway = this.bioAtomSpace.getAtom(pathwayId) as Node;
    if (!pathway || pathway.getType() !== BioNodeType.PATHWAY) {
      Logger.warn(`Invalid pathway ID: ${pathwayId}`);
      return [];
    }

    const pathwayGenes = this.getPathwayGenes(pathway);
    const connectedPathways = new Set<Node>();

    for (const gene of pathwayGenes) {
      const genePathways = this.bioAtomSpace.getPathwaysByGene(gene.getName());
      genePathways.forEach(p => {
        if (p.getId() !== pathwayId) {
          connectedPathways.add(p);
        }
      });
    }

    return Array.from(connectedPathways);
  }

  calculatePathwayOverlap(pathway1Id: string, pathway2Id: string): number {
    const pathway1 = this.bioAtomSpace.getAtom(pathway1Id) as Node;
    const pathway2 = this.bioAtomSpace.getAtom(pathway2Id) as Node;

    if (!pathway1 || !pathway2) {
      Logger.warn('Invalid pathway IDs');
      return 0;
    }

    const genes1 = new Set(this.getPathwayGenes(pathway1).map(g => g.getName()));
    const genes2 = new Set(this.getPathwayGenes(pathway2).map(g => g.getName()));

    const intersection = new Set([...genes1].filter(x => genes2.has(x)));
    const union = new Set([...genes1, ...genes2]);

    return intersection.size / union.size;
  }

  private getPathwayGenes(pathway: Node): Node[] {
    const participatesLinks = this.bioAtomSpace.getIncoming(pathway).filter(
      link => link.getType() === BioLinkType.PARTICIPATES
    );

    return participatesLinks
      .map(link => link.getOutgoingSet()
        .find(atom => atom.getType() === BioNodeType.GENE))
      .filter(Boolean) as Node[];
  }

  private calculateHypergeometricTest(
    overlap: number,
    setSize: number,
    pathwaySize: number,
    totalGenes: number
  ): number {
    let pValue = 0;
    const maxOverlap = Math.min(setSize, pathwaySize);

    for (let i = overlap; i <= maxOverlap; i++) {
      pValue += Statistics.combinations(pathwaySize, i) *
                Statistics.combinations(totalGenes - pathwaySize, setSize - i) /
                Statistics.combinations(totalGenes, setSize);
    }

    return pValue;
  }
}