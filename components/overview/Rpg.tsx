"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import Stats from 'three/examples/jsm/libs/stats.module';

const terrainShader = {
  uniforms: {
    time: { value: 0 },
    baseColor: { value: new THREE.Color(0x228B22) },
    heightMap: { value: null },
    heightScale: { value: 1.0 }
  },
  vertexShader: `
    uniform float time;
    uniform sampler2D heightMap;
    uniform float heightScale;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec4 heightData = texture2D(heightMap, uv);
      float height = heightData.r * heightScale;
      vElevation = height;
      
      vec3 newPosition = position;
      newPosition.y += height;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 baseColor;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      // Color variation based on height
      vec3 color = baseColor;
      // Darker at lower elevations, lighter at higher
      color *= 0.5 + vElevation * 0.5;
      
      // Add some subtle movement/noise
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233)) + time * 0.1) * 43758.5453) * 0.1;
      
      gl_FragColor = vec4(color * (0.9 + noise), 1.0);
    }
  `
};

const waterShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0x0077be) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    
    // Simple noise function
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Create multiple wave layers
      float wave1 = sin(uv.x * 10.0 + time) * 0.02;
      float wave2 = sin(uv.y * 8.0 + time * 0.8) * 0.015;
      float wave3 = sin(uv.x * 5.0 + uv.y * 5.0 + time * 1.2) * 0.01;
      
      // Add noise for sparkle effect
      float sparkle = noise(uv * 50.0 + time * 0.05) * 0.05;
      
      // Combine waves and sparkle
      vec3 finalColor = color + vec3(wave1 + wave2 + wave3) + vec3(sparkle);
      
      gl_FragColor = vec4(finalColor, 0.85);
    }
  `
};

const RegionType = {
  GRASS: 'grass',
  WATER: 'water',
  PATH: 'path',
  MOUNTAIN: 'mountain'
};

const generateMapData = () => {
  const width = 20;
  const height = 20;
  const regions = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let type = RegionType.GRASS;
      
      if ((x > 5 && x < 8 && y > 3 && y < 18) || 
          (x > 7 && x < 15 && y > 14 && y < 18)) {
        type = RegionType.WATER;
      }
      
      if ((x > 3 && x < 18 && y > 9 && y < 12) || 
          (x > 8 && x < 11 && y > 3 && y < 18)) {
        type = RegionType.PATH;
      }
      
      if ((x < 3 || x > width - 3 || y < 3 || y > height - 3) && 
          Math.random() < 0.4) {
        type = RegionType.MOUNTAIN;
      }
      
      regions.push({ x, y, type, width: 1, height: 1 });
    }
  }
  
  return { regions, width, height };
};

const RPGGame = ({ onSceneCreated }) => {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const arrowsRef = useRef([]);

  const gameState = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    composer: null,
    clock: new THREE.Clock(),
    stats: null,
    character: null,
    characterMixer: null,
    animations: {},
    targetPosition: new THREE.Vector3(),
    isMoving: false,
    moveSpeed: 5,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    groundPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    intersectionPoint: new THREE.Vector3(),
    heightMap: null,
    terrain: null
  });

  const loadHeightMap = () => {
    const textureLoader = new THREE.TextureLoader();
    return new Promise((resolve) => {
      textureLoader.load(
        '/hmap.png', 
        (texture) => {
          gameState.current.heightMap = texture;
          resolve(texture);
        }
      );
    });
  };

  const initializeScene = async () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 15, 20);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    scene.add(directionalLight);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.4, 0.85));

    const stats = Stats();
    mountRef.current.appendChild(stats.dom);

    gameState.current = { ...gameState.current, scene, camera, renderer, controls, composer, stats };
    onSceneCreated(scene);

    await loadHeightMap();

    const { regions, width, height } = generateMapData();
    createEnvironment(regions, width, height);

    loadCharacterModel();

    window.addEventListener('resize', handleResize);
    canvasRef.current.addEventListener('click', handleCanvasClick);
    canvasRef.current.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      handleRightClick(e);
    });

    animate();
    setIsLoading(false);
  };

  const handleResize = () => {
    const { camera, renderer, composer } = gameState.current;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  };

  const handleCanvasClick = (event) => {
    const { raycaster, camera, mouse, groundPlane, intersectionPoint } = gameState.current;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      gameState.current.targetPosition.copy(intersectionPoint);
      gameState.current.isMoving = true;

      if (gameState.current.characterMixer && gameState.current.animations.walk) {
        gameState.current.characterMixer.clipAction(gameState.current.animations.idle).fadeOut(0.2);
        gameState.current.characterMixer.clipAction(gameState.current.animations.walk).reset().fadeIn(0.2).play();
      }
    }
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    const { raycaster, camera, mouse, groundPlane, intersectionPoint } = gameState.current;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      fireArrow(intersectionPoint);
    }
  };

  const createEnvironment = (regions, mapWidth, mapHeight) => {
    const { scene, heightMap } = gameState.current;
    const scale = 1;
    const offsetX = -(mapWidth * scale) / 2;
    const offsetZ = -(mapHeight * scale) / 2;

    const terrainGeometry = new THREE.PlaneGeometry(mapWidth * scale, mapHeight * scale, 64, 64);
    const terrainMaterial = new THREE.ShaderMaterial({
      ...terrainShader,
      uniforms: {
        ...terrainShader.uniforms,
        heightMap: { value: heightMap },
        heightScale: { value: 2.0 }
      },
      side: THREE.DoubleSide
    });
    
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(mapWidth * scale / 2 + offsetX, 0, mapHeight * scale / 2 + offsetZ);
    terrain.receiveShadow = true;
    scene.add(terrain);
    gameState.current.terrain = terrain;

    regions.forEach(region => {
      const x = region.x * scale + offsetX;
      const z = region.y * scale + offsetZ;
      const width = region.width * scale;
      const depth = region.height * scale;

      let mesh;
      switch (region.type) {
        case RegionType.WATER:
          const waterGeometry = new THREE.PlaneGeometry(width, depth, 8, 8);
          const waterMaterial = new THREE.ShaderMaterial(waterShader);
          mesh = new THREE.Mesh(waterGeometry, waterMaterial);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.y = 0.05;
          break;
        case RegionType.PATH:
          const pathGeometry = new THREE.PlaneGeometry(width, depth);
          const pathMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xc2b280,
            roughness: 0.8,
            metalness: 0.1
          });
          mesh = new THREE.Mesh(pathGeometry, pathMaterial);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.y = 0.1;
          break;
        case RegionType.MOUNTAIN:
          const mountainGeometry = new THREE.ConeGeometry(0.5, 1.5, 4);
          const mountainMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9 
          });
          mesh = new THREE.Mesh(mountainGeometry, mountainMaterial);
          mesh.position.y = 0.75; 
          break;
        default:
          return;
      }

      if (mesh) {
        mesh.position.set(x + width / 2, mesh.position.y, z + depth / 2);
        mesh.castShadow = region.type === RegionType.MOUNTAIN;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }
    });

    const startRegion = regions.find(r => r.type === RegionType.PATH);
    if (startRegion && gameState.current.character) {
      const x = (startRegion.x + startRegion.width / 2) * scale + offsetX;
      const z = (startRegion.y + startRegion.height / 2) * scale + offsetZ;
      gameState.current.character.position.set(x, 0, z);
      gameState.current.targetPosition.set(x, 0, z);
    }
  };

  const loadCharacterModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        model.position.set(0, 0, 0);
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        gameState.current.scene.add(model);
        gameState.current.character = model;

        if (gltf.animations && gltf.animations.length) {
          const mixer = new THREE.AnimationMixer(model);
          gameState.current.characterMixer = mixer;

          gltf.animations.forEach(clip => {
            const name = clip.name.toLowerCase();
            if (name.includes('idle')) gameState.current.animations.idle = clip;
            else if (name.includes('walk')) gameState.current.animations.walk = clip;
            else if (name.includes('run')) gameState.current.animations.run = clip;
            else if (name.includes('attack')) gameState.current.animations.attack = clip;
          });

          if (gameState.current.animations.idle) {
            mixer.clipAction(gameState.current.animations.idle).play();
          }
        }

        const { regions, width, height } = generateMapData();
        const startRegion = regions.find(r => r.type === RegionType.PATH);
        if (startRegion) {
          const scale = 1;
          const offsetX = -(width * scale) / 2;
          const offsetZ = -(height * scale) / 2;
          const x = (startRegion.x + startRegion.width / 2) * scale + offsetX;
          const z = (startRegion.y + startRegion.height / 2) * scale + offsetZ;
          model.position.set(x, 0, z);
          gameState.current.targetPosition.set(x, 0, z);
        }
      },
      undefined,
      (error) => console.error('Error loading character model:', error)
    );
  };

  const fireArrow = (targetPos) => {
    const { scene, character } = gameState.current;
    if (!character) return;

    if (gameState.current.characterMixer && gameState.current.animations.attack) {
      gameState.current.characterMixer
        .clipAction(gameState.current.animations.attack)
        .reset()
        .setLoop(THREE.LoopOnce)
        .play();
    }

    const arrowLength = 0.8;
    const arrowGeometry = new THREE.CylinderGeometry(0.02, 0.02, arrowLength, 8);
    const arrowHeadGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const arrowHeadMaterial = new THREE.MeshStandardMaterial({ color: 0x5b3a29 });
    
    const arrowBody = new THREE.Mesh(arrowGeometry, arrowMaterial);
    const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
    arrowHead.position.y = arrowLength / 2; 
    
    const arrow = new THREE.Group();
    arrow.add(arrowBody);
    arrow.add(arrowHead);

    const startPosition = character.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    
    const direction = new THREE.Vector3().subVectors(targetPos, startPosition).normalize();
    
    arrow.position.copy(startPosition);
    
    arrow.lookAt(targetPos);
    arrow.rotateX(Math.PI / 2);
    
    scene.add(arrow);
    
    const midPoint = startPosition.clone().add(
      direction.clone().multiplyScalar(5)
    );
    midPoint.y += 3; 
    
    const points = [
      startPosition.clone(),
      midPoint,
      targetPos.clone()
    ];
    
    const curve = new THREE.CatmullRomCurve3(points);
    
    arrowsRef.current.push({
      mesh: arrow,
      curve: curve,
      progress: 0,
      speed: 0.02, 
      alive: true
    });
  };

  const updateArrows = (delta) => {
    const { scene } = gameState.current;
    
    arrowsRef.current = arrowsRef.current.filter(arrow => {
      if (!arrow.alive) return false;
      
      arrow.progress += arrow.speed;
      
      if (arrow.progress >= 1) {
        scene.remove(arrow.mesh);
        return false;
      }
      
      const position = arrow.curve.getPointAt(arrow.progress);
      arrow.mesh.position.copy(position);
      
      if (arrow.progress < 0.99) {
        const tangent = arrow.curve.getTangentAt(arrow.progress);
        const lookAtPos = position.clone().add(tangent);
        arrow.mesh.lookAt(lookAtPos);
        arrow.mesh.rotateX(Math.PI / 2);
      }
      
      return true;
    });
  };

  const animate = () => {
    if (!gameState.current.scene) return;
    
    const { scene, camera, renderer, controls, composer, clock, stats, character, characterMixer, terrain } = gameState.current;
    const delta = clock.getDelta();

    if (character && gameState.current.isMoving) {
      const direction = new THREE.Vector3().subVectors(gameState.current.targetPosition, character.position).normalize();
      const distance = character.position.distanceTo(gameState.current.targetPosition);

      if (distance > 0.1) {
        const moveDistance = gameState.current.moveSpeed * delta;
        character.position.add(direction.multiplyScalar(Math.min(moveDistance, distance)));
        character.rotation.y = Math.atan2(direction.x, direction.z);
      } else {
        gameState.current.isMoving = false;
        if (characterMixer && gameState.current.animations.idle) {
          characterMixer.clipAction(gameState.current.animations.walk).fadeOut(0.2);
          characterMixer.clipAction(gameState.current.animations.idle).reset().fadeIn(0.2).play();
        }
      }
    }

    updateArrows(delta);

    scene.traverse(object => {
      if (object.material && object.material.uniforms && object.material.uniforms.time) {
        object.material.uniforms.time.value += delta;
      }
    });

    if (characterMixer) characterMixer.update(delta);
    controls.update();
    composer.render();
    stats.update();
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    initializeScene();
    return () => {
      const { scene, renderer } = gameState.current;
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick);
        canvasRef.current.removeEventListener('contextmenu', handleRightClick);
      }
      if (scene) scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div className="rpg-game" ref={mountRef}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {isLoading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', background: 'rgba(0,0,0,0.7)', padding: '20px' }}>
          Loading...
        </div>
      )}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px' }}>
        <p>Left Click: Move</p>
        <p>Right Click: Shoot Arrow</p>
        <p>Mouse Wheel: Zoom</p>
        <p>Drag: Rotate Camera</p>
      </div>
    </div>
  );
};

const SkyBox = ({ scene, timeOfDay }) => {
  useEffect(() => {
    const existingSky = scene.getObjectByName('skybox');
    if (existingSky) scene.remove(existingSky);
    
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    let skyMaterial;
    
    switch (timeOfDay) {
      case 'dawn':
        skyMaterial = new THREE.ShaderMaterial({
          uniforms: {
            topColor: { value: new THREE.Color(0xff7e50) },
            bottomColor: { value: new THREE.Color(0xffd4a8) }
          },
          vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
              float h = normalize(vWorldPosition).y;
              gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h)), 1.0);
            }
          `,
          side: THREE.BackSide
        });
        break;
      case 'day':
        skyMaterial = new THREE.ShaderMaterial({
          uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0x87ceeb) }
          },
          vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
              float h = normalize(vWorldPosition).y;
              gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h)), 1.0);
            }
          `,
          side: THREE.BackSide
        });
        break;
      case 'dusk':
        skyMaterial = new THREE.ShaderMaterial({
          uniforms: {
            topColor: { value: new THREE.Color(0x7e2553) },
            bottomColor: { value: new THREE.Color(0xff8e7a) }
          },
          vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
              float h = normalize(vWorldPosition).y;
              gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h)), 1.0);
            }
          `,
          side: THREE.BackSide
        });
        break;
      case 'night':
        skyMaterial = new THREE.ShaderMaterial({
          uniforms: {
            topColor: { value: new THREE.Color(0x000011) },
            bottomColor: { value: new THREE.Color(0x110033) },
            starIntensity: { value: 0.5 },
            starDensity: { value: 800.0 }
          },
          vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float starIntensity;
            uniform float starDensity;
            varying vec3 vWorldPosition;
            
            float rand(vec2 n) { 
              return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }
            
            void main() {
              float h = normalize(vWorldPosition).y;
              vec3 skyColor = mix(bottomColor, topColor, max(0.0, h));
              
              // Stars calculation
              vec2 pos = vWorldPosition.xz * starDensity;
              float brightness = rand(floor(pos)) * starIntensity;
              brightness *= step(0.97, brightness); // Only show brightest stars
              brightness *= smoothstep(-0.3, 0.6, h); // Stars only appear higher in the sky
              
              gl_FragColor = vec4(skyColor + vec3(brightness), 1.0);
            }
          `,
          side: THREE.BackSide
        });
        break;
    }

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.name = 'skybox';
    scene.add(sky);
 
    scene.children.forEach(child => {
      if (child.type === 'DirectionalLight' || child.type === 'HemisphereLight') {
        scene.remove(child);
      }
    });

    let lightColor, lightIntensity, ambientIntensity;
    
    switch (timeOfDay) {
      case 'dawn':
        lightColor = 0xffd4a8;
        lightIntensity = 0.8;
        ambientIntensity = 0.4;
        break;
      case 'day':
        lightColor = 0xffffff;
        lightIntensity = 1.0;
        ambientIntensity = 0.6;
        break;
      case 'dusk':
        lightColor = 0xffacac;
        lightIntensity = 0.7;
        ambientIntensity = 0.3;
        break;
      case 'night':
        lightColor = 0x8888ff;
        lightIntensity = 0.2;
        ambientIntensity = 0.1;
        break;
      default:
        lightColor = 0xffffff;
        lightIntensity = 1.0;
        ambientIntensity = 0.5;
    }

    const ambientLight = new THREE.AmbientLight(lightColor, ambientIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(lightColor, lightIntensity);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    const shadowSize = timeOfDay === 'night' ? 15 : 30;
    directionalLight.shadow.camera.left = -shadowSize;
    directionalLight.shadow.camera.right = shadowSize;
    directionalLight.shadow.camera.top = shadowSize;
    directionalLight.shadow.camera.bottom = -shadowSize;
    
    scene.add(directionalLight);

    return () => {
      scene.remove(sky);
      scene.remove(ambientLight);
      scene.remove(directionalLight);
    };
  }, [scene, timeOfDay]);

  return null;
};

const WeatherEffect = ({ scene, weatherType }) => {
  useEffect(() => {
    if (weatherType === 'none') return;

    let particleSystem;
    
    if (weatherType === 'rain') {
      const rainCount = 3000;
      const rainGeometry = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      const rainSpeeds = new Float32Array(rainCount);
      const rainSizes = new Float32Array(rainCount);
      
      const areaSize = 50;
      const heights = 30;
      
      for (let i = 0; i < rainCount; i++) {
        const i3 = i * 3;
        rainPositions[i3] = (Math.random() - 0.5) * areaSize;
        rainPositions[i3 + 1] = Math.random() * heights;
        rainPositions[i3 + 2] = (Math.random() - 0.5) * areaSize;
        
        rainSpeeds[i] = 15 + Math.random() * 10;
        rainSizes[i] = 0.1 + Math.random() * 0.2;
      }
      
      rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      rainGeometry.setAttribute('speed', new THREE.BufferAttribute(rainSpeeds, 1));
      rainGeometry.setAttribute('size', new THREE.BufferAttribute(rainSizes, 1));
      
      const rainMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0xaaaaff) }
        },
        vertexShader: `
          attribute float speed;
          attribute float size;
          uniform float time;
          
          void main() {
            vec3 pos = position;
            pos.y = mod(pos.y - speed * time, 30.0);
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          
          void main() {
            // Elongated raindrop shape
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(gl_PointCoord, center);
            if (dist > 0.5) discard;
            
            // Add slight blue tint
            gl_FragColor = vec4(color, 1.0 - dist * 1.5);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      particleSystem = new THREE.Points(rainGeometry, rainMaterial);
      
    } else if (weatherType === 'snow') {
      const snowCount = 2000;
      const snowGeometry = new THREE.BufferGeometry();
      const snowPositions = new Float32Array(snowCount * 3);
      const snowSpeeds = new Float32Array(snowCount);
      const snowSizes = new Float32Array(snowCount);
      const snowAngles = new Float32Array(snowCount);
      const snowAngleSpeeds = new Float32Array(snowCount);
      
      const areaSize = 50;
      const heights = 30;
      
      for (let i = 0; i < snowCount; i++) {
        const i3 = i * 3;
        snowPositions[i3] = (Math.random() - 0.5) * areaSize;
        snowPositions[i3 + 1] = Math.random() * heights;
        snowPositions[i3 + 2] = (Math.random() - 0.5) * areaSize;
        snowSpeeds[i] = 1 + Math.random() * 2;
        snowSizes[i] = 0.2 + Math.random() * 0.3;
        snowAngles[i] = Math.random() * Math.PI * 2;
        snowAngleSpeeds[i] = (Math.random() - 0.5) * 0.02;
      }
      
      snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
      snowGeometry.setAttribute('speed', new THREE.BufferAttribute(snowSpeeds, 1));
      snowGeometry.setAttribute('size', new THREE.BufferAttribute(snowSizes, 1));
      snowGeometry.setAttribute('angle', new THREE.BufferAttribute(snowAngles, 1));
      snowGeometry.setAttribute('angleSpeed', new THREE.BufferAttribute(snowAngleSpeeds, 1));
      
      const snowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
          attribute float speed;
          attribute float size;
          attribute float angle;
          attribute float angleSpeed;
          uniform float time;
          
          varying float vAngle;
          
          void main() {
            vec3 pos = position;
            
            // Apply swaying motion - left to right
            pos.x += sin(time * 0.5 + pos.y * 0.1) * 0.5;
            
            // Falling motion
            pos.y = mod(pos.y - speed * time, 30.0);
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            
            // Pass angle to fragment shader
            vAngle = angle + time * angleSpeed;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying float vAngle;
          
          void main() {
            // Create snowflake shape
            vec2 center = vec2(0.5, 0.5);
            vec2 coords = gl_PointCoord - center;
            
            // Rotate the coordinates
            float cosA = cos(vAngle);
            float sinA = sin(vAngle);
            vec2 rotatedCoords = vec2(
              coords.x * cosA - coords.y * sinA,
              coords.x * sinA + coords.y * cosA
            );
            
            // Snowflake shape - create a simple 6-armed snowflake
            float radius = length(rotatedCoords);
            float angle = atan(rotatedCoords.y, rotatedCoords.x);
            
            // Base circle
            float snowflake = 1.0 - smoothstep(0.3, 0.5, radius);
            
            // Add arms
            snowflake += (1.0 - smoothstep(0.0, 0.1, abs(sin(angle * 6.0)) * radius)) * (1.0 - snowflake) * 0.7;
            
            if (snowflake < 0.1) discard;
            
            gl_FragColor = vec4(color, snowflake);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      particleSystem = new THREE.Points(snowGeometry, snowMaterial);
    }
    
    if (particleSystem) {
      particleSystem.name = 'weatherEffect';
      scene.add(particleSystem);
      
      const animate = () => {
        if (!scene.getObjectByName('weatherEffect')) return;
        
        const material = particleSystem.material;
        if (material.uniforms && material.uniforms.time) {
          material.uniforms.time.value += 0.01;
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    }
    
    return () => {
      const existingEffect = scene.getObjectByName('weatherEffect');
      if (existingEffect) scene.remove(existingEffect);
    };
  }, [scene, weatherType]);

  return null;
};

const App = () => {
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [weatherType, setWeatherType] = useState('none');
  const sceneRef = useRef(null);

  const handleSceneCreated = (scene) => {
    sceneRef.current = scene;
  };

  return (
    <div className="relative w-full h-screen">
      <RPGGame onSceneCreated={handleSceneCreated} />
      {sceneRef.current && (
        <>
          <SkyBox scene={sceneRef.current} timeOfDay={timeOfDay} />
          <WeatherEffect scene={sceneRef.current} weatherType={weatherType} />
        </>
      )}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Time of Day</h3>
          <select 
            value={timeOfDay} 
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded w-full"
          >
            <option value="dawn">Dawn</option>
            <option value="day">Day</option>
            <option value="dusk">Dusk</option>
            <option value="night">Night</option>
          </select>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Weather</h3>
          <select 
            value={weatherType} 
            onChange={(e) => setWeatherType(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded w-full"
          >
            <option value="none">Clear</option>
            <option value="rain">Rain</option>
            <option value="snow">Snow</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default App;