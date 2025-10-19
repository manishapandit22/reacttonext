"use client"
// import React, { useEffect, useRef, useState } from 'react';
// // import * as tf from 'tensorflow';

// const questGraph = {
//   start: { 
//     id: 'start',
//     clue: 'Find the ancient tower to begin your journey.',
//     connects: ['tower'],
//     position: { x: 120, y: 80 },
//     region: 'forest'
//   },
//   tower: { 
//     id: 'tower',
//     clue: 'The tower reveals the hidden cave entrance.',
//     connects: ['cave'],
//     position: { x: 220, y: 150 },
//     region: 'mountains'
//   },
//   cave: { 
//     id: 'cave',
//     clue: 'Inside the cave lies a map to the abandoned village.',
//     connects: ['village'],
//     position: { x: 350, y: 180 },
//     region: 'cave'
//   },
//   village: { 
//     id: 'village',
//     clue: 'The village elder\'s house contains the key to the treasure.',
//     connects: ['treasure'],
//     position: { x: 400, y: 240 },
//     region: 'village'
//   },
//   treasure: { 
//     id: 'treasure',
//     clue: 'You found the hidden treasure!',
//     connects: [],
//     position: { x: 500, y: 300 },
//     region: 'beach'
//   }
// };

// function aStar(start, goal, graph) {
//   const closedSet = new Set();
  
//   const openSet = new Set([start]);
  
//   const cameFrom = {};
  
//   const gScore = {};
//   for (const node in graph) {
//     gScore[node] = Infinity;
//   }
//   gScore[start] = 0;
  
//   const fScore = {};
//   for (const node in graph) {
//     fScore[node] = Infinity;
//   }
  
//   const heuristic = (node) => {
//     const dx = graph[node].position.x - graph[goal].position.x;
//     const dy = graph[node].position.y - graph[goal].position.y;
//     return Math.sqrt(dx * dx + dy * dy);
//   };
  
//   fScore[start] = heuristic(start);
  
//   while (openSet.size > 0) {
//     let current = null;
//     let lowestFScore = Infinity;
    
//     for (const node of openSet) {
//       if (fScore[node] < lowestFScore) {
//         lowestFScore = fScore[node];
//         current = node;
//       }
//     }
    
//     if (current === goal) {
//       const path = [current];
//       while (cameFrom[current]) {
//         current = cameFrom[current];
//         path.unshift(current);
//       }
//       return path;
//     }
    
//     openSet.delete(current);
//     closedSet.add(current);
    
//     for (const neighbor of graph[current].connects) {
//       if (closedSet.has(neighbor)) {
//         continue;
//       }
      
//       const tentativeGScore = gScore[current] + 1;
      
//       if (!openSet.has(neighbor)) {
//         openSet.add(neighbor);
//       } else if (tentativeGScore >= gScore[neighbor]) {
//         continue;
//       }
      
//       cameFrom[neighbor] = current;
//       gScore[neighbor] = tentativeGScore;
//       fScore[neighbor] = gScore[neighbor] + heuristic(neighbor);
//     }
//   }
  
//   return null;
// }

// export default function HiddenQuestMap() {
//   const canvasRef = useRef(null);
//   const [mapImage, setMapImage] = useState(null);
//   const [currentNode, setCurrentNode] = useState('start');
//   const [discoveredNodes, setDiscoveredNodes] = useState(['start']);
//   const [segmentedRegions, setSegmentedRegions] = useState({});
//   const [message, setMessage] = useState(questGraph.start.clue);
  
//   useEffect(() => {
//     const loadImage = async () => {
//       const image = new Image();
//       image.src = "https://tasshin.com/wp-content/uploads/2024/02/quest-map.png"; 
      
//       image.onload = () => {
//         setMapImage(image);
        
//         setSegmentedRegions({
//           forest: { x: 50, y: 50, width: 150, height: 100 },
//           mountains: { x: 200, y: 100, width: 100, height: 150 },
//           cave: { x: 300, y: 150, width: 100, height: 80 },
//           village: { x: 350, y: 200, width: 120, height: 100 },
//           beach: { x: 450, y: 250, width: 100, height: 100 }
//         });
//       };
//     };
    
//     loadImage();
//   }, []);
  
//   useEffect(() => {
//     if (!canvasRef.current || !mapImage || Object.keys(segmentedRegions).length === 0) return;
    
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
    
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    
//     Object.entries(segmentedRegions).forEach(([region, bounds]) => {
//       const nodesInRegion = Object.values(questGraph).filter(node => node.region === region);
//       const isDiscovered = nodesInRegion.some(node => discoveredNodes.includes(node.id));
      
//       ctx.globalAlpha = isDiscovered ? 0.3 : 0.1;
//       ctx.fillStyle = isDiscovered ? '#38b2ac' : '#a0aec0';
//       ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      
//       ctx.globalAlpha = isDiscovered ? 1 : 0.5;
//       ctx.fillStyle = isDiscovered ? '#234e52' : '#4a5568';
//       ctx.font = '12px sans-serif';
//       ctx.textAlign = 'center';
//       ctx.fillText(region.charAt(0).toUpperCase() + region.slice(1), 
//         bounds.x + bounds.width / 2, 
//         bounds.y + bounds.height / 2);
//     });
    
//     ctx.globalAlpha = 1;
    
//     discoveredNodes.forEach(nodeId => {
//       const node = questGraph[nodeId];
      
//       ctx.beginPath();
//       ctx.arc(node.position.x, node.position.y, 10, 0, Math.PI * 2);
//       ctx.fillStyle = nodeId === currentNode ? '#ed8936' : '#4299e1';
//       ctx.fill();
//       ctx.strokeStyle = '#2c5282';
//       ctx.lineWidth = 2;
//       ctx.stroke();
      
//       ctx.fillStyle = '#1a202c';
//       ctx.font = '12px sans-serif';
//       ctx.textAlign = 'center';
//       ctx.fillText(node.id, node.position.x, node.position.y - 15);
      
//       node.connects.forEach(targetId => {
//         if (discoveredNodes.includes(targetId)) {
//           const target = questGraph[targetId];
//           ctx.beginPath();
//           ctx.moveTo(node.position.x, node.position.y);
//           ctx.lineTo(target.position.x, target.position.y);
//           ctx.strokeStyle = '#4299e1';
//           ctx.lineWidth = 3;
//           ctx.stroke();
//         }
//       });
//     });
    
//   }, [mapImage, segmentedRegions, discoveredNodes, currentNode]);
  
//   const handleNodeClick = (nodeId) => {
//     if (!discoveredNodes.includes(nodeId)) return;
    
//     setCurrentNode(nodeId);
//     setMessage(questGraph[nodeId].clue);
    
//     const newDiscoveredNodes = [...discoveredNodes];
//     questGraph[nodeId].connects.forEach(connectedId => {
//       if (!newDiscoveredNodes.includes(connectedId)) {
//         newDiscoveredNodes.push(connectedId);
//       }
//     });
    
//     setDiscoveredNodes(newDiscoveredNodes);
//   };
  
//   const findNextClue = () => {
//     const target = Object.keys(questGraph).find(nodeId => 
//       !discoveredNodes.includes(nodeId) && 
//       Object.values(questGraph).some(node => 
//         discoveredNodes.includes(node.id) && 
//         node.connects.includes(nodeId)
//       )
//     );
    
//     if (target) {
//       let bestPath = null;
//       let shortestLength = Infinity;
      
//       discoveredNodes.forEach(startNode => {
//         const path = aStar(startNode, target, questGraph);
//         if (path && path.length < shortestLength) {
//           shortestLength = path.length;
//           bestPath = path;
//         }
//       });
      
//       if (bestPath) {
//         setMessage(`Hint: Try exploring from ${bestPath[0]} toward ${questGraph[bestPath[0]].region}`);
//       }
//     } else if (discoveredNodes.includes('treasure')) {
//       setMessage("Congratulations! You've completed the quest!");
//     } else {
//       setMessage("Keep exploring the discovered areas for more clues!");
//     }
//   };
  
//   return (
//     <div className="flex flex-col items-center p-4 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg">
//       <h1 className="text-2xl font-bold mb-4 text-indigo-800">Hidden Quest Map</h1>
      
//       <div className="relative mb-4">
//         <canvas
//           ref={canvasRef}
//           width={600}
//           height={400}
//           className="border-2 border-gray-300 rounded-lg"
//         />
        
//         <div className="absolute top-0 left-0">
//           {Object.values(questGraph).map(node => 
//             discoveredNodes.includes(node.id) && (
//               <button
//                 key={node.id}
//                 className="absolute w-6 h-6 rounded-full bg-transparent cursor-pointer"
//                 style={{
//                   left: node.position.x - 12,
//                   top: node.position.y - 12,
//                 }}
//                 onClick={() => handleNodeClick(node.id)}
//                 aria-label={`Visit ${node.id}`}
//               />
//             )
//           )}
//         </div>
//       </div>
      
//       <div className="bg-white p-4 rounded-lg shadow w-full mb-4">
//         <p className="text-gray-800 font-medium">{message}</p>
//       </div>
      
//       <div className="flex gap-4">
//         <button 
//           className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//           onClick={findNextClue}
//         >
//           Get Hint
//         </button>
        
//         <button
//           className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//           onClick={() => {
//             setCurrentNode('start');
//             setDiscoveredNodes(['start']);
//             setMessage(questGraph.start.clue);
//           }}
//         >
//           Reset Quest
//         </button>
//       </div>
      
//       <div className="mt-4 text-sm text-gray-600">
//         <p>Current Location: {questGraph[currentNode].region} ({currentNode})</p>
//         <p>Discovered Areas: {discoveredNodes.map(id => questGraph[id].region).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</p>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TensorFlowManager, SEGMENTATION_MODELS } from './tensor';

export default function RPGMapGame() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const segmentationCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [tfManager] = useState(new TensorFlowManager());
  
  const [gameState, setGameState] = useState({
    mapLoaded: false,
    playerPosition: { x: 0, z: 0 },
    enemies: [],
    arrows: [],
    regions: [],
    gameMessage: "Initializing TensorFlow...",
    tfInitialized: false,
    modelLoaded: false,
    modelName: "",
    processingImage: false
  });

  useEffect(() => {
    async function setupTensorFlow() {
      try {
        const initResult = await tfManager.initialize();
        
        if (initResult.success) {
          setGameState(prev => ({
            ...prev, 
            tfInitialized: true,
            gameMessage: `TensorFlow initialized with ${initResult.backend} backend. Loading segmentation model...`
          }));
          
          const modelKey = 'DEEPLAB'; 
          const modelResult = await tfManager.loadModel(modelKey);
          
          if (modelResult.success) {
            setGameState(prev => ({
              ...prev, 
              modelLoaded: true,
              modelName: modelResult.modelName,
              gameMessage: `${modelResult.modelName} model loaded. Upload a map image to begin!`
            }));
          } else {
            setGameState(prev => ({
              ...prev, 
              gameMessage: `Failed to load model: ${modelResult.error}. Will use simple color-based segmentation.`
            }));
          }
        } else {
          setGameState(prev => ({
            ...prev, 
            gameMessage: `TensorFlow initialization failed: ${initResult.error}`
          }));
        }
      } catch (error) {
        console.error("TensorFlow setup error:", error);
        setGameState(prev => ({
          ...prev, 
          gameMessage: `Error setting up TensorFlow: ${error.message}`
        }));
      }
    }
    
    setupTensorFlow();
    
    return () => {
      tfManager.dispose();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); 
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 10, 10);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.1; 
    
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);
    
    const playerGeometry = new THREE.ConeGeometry(0.3, 1, 32);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 0.5;
    player.rotation.x = Math.PI / 2;
    player.castShadow = true;
    scene.add(player);
    
    let mapMesh = null;
    let regions = [];
    let enemies = [];
    let arrows = [];
    let clock = new THREE.Clock();
    
    const PLAYER_SPEED = 0.3;
    const ARROW_SPEED = 0.7;
    const ENEMY_SPEED = 0.1;
    
    function animate() {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      enemies.forEach((enemy, index) => {
        const direction = new THREE.Vector3(
          player.position.x - enemy.position.x,
          0,
          player.position.z - enemy.position.z
        ).normalize();
        
        enemy.position.x += direction.x * ENEMY_SPEED * delta;
        enemy.position.z += direction.z * ENEMY_SPEED * delta;
        
        enemy.lookAt(player.position);
        
        if (enemy.position.distanceTo(player.position) < 0.8) {
          setGameState(prev => ({
            ...prev, 
            gameMessage: "You took damage from an enemy!"
          }));
        }
      });
      
      for (let i = arrows.length - 1; i >= 0; i--) {
        const arrow = arrows[i];
        
        arrow.translateZ(ARROW_SPEED * delta);
        
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          if (arrow.position.distanceTo(enemy.position) < 0.5) {
            scene.remove(enemy);
            scene.remove(arrow);
            enemies.splice(j, 1);
            arrows.splice(i, 1);
            setGameState(prev => ({
              ...prev, 
              gameMessage: "You hit an enemy!",
              enemies: enemies.map(e => ({
                x: e.position.x,
                z: e.position.z
              }))
            }));
            break;
          }
        }
        
        if (arrow.position.length() > 20) {
          scene.remove(arrow);
          arrows.splice(i, 1);
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
    }
    
    animate();
    
    async function createMapFromSegmentation(imageElement, segmentationMask) {
      if (mapMesh) {
        scene.remove(mapMesh);
      }
      
      regions.forEach(region => scene.remove(region));
      regions = [];
      
      const [height, width] = segmentationMask.shape;
      
      const segData = segmentationMask.dataSync();
      
      const mapSize = 20;
      const mapGeometry = new THREE.PlaneGeometry(mapSize, mapSize, 1, 1);
      mapGeometry.rotateX(-Math.PI / 2); 
      
      const texture = new THREE.Texture(imageElement);
      texture.needsUpdate = true;
      
      const mapMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        receiveShadow: true
      });
      
      mapMesh = new THREE.Mesh(mapGeometry, mapMaterial);
      scene.add(mapMesh);
      
      const regionProps = [
        {}, 
        {  
          geometry: new THREE.PlaneGeometry(1, 1),
          material: new THREE.MeshStandardMaterial({ 
            color: 0x90EE90, 
            transparent: true, 
            opacity: 0.2 
          }),
          height: 0.02
        },
        {  
          geometry: new THREE.BoxGeometry(1, 0.2, 1),
          material: new THREE.MeshStandardMaterial({ 
            color: 0x4169E1, 
            transparent: true, 
            opacity: 0.7 
          }),
          height: -0.1
        },
        {  
          geometry: new THREE.ConeGeometry(0.5, 1, 4),
          material: new THREE.MeshStandardMaterial({ 
            color: 0x8B4513
          }),
          height: 0.5
        },
        {  
          geometry: new THREE.CylinderGeometry(0.4, 0.4, 0.8, 8),
          material: new THREE.MeshStandardMaterial({ 
            color: 0x228B22
          }),
          height: 0.4
        }
      ];
      
      const cellSize = mapSize / Math.max(width, height);
      const offsetX = -mapSize / 2 + cellSize / 2;
      const offsetZ = -mapSize / 2 + cellSize / 2;
      
      for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
          const idx = z * width + x;
          const terrainType = segData[idx];
          
          if (terrainType === 0 || terrainType >= regionProps.length) continue;
          
          const props = regionProps[terrainType];
          
          const geometry = props.geometry.clone();
          if (terrainType === 1) { 
            geometry.scale(cellSize, 1, cellSize);
          } else {
            geometry.scale(cellSize, 1, cellSize);
          }
          
          const material = props.material.clone();
          const mesh = new THREE.Mesh(geometry, material);
          
          const worldX = offsetX + x * cellSize;
          const worldZ = offsetZ + z * cellSize;
          mesh.position.set(worldX, props.height, worldZ);
          
          if (terrainType === 3) { 
            mesh.rotation.x = -Math.PI / 2;
          }
          
          mesh.userData = { 
            terrainType,
            walkable: terrainType === 1,
            x, z
          };
          
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          scene.add(mesh);
          regions.push(mesh);
        }
      }
      
      const walkableRegions = regions.filter(r => r.userData.walkable);
      if (walkableRegions.length > 0) {
        const randomRegion = walkableRegions[Math.floor(Math.random() * walkableRegions.length)];
        player.position.x = randomRegion.position.x;
        player.position.z = randomRegion.position.z;
      } else {
        player.position.set(0, 0.5, 0);
      }
      
      spawnEnemies(5);
      
      setGameState(prev => ({
        ...prev,
        mapLoaded: true,
        gameMessage: "Map loaded! Use WASD to move, click to shoot arrows.",
        playerPosition: { x: player.position.x, z: player.position.z },
        regions: regions.map(r => ({
          x: r.position.x,
          z: r.position.z,
          type: r.userData.terrainType
        }))
      }));
    }
    
    function spawnEnemies(count) {
      enemies.forEach(enemy => scene.remove(enemy));
      enemies = [];
      
      const walkableRegions = regions.filter(r => r.userData.walkable);
      if (walkableRegions.length === 0) return;
      
      for (let i = 0; i < count; i++) {
        const enemyGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff });
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemy.castShadow = true;
        
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 20) {
          const randomRegion = walkableRegions[Math.floor(Math.random() * walkableRegions.length)];
          enemy.position.x = randomRegion.position.x;
          enemy.position.y = 0.25;
          enemy.position.z = randomRegion.position.z;
          
          const distToPlayer = enemy.position.distanceTo(player.position);
          if (distToPlayer > 5) {
            validPosition = true;
          }
          
          attempts++;
        }
        
        scene.add(enemy);
        enemies.push(enemy);
      }
      
      setGameState(prev => ({
        ...prev,
        enemies: enemies.map(e => ({
          x: e.position.x,
          z: e.position.z
        }))
      }));
    }
    
    function shootArrow() {
      const arrowGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12);
      const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
      
      arrow.position.copy(player.position);
      
      arrow.rotation.copy(player.rotation);
      
      scene.add(arrow);
      arrows.push(arrow);
      
      setGameState(prev => ({
        ...prev,
        gameMessage: "You shot an arrow!"
      }));
    }
    
    function handleKeyDown(e) {
      if (!gameState.mapLoaded) return;
      
      const moveDistance = PLAYER_SPEED;
      
      const oldX = player.position.x;
      const oldZ = player.position.z;
      
      switch (e.key.toLowerCase()) {
        case 'w':
          player.position.z -= moveDistance;
          player.rotation.y = Math.PI;
          break;
        case 's':
          player.position.z += moveDistance;
          player.rotation.y = 0;
          break;
        case 'a':
          player.position.x -= moveDistance;
          player.rotation.y = Math.PI / 2;
          break;
        case 'd':
          player.position.x += moveDistance;
          player.rotation.y = -Math.PI / 2;
          break;
        default:
          break;
      }
      
      let collision = false;
      
      let currentRegion = null;
      for (const region of regions) {
        const dx = Math.abs(player.position.x - region.position.x);
        const dz = Math.abs(player.position.z - region.position.z);
        
        const cellSize = 20 / Math.sqrt(regions.length);
        
        if (dx < cellSize/2 && dz < cellSize/2) {
          currentRegion = region;
          break;
        }
      }
      
      if (currentRegion && !currentRegion.userData.walkable) {
        collision = true;
      }
      
      if (
        player.position.x < -10 || 
        player.position.x > 10 || 
        player.position.z < -10 || 
        player.position.z > 10 ||
        collision
      ) {
        player.position.x = oldX;
        player.position.z = oldZ;
      }
      
      setGameState(prev => ({
        ...prev,
        playerPosition: { x: player.position.x, z: player.position.z }
      }));
    }
    
    function handleClick() {
      if (gameState.mapLoaded) {
        shootArrow();
      }
    }
    
    function handleResize() {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    
    window.processMapImage = async (imageFile) => {
      if (!imageFile || !tfManager) return;
      
      try {
        setGameState(prev => ({
          ...prev, 
          processingImage: true,
          gameMessage: "Processing image with TensorFlow.js..."
        }));
        
        const img = new Image();
        img.onload = async () => {
          try {
            let segmentationMask;
            
            if (gameState.modelLoaded) {
              segmentationMask = await tfManager.segmentImage(img);
              
              if (segmentationCanvasRef.current) {
                await tfManager.visualizeSegmentation(img, segmentationCanvasRef.current);
              }
            } else {
              segmentationMask = tfManager.createFallbackSegmentation(img);
            }
            
            await createMapFromSegmentation(img, segmentationMask);
            
            segmentationMask.dispose();
            
            setGameState(prev => ({
              ...prev,
              processingImage: false
            }));
          } catch (error) {
            console.error("Error processing image:", error);
            setGameState(prev => ({
              ...prev, 
              processingImage: false,
              gameMessage: `Error processing image: ${error.message}`
            }));
          }
        };
        
        img.onerror = () => {
          setGameState(prev => ({
            ...prev, 
            processingImage: false,
            gameMessage: "Failed to load image."
          }));
        };
        
        img.src = URL.createObjectURL(imageFile);
      } catch (error) {
        console.error("Error preparing image:", error);
        setGameState(prev => ({
          ...prev, 
          processingImage: false,
          gameMessage: `Error preparing image: ${error.message}`
        }));
      }
    };
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      
      if (mapMesh) scene.remove(mapMesh);
      regions.forEach(region => scene.remove(region));
      enemies.forEach(enemy => scene.remove(enemy));
      arrows.forEach(arrow => scene.remove(arrow));
      
      if (mapMesh) {
        mapMesh.geometry.dispose();
        mapMesh.material.dispose();
      }
      
      regions.forEach(region => {
        region.geometry.dispose();
        region.material.dispose();
      });
      
      player.geometry.dispose();
      player.material.dispose();
      
      containerRef.current?.removeChild(renderer.domElement);
      
      clock.stop();
    };
  }, [gameState.modelLoaded]); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (window.processMapImage) {
        window.processMapImage(file);
      } else {
        setGameState(prev => ({
          ...prev, 
          gameMessage: "Game engine not initialized yet. Please wait."
        }));
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold mb-2">RPG Map Game with TensorFlow.js</h1>
        <p className="mb-2">{gameState.gameMessage}</p>
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            disabled={gameState.processingImage || !gameState.tfInitialized}
          >
            {gameState.processingImage ? 'Processing...' : 'Upload Map Image'}
          </button>
          
          {gameState.modelLoaded && (
            <div className="text-sm">
              <p>Using model: {gameState.modelName}</p>
            </div>
          )}
          
          {gameState.mapLoaded && (
            <div className="text-sm ml-4">
              <p>Use WASD to move</p>
              <p>Click to shoot arrows</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-1">
        <div ref={containerRef} className="flex-1 relative">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
        
        {gameState.processingImage && (
          <div className="w-64 bg-gray-900 p-2">
            <p className="text-white text-sm mb-2">Segmentation Preview:</p>
            <canvas 
              ref={segmentationCanvasRef} 
              className="w-full border border-gray-700" 
              width="256" 
              height="256"
            />
          </div>
        )}
      </div>
      
      {gameState.mapLoaded && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white p-2 rounded">
          <p>Player: ({gameState.playerPosition.x.toFixed(1)}, {gameState.playerPosition.z.toFixed(1)})</p>
          <p>Enemies: {gameState.enemies.length}</p>
        </div>
      )}
    </div>
  );
}