import * as THREE from 'three';
import { BaseVisualizer } from './core/BaseVisualizer';
import { ForceDirectedLayout } from './core/ForceDirectedLayout';
import { NetworkData, NetworkConfig, NetworkNode, NetworkEdge } from './types';
import { BioAtomSpace } from '../core/BioAtomSpace';
import { PathwayAnalyzer } from '../analysis/PathwayAnalyzer';
import { Logger } from '../../cogutil/Logger';

export class PathwayVisualizer extends BaseVisualizer {
  private bioAtomSpace: BioAtomSpace;
  private pathwayAnalyzer: PathwayAnalyzer;
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
    this.pathwayAnalyzer = new PathwayAnalyzer(bioAtomSpace);
    this.layout = new ForceDirectedLayout(this.config.width, this.config.height);
    this.nodes = new Map();
    this.edges = [];
    this.animate();
    Logger.info('PathwayVisualizer initialized');
  }

  async visualizePathwayNetwork(pathwayId: string): Promise<void> {
    try {
      const data = await this.buildNetworkData(pathwayId);
      this.updateData(data);
      Logger.info(`Visualized pathway network for ${pathwayId}`);
    } catch (error) {
      Logger.error('Failed to visualize pathway network:', error);
      throw error;
    }
  }

  private async buildNetworkData(pathwayId: string): Promise<NetworkData> {
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];

    const mainPathway = this.bioAtomSpace.getAtom(pathwayId);
    if (!mainPathway) {
      throw new Error(`Pathway not found: ${pathwayId}`);
    }

    // Add main pathway node
    nodes.push({
      id: pathwayId,
      label: mainPathway.getName(),
      type: 'pathway',
      size: 3,
      color: '#00ff00'
    });

    // Add connected pathways
    const connectedPathways = await this.pathwayAnalyzer.findConnectedPathways(pathwayId);
    for (const pathway of connectedPathways) {
      nodes.push({
        id: pathway.getId(),
        label: pathway.getName(),
        type: 'pathway',
        size: 2,
        color: '#0088ff'
      });

      const overlap = await this.pathwayAnalyzer.calculatePathwayOverlap(
        pathwayId,
        pathway.getId()
      );

      edges.push({
        source: pathwayId,
        target: pathway.getId(),
        weight: overlap,
        color: `rgba(255, 255, 255, ${overlap})`
      });
    }

    return { nodes, edges };
  }

  updateData(data: NetworkData): void {
    this.clearVisualization();
    this.layout.updateData(data);

    // Create nodes
    data.nodes.forEach(node => {
      const geometry = new THREE.BoxGeometry(
        node.size || this.config.nodeSize,
        node.size || this.config.nodeSize,
        node.size || this.config.nodeSize
      );
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