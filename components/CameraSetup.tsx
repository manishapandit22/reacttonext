import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export const CameraSetup = ({ 
  boardSize = 20, 
  cellSize = 1, 
  modelRef = null, 
  padding = 2, 
  cameraAngle = 'top' 
}) => {
  const { camera, scene } = useThree();

  const calculateOptimalCameraPosition = (boundingBox, camera) => {
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    
    let distance;
    if (camera.isPerspectiveCamera) {
      const fov = camera.fov * (Math.PI / 180); //converting to radians
      distance = (maxDim / 2) / Math.tan(fov / 2);
    } else {
      distance = maxDim;
    }
    
    distance *= padding;
    
    const positions = {
      isometric: {
        x: center.x + distance * 0.7,
        y: center.y + distance * 0.7,
        z: center.z + distance * 0.7
      },
      top: {
        x: center.x * 0.2,
        y: center.y + (distance - 8),
        z: center.z * -0.2
      },
      front: {
        x: center.x,
        y: center.y,
        z: center.z + distance
      },
      custom: {
        x: center.x + distance * 0.5,
        y: center.y + distance * 0.3,
        z: center.z + distance * 1.2
      }
    };
    
    return {
      position: positions[cameraAngle] || positions.isometric,
      target: center
    };
  };

  const fitCameraToObject = () => {
    let boundingBox;
    
    if (modelRef && modelRef.current) {
      boundingBox = new THREE.Box3().setFromObject(modelRef.current);
    } else {
      const halfBoard = (boardSize * cellSize) / 2;
      boundingBox = new THREE.Box3(
        new THREE.Vector3(-halfBoard, 0, -halfBoard),
        new THREE.Vector3(halfBoard, cellSize, halfBoard)
      );
    }
    
    const { position, target } = calculateOptimalCameraPosition(boundingBox, camera);
    
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(target.x, target.y, target.z);
    
    camera.updateProjectionMatrix();
    
    // console.log("Optimal camera position:", position);
    // console.log("Camera target:", target);
  };

  const fitCameraToObjects = (objects) => {
    if (!objects || objects.length === 0) return;
    
    const box = new THREE.Box3();
    
    objects.forEach(obj => {
      if (obj.current) {
        const objBox = new THREE.Box3().setFromObject(obj.current);
        box.union(objBox);
      }
    });
    
    const { position, target } = calculateOptimalCameraPosition(box, camera);
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(target.x, target.y, target.z);
    camera.updateProjectionMatrix();
  };

  const animateCameraToOptimalPosition = (duration = 1000) => {
    let boundingBox;
    
    if (modelRef && modelRef.current) {
      boundingBox = new THREE.Box3().setFromObject(modelRef.current);
    } else {
      const halfBoard = (boardSize * cellSize) / 2;
      boundingBox = new THREE.Box3(
        new THREE.Vector3(-halfBoard, 0, -halfBoard),
        new THREE.Vector3(halfBoard, cellSize, halfBoard)
      );
    }
    
    const { position: targetPos, target } = calculateOptimalCameraPosition(boundingBox, camera);
    
    const startPos = camera.position.clone();
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPos, targetPos, easeProgress);
      camera.lookAt(target.x, target.y, target.z);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fitCameraToObject();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [camera, boardSize, cellSize, modelRef, padding, cameraAngle]);

  useEffect(() => {
    window.fitCameraToObject = fitCameraToObject;
    window.animateCameraToOptimalPosition = animateCameraToOptimalPosition;
    window.fitCameraToObjects = fitCameraToObjects;
    
    return () => {
      delete window.fitCameraToObject;
      delete window.animateCameraToOptimalPosition;
      delete window.fitCameraToObjects;
    };
  }, []);

  return null;
};