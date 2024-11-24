import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NetworkConfig, NetworkData, NetworkStats } from '../types';
import { Logger } from '../../../cogutil/Logger';

export abstract class BaseVisualizer {
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected config: NetworkConfig;
  protected container: HTMLElement;
  protected isDisposed: boolean = false;

  constructor(container: HTMLElement, config: Partial<NetworkConfig> = {}) {
    this.container = container;
    this.config = this.mergeConfig(config);
    this.initializeScene();
    Logger.info('BaseVisualizer initialized');
  }

  private mergeConfig(config: Partial<NetworkConfig>): NetworkConfig {
    return {
      width: config.width || this.container.clientWidth,
      height: config.height || this.container.clientHeight,
      nodeSize: config.nodeSize || 2,
      edgeWidth: config.edgeWidth || 1,
      fontSize: config.fontSize || 12,
      colors: {
        node: config.colors?.node || '#0088ff',
        edge: config.colors?.edge || '#ffffff',
        text: config.colors?.text || '#ffffff',
        background: config.colors?.background || '#1a1a1a'
      }
    };
  }

  protected initializeScene(): void {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.colors.background);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.width / this.config.height,
      0.1,
      1000
    );
    this.camera.position.z = 50;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.config.width, this.config.height);
    this.container.appendChild(this.renderer.domElement);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Add lights
    this.addLights();
  }

  protected addLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
  }

  protected animate = (): void => {
    if (this.isDisposed) return;

    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  abstract updateData(data: NetworkData): void;

  calculateStats(data: NetworkData): NetworkStats {
    const nodes = data.nodes.length;
    const edges = data.edges.length;
    const maxPossibleEdges = (nodes * (nodes - 1)) / 2;
    const density = maxPossibleEdges > 0 ? edges / maxPossibleEdges : 0;
    const avgDegree = nodes > 0 ? (2 * edges) / nodes : 0;

    return {
      nodes,
      edges,
      density,
      avgDegree
    };
  }

  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    this.isDisposed = true;
    this.controls.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}