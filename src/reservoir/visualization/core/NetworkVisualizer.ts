import * as THREE from 'three';
import { BaseVisualizer } from './BaseVisualizer';
import { NetworkData, NetworkNode, NetworkEdge, VisualizationConfig } from '../types/VisualizationTypes';
import { NetworkLayout } from '../layout/NetworkLayout';
import { Logger } from '../../../cogutil/Logger';

export class NetworkVisualizer extends BaseVisualizer {
  private layout: NetworkLayout;
  private nodes: Map<string, THREE.Mesh>;
  private edges: Map<string, THREE.Line>;
  private labels: Map<string, THREE.Sprite>;

  constructor(container: HTMLElement, config?: Partial<VisualizationConfig>) {
    super(container, config);
    this.layout = new NetworkLayout();
    this.nodes = new Map();
    this.edges = new Map();
    this.labels = new Map();
    this.animate();
  }

  updateData(data: NetworkData): void {
    try {
      this.clearVisualization();
      this.layout.updateData(data);
      this.createNodes(data.nodes);
      this.createEdges(data.edges);
      this.createLabels(data.nodes);
    } catch (error) {
      Logger.error('Failed to update network visualization:', error);
    }
  }

  private createNodes(nodes: NetworkNode[]): void {
    nodes.forEach(node => {
      const geometry = new THREE.SphereGeometry(this.config.nodeSize);
      const material = new THREE.MeshPhongMaterial({
        color: this.getNodeColor(node.type)
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      if (node.position) {
        mesh.position.set(node.position.x, node.position.y, node.position.z);
      }

      this.scene.add(mesh);
      this.nodes.set(node.id, mesh);
    });
  }

  private createEdges(edges: NetworkEdge[]): void {
    edges.forEach(edge => {
      const sourceNode = this.nodes.get(edge.source);
      const targetNode = this.nodes.get(edge.target);
      
      if (sourceNode && targetNode) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          sourceNode.position,
          targetNode.position
        ]);
        
        const material = new THREE.LineBasicMaterial({
          color: this.config.colors.edge,
          transparent: true,
          opacity: Math.abs(edge.weight)
        });

        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.edges.set(`${edge.source}-${edge.target}`, line);
      }
    });
  }

  private createLabels(nodes: NetworkNode[]): void {
    nodes.forEach(node => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      context.font = '48px Arial';
      context.fillStyle = 'white';
      context.fillText(node.id, 0, 48);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      
      const nodeMesh = this.nodes.get(node.id);
      if (nodeMesh) {
        sprite.position.copy(nodeMesh.position);
        sprite.position.y += this.config.nodeSize * 1.5;
      }

      this.scene.add(sprite);
      this.labels.set(node.id, sprite);
    });
  }

  private getNodeColor(type: NetworkNode['type']): string {
    switch (type) {
      case 'input':
        return '#4CAF50';
      case 'output':
        return '#2196F3';
      case 'reservoir':
        return '#FFC107';
      default:
        return this.config.colors.node;
    }
  }

  private clearVisualization(): void {
    // Clear nodes
    this.nodes.forEach(node => {
      this.scene.remove(node);
      node.geometry.dispose();
      (node.material as THREE.Material).dispose();
    });
    this.nodes.clear();

    // Clear edges
    this.edges.forEach(edge => {
      this.scene.remove(edge);
      edge.geometry.dispose();
      (edge.material as THREE.Material).dispose();
    });
    this.edges.clear();

    // Clear labels
    this.labels.forEach(label => {
      this.scene.remove(label);
      (label.material as THREE.SpriteMaterial).map?.dispose();
      label.material.dispose();
    });
    this.labels.clear();
  }

  override dispose(): void {
    this.clearVisualization();
    this.layout.dispose();
    super.dispose();
  }
}