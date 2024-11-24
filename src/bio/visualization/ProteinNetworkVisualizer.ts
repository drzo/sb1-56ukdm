import * as THREE from 'three';
import { BaseVisualizer } from './core/BaseVisualizer';
import { ForceDirectedLayout } from './core/ForceDirectedLayout';
import { NetworkData, NetworkConfig, NetworkNode, NetworkEdge } from './types';
import { BioAtomSpace } from '../core/BioAtomSpace';
import { ProteinAnalyzer } from '../analysis/ProteinAnalyzer';
import { Logger } from '../../cogutil/Logger';

export class ProteinNetworkVisualizer extends BaseVisualizer {
  private bioAtomSpace: BioAtomSpace;
  private proteinAnalyzer: ProteinAnalyzer;
  private layout: ForceDirectedLayout;
  private nodes: Map<string, THREE.Mesh>;
  private edges: THREE.Line[];

  constructor(
    container: HTMLElement,
    bioAtomSpace: BioAtomSpace,
    config?: Partial<NetworkConfig>
  ) {
    super(container, config);
    this.bioAtomSpace = bioAtomSpace;
    this.proteinAnalyzer = new ProteinAnalyzer(bioAtomSpace);
    this.layout = new ForceDirectedLayout(this.config.width, this.config.height);
    this.nodes = new Map();
    this.edges = [];
    this.animate();
    Logger.info('ProteinNetworkVisualizer initialized');
  }

  async visualizeNetwork(proteinId: string, depth: number = 1): Promise<void> {
    try {
      const data = await this.buildNetworkData(proteinId, depth);
      this.updateData(data);
      Logger.info(`Visualized protein network for ${proteinId}`);
    } catch (error) {
      Logger.error('Failed to visualize protein network:', error);
      throw error;
    }
  }

  private async buildNetworkData(
    proteinId: string,
    depth: number
  ): Promise<NetworkData> {
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    const visited = new Set<string>();

    const exploreProtein = async (id: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(id)) return;
      visited.add(id);

      const protein = this.bioAtomSpace.getAtom(id);
      if (!protein) return;

      nodes.push({
        id,
        label: protein.getName(),
        type: 'protein',
        size: currentDepth === 1 ? 3 : 2,
        color: currentDepth === 1 ? '#00ff00' : '#0088ff'
      });

      const interactions = await this.proteinAnalyzer.findProteinInteractions(id);
      for (const [interactor, confidence] of interactions) {
        edges.push({
          source: id,
          target: interactor.getId(),
          weight: confidence,
          color: `rgba(255, 255, 255, ${confidence})`
        });

        await exploreProtein(interactor.getId(), currentDepth + 1);
      }
    };

    await exploreProtein(proteinId, 1);
    return { nodes, edges };
  }

  updateData(data: NetworkData): void {
    this.clearVisualization();
    this.layout.updateData(data);

    // Create nodes
    data.nodes.forEach(node => {
      const geometry = new THREE.SphereGeometry(node.size || this.config.nodeSize);
      const material = new THREE.MeshPhongMaterial({
        color: node.color || this.config.colors.node
      });
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      this.nodes.set(node.id, mesh);
    });

    // Create edges
    data.edges.forEach(edge => {
      const points = [
        new THREE.Vector3(),
        new THREE.Vector3()
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: edge.color || this.config.colors.edge,
        transparent: true,
        opacity: edge.weight || 1
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.edges.push(line);
    });
  }

  private clearVisualization(): void {
    // Remove nodes
    for (const mesh of this.nodes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    this.nodes.clear();

    // Remove edges
    for (const line of this.edges) {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    }
    this.edges = [];
  }

  override dispose(): void {
    this.clearVisualization();
    this.layout.stop();
    super.dispose();
  }
}