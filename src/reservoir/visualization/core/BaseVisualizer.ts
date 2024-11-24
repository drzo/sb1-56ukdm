import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VisualizationConfig } from '../types/VisualizationTypes';
import { Logger } from '../../../cogutil/Logger';

export abstract class BaseVisualizer {
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected config: VisualizationConfig;
  protected container: HTMLElement;
  protected isDisposed: boolean = false;

  constructor(container: HTMLElement, config: Partial<VisualizationConfig> = {}) {
    this.container = container;
    this.config = this.mergeConfig(config);
    this.initializeScene();
    Logger.info('BaseVisualizer initialized');
  }

  private mergeConfig(config: Partial<VisualizationConfig>): VisualizationConfig {
    return {
      width: config.width || this.container.clientWidth,
      height: config.height || this.container.clientHeight,
      backgroundColor: config.backgroundColor || '#1a1a1a',
      cameraPosition: config.cameraPosition || { x: 0, y: 0, z: 50 },
      nodeSize: config.nodeSize || 5,
      edgeWidth: config.edgeWidth || 1,
      colors: {
        node: config.colors?.node || '#4CAF50',
        edge: config.colors?.edge || '#2196F3',
        text: config.colors?.text || '#ffffff',
        background: config.colors?.background || '#1a1a1a'
      }
    };
  }

  protected initializeScene(): void {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.width / this.config.height,
      0.1,
      1000
    );
    this.camera.position.set(
      this.config.cameraPosition.x,
      this.config.cameraPosition.y,
      this.config.cameraPosition.z
    );

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

  abstract updateData(data: any): void;

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