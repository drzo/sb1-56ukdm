import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as d3 from 'd3';
import { Atom } from '../types/Atom';

interface GraphNode {
  id: string;
  type: string;
  atom: Atom;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
}

export class MetagraphViewer {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private graph!: d3.Simulation<GraphNode, GraphLink>;
  private nodeMap: Map<string, THREE.Mesh>;
  private linkMap: Map<string, THREE.Line>;
  private isInitialized: boolean = false;
  private isDisposed: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.nodeMap = new Map();
    this.linkMap = new Map();
    this.init();
  }

  private init() {
    if (this.isInitialized || this.isDisposed) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 50;

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    this.graph = d3.forceSimulation<GraphNode, GraphLink>()
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(0, 0))
      .force('link', d3.forceLink<GraphNode, GraphLink>().id(d => d.id).distance(30))
      .on('tick', () => this.updatePositions());

    this.animate();
    this.isInitialized = true;

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.isInitialized || this.isDisposed) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public updateGraph(atoms: Atom[]) {
    if (!this.isInitialized || this.isDisposed) return;

    const nodes: GraphNode[] = atoms.map(atom => ({
      id: atom.getId(),
      type: atom.getType(),
      atom
    }));

    const links: GraphLink[] = [];

    this.graph.nodes(nodes);
    this.graph.force<d3.ForceLink<GraphNode, GraphLink>>('link')?.links(links);
    this.graph.alpha(1).restart();

    this.updateVisuals(nodes, links);
  }

  private updateVisuals(nodes: GraphNode[], links: GraphLink[]) {
    if (!this.isInitialized || this.isDisposed) return;

    this.nodeMap.forEach(mesh => this.scene.remove(mesh));
    this.linkMap.forEach(line => this.scene.remove(line));
    this.nodeMap.clear();
    this.linkMap.clear();

    const nodeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const nodeGeometry = new THREE.SphereGeometry(1);

    nodes.forEach(node => {
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      this.scene.add(mesh);
      this.nodeMap.set(node.id, mesh);
    });

    const linkMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    links.forEach(link => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(6);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const line = new THREE.Line(geometry, linkMaterial);
      this.scene.add(line);
      this.linkMap.set(`${link.source.id}-${link.target.id}`, line);
    });
  }

  private updatePositions() {
    if (!this.isInitialized || this.isDisposed) return;

    this.graph.nodes().forEach(node => {
      const mesh = this.nodeMap.get(node.id);
      if (mesh) {
        mesh.position.set(node.x || 0, node.y || 0, 0);
      }
    });

    this.graph.force<d3.ForceLink<GraphNode, GraphLink>>('link')?.links().forEach(link => {
      const line = this.linkMap.get(`${link.source.id}-${link.target.id}`);
      if (line) {
        const positions = new Float32Array([
          link.source.x || 0, link.source.y || 0, 0,
          link.target.x || 0, link.target.y || 0, 0
        ]);
        line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        line.geometry.attributes.position.needsUpdate = true;
      }
    });
  }

  private animate = () => {
    if (this.isDisposed) return;

    requestAnimationFrame(this.animate);
    if (!this.isInitialized) return;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.handleResize);

    if (this.graph) {
      this.graph.stop();
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    if (this.controls) {
      this.controls.dispose();
    }

    this.nodeMap.clear();
    this.linkMap.clear();
    this.isInitialized = false;
  }
}