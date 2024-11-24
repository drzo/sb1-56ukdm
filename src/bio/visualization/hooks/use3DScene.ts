import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Logger } from '@/cogutil/Logger';

interface SceneConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  cameraPosition?: { x: number; y: number; z: number };
}

export function use3DScene(container: HTMLElement | null, config: SceneConfig) {
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!container) return;

    try {
      // Initialize scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(config.backgroundColor || '#1a1a1a');
      sceneRef.current = scene;

      // Initialize camera
      const camera = new THREE.PerspectiveCamera(
        75,
        config.width / config.height,
        0.1,
        1000
      );
      camera.position.set(
        config.cameraPosition?.x || 0,
        config.cameraPosition?.y || 0,
        config.cameraPosition?.z || 50
      );
      cameraRef.current = camera;

      // Initialize renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(config.width, config.height);
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Initialize controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(10, 10, 10);
      scene.add(directionalLight);

      setIsInitialized(true);
      Logger.info('3D scene initialized');

      // Cleanup
      return () => {
        controls.dispose();
        renderer.dispose();
        container.removeChild(renderer.domElement);
        Logger.info('3D scene disposed');
      };
    } catch (error) {
      Logger.error('Failed to initialize 3D scene:', error);
      throw error;
    }
  }, [container]);

  const animate = () => {
    if (!isInitialized) return;

    requestAnimationFrame(animate);
    controlsRef.current?.update();
    rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
  };

  useEffect(() => {
    if (isInitialized) {
      animate();
    }
  }, [isInitialized]);

  const resize = (width: number, height: number) => {
    if (!isInitialized) return;

    cameraRef.current!.aspect = width / height;
    cameraRef.current!.updateProjectionMatrix();
    rendererRef.current!.setSize(width, height);
  };

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    controls: controlsRef.current,
    isInitialized,
    resize
  };
}