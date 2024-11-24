import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Logger } from '../../cogutil/Logger';

export class MoleculeVisualizer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private atomMeshes: Map<string, THREE.Mesh>;
  private bondLines: THREE.Line[];

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.controls = new OrbitControls(this.camera, canvas);
    this.atomMeshes = new Map();
    this.bondLines = [];

    this.setupScene();
    this.setupLights();
    Logger.info('MoleculeVisualizer initialized');
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color(0xffffff);
    this.camera.position.z = 15;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
  }

  drawMolecule(atoms: string[], bonds: Array<{
    begin: number;
    end: number;
    order: number;
  }>): void {
    try {
      this.clear();

      // Create atoms
      atoms.forEach((symbol, i) => {
        const x = Math.cos(i * 2 * Math.PI / atoms.length) * 5;
        const y = Math.sin(i * 2 * Math.PI / atoms.length) * 5;
        this.createAtom(symbol, new THREE.Vector3(x, y, 0));
      });

      // Create bonds
      bonds.forEach(bond => {
        const start = new THREE.Vector3(
          Math.cos(bond.begin * 2 * Math.PI / atoms.length) * 5,
          Math.sin(bond.begin * 2 * Math.PI / atoms.length) * 5,
          0
        );
        const end = new THREE.Vector3(
          Math.cos(bond.end * 2 * Math.PI / atoms.length) * 5,
          Math.sin(bond.end * 2 * Math.PI / atoms.length) * 5,
          0
        );
        this.createBond(start, end, bond.order);
      });

      this.animate();
      Logger.info('Drew molecule');
    } catch (error) {
      Logger.error('Failed to draw molecule:', error);
      throw error;
    }
  }

  private createAtom(symbol: string, position: THREE.Vector3): void {
    const geometry = new THREE.SphereGeometry(0.5);
    const material = new THREE.MeshPhongMaterial({
      color: this.getAtomColor(symbol)
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    this.scene.add(mesh);
    this.atomMeshes.set(`${symbol}_${position.toArray().join(',')}`, mesh);
  }

  private createBond(start: THREE.Vector3, end: THREE.Vector3, order: number): void {
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.bondLines.push(line);

    // For double and triple bonds, add parallel lines
    if (order > 1) {
      const offset = new THREE.Vector3().subVectors(end, start)
        .normalize()
        .cross(new THREE.Vector3(0, 0, 1))
        .multiplyScalar(0.2);

      for (let i = 1; i < order; i++) {
        const offsetStart = start.clone().add(offset.clone().multiplyScalar(i));
        const offsetEnd = end.clone().add(offset.clone().multiplyScalar(i));
        const additionalLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([offsetStart, offsetEnd]),
          material
        );
        this.scene.add(additionalLine);
        this.bondLines.push(additionalLine);
      }
    }
  }

  private getAtomColor(symbol: string): number {
    const colors: { [key: string]: number } = {
      'C': 0x808080, // Gray
      'O': 0xff0000, // Red
      'N': 0x0000ff, // Blue
      'H': 0xffffff, // White
      'S': 0xffff00, // Yellow
      'P': 0xffa500, // Orange
      'F': 0x90ee90, // Light green
      'Cl': 0x00ff00, // Green
      'Br': 0x8b4513, // Brown
      'I': 0x8f00ff  // Purple
    };
    return colors[symbol] || 0x808080;
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  clear(): void {
    // Remove atoms
    this.atomMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.atomMeshes.clear();

    // Remove bonds
    this.bondLines.forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
    this.bondLines = [];
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    this.clear();
    this.controls.dispose();
    this.renderer.dispose();
  }
}