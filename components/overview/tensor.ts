import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

const SEGMENTATION_MODELS = {
  DEEPLAB: {
    name: 'DeepLab v3',
    url: 'https://storage.googleapis.com/tfjs-models/savedmodel/deeplab/web_model/model.json',
    inputSize: 513, 
    outputClasses: 21,
    type: 'graph'
  },
  UNET: {
    name: 'U-Net',
    url: 'https://storage.googleapis.com/tfjs-models/tfjs/unet/1/model.json',
    inputSize: 256, 
    outputClasses: 3, 
    type: 'layers'
  },
  CUSTOM_TERRAIN: {
    name: 'Custom Terrain',
    url: 'models/terrain_segmentation/model.json',
    inputSize: 256,
    outputClasses: 4, 
    type: 'layers'
  }
};

const TERRAIN_COLORS = [
  [120, 120, 120], // Background/undefined - gray
  [34, 139, 34],   // Walkable - forest green
  [0, 0, 255],     // Water - blue
  [139, 69, 19],   // Mountains - brown
  [0, 100, 0]      // Forest - dark green
];

export class TensorFlowManager {
  constructor() {
    this.model = null;
    this.modelConfig = null;
    this.isModelLoaded = false;
    this.backend = 'webgl'; 
  }

  async initialize(preferredBackend = 'webgl') {
    try {
      this.backend = preferredBackend;
      await tf.setBackend(this.backend);
      await tf.ready();
      
      console.log(`TensorFlow.js initialized with backend: ${tf.getBackend()}`);
      
      return {
        success: true,
        backend: tf.getBackend(),
        version: tf.version.tfjs
      };
    } catch (error) {
      console.error("Failed to initialize TensorFlow.js:", error);
      
      if (preferredBackend === 'webgl') {
        console.log("Falling back to CPU backend...");
        return this.initialize('cpu');
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadModel(modelKey = 'CUSTOM_TERRAIN') {
    try {
      this.modelConfig = SEGMENTATION_MODELS[modelKey];
      
      if (!this.modelConfig) {
        throw new Error(`Model configuration for "${modelKey}" not found`);
      }
      
      console.log(`Loading model: ${this.modelConfig.name}`);
      
      if (this.modelConfig.type === 'graph') {
        this.model = await tf.loadGraphModel(this.modelConfig.url);
      } else {
        this.model = await tf.loadLayersModel(this.modelConfig.url);
      }
      
      const dummyInput = tf.zeros([1, this.modelConfig.inputSize, this.modelConfig.inputSize, 3]);
      const warmupResult = this.model.predict(dummyInput);
      
      if (Array.isArray(warmupResult)) {
        warmupResult.forEach(tensor => tensor.dispose());
      } else {
        warmupResult.dispose();
      }
      
      dummyInput.dispose();
      
      this.isModelLoaded = true;
      console.log(`Model "${this.modelConfig.name}" loaded successfully`);
      
      return {
        success: true,
        modelName: this.modelConfig.name,
        classes: this.modelConfig.outputClasses
      };
    } catch (error) {
      console.error("Failed to load model:", error);
      this.isModelLoaded = false;
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async segmentImage(imageElement) {
    if (!this.isModelLoaded || !this.model) {
      throw new Error("Model not loaded");
    }

    return tf.tidy(() => {
      let imageTensor = tf.browser.fromPixels(imageElement);
      
      const { inputSize } = this.modelConfig;
      
      const resized = tf.image.resizeBilinear(imageTensor, [inputSize, inputSize]);
      
      const normalized = resized.toFloat().div(tf.scalar(255));
      
      const batched = normalized.expandDims(0);
      
      let segmentationResult;
      
      if (this.modelConfig.type === 'graph') {
        segmentationResult = this.model.predict(batched);
        
        if (Array.isArray(segmentationResult)) {
          segmentationResult = segmentationResult[0];
        }
      } else {
        segmentationResult = this.model.predict(batched);
      }
      
      let segmentationMask;
      
      if (segmentationResult.shape[3] > 1) {
        segmentationMask = tf.argMax(segmentationResult, 3);
      } else {
        segmentationMask = tf.greater(segmentationResult, tf.scalar(0.5))
          .mul(tf.scalar(1))
          .reshape([inputSize, inputSize]);
      }
      
      const originalHeight = imageTensor.shape[0];
      const originalWidth = imageTensor.shape[1];
      
      if (inputSize !== originalHeight || inputSize !== originalWidth) {
        segmentationMask = tf.image.resizeBilinear(
          segmentationMask.expandDims(3), 
          [originalHeight, originalWidth]
        ).squeeze();
      }
      
      return segmentationMask;
    });
  }
  
  async createColoredSegmentation(imageElement) {
    const segmentationMask = await this.segmentImage(imageElement);
    
    return tf.tidy(() => {
      const [height, width] = segmentationMask.shape;
      
      const maskData = segmentationMask.dataSync();
      
      const rgbData = new Uint8Array(height * width * 3);
      
      for (let i = 0; i < height * width; i++) {
        const classId = Math.min(maskData[i], TERRAIN_COLORS.length - 1);
        const color = TERRAIN_COLORS[classId];
        
        rgbData[i * 3] = color[0];     
        rgbData[i * 3 + 1] = color[1]; 
        rgbData[i * 3 + 2] = color[2]; 
      }
      
      const coloredMask = tf.tensor3d(rgbData, [height, width, 3], 'int32');
      
      return {
        mask: segmentationMask,
        coloredMask: coloredMask
      };
    });
  }

  async extractTerrainData(segmentationMask) {
    const [height, width] = segmentationMask.shape;
    const data = segmentationMask.dataSync();
    
    const terrainMap = {
      size: { width, height },
      walkable: [],
      water: [],
      mountains: [],
      forests: []
    };
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const nx = (x / width) * 2 - 1;
        const ny = (y / height) * 2 - 1;
        
        switch(data[idx]) {
          case 1: 
            terrainMap.walkable.push({ x: nx, y: ny });
            break;
          case 2:
            terrainMap.water.push({ x: nx, y: ny });
            break;
          case 3: 
            terrainMap.mountains.push({ x: nx, y: ny });
            break;
          case 4: 
            terrainMap.forests.push({ x: nx, y: ny });
            break;
          default:
         
            break;
        }
      }
    }
    
    return terrainMap;
  }

  async visualizeSegmentation(imageElement, canvas) {
    const result = await this.createColoredSegmentation(imageElement);
    
    await tf.browser.toPixels(result.coloredMask, canvas);
    
    result.mask.dispose();
    result.coloredMask.dispose();
    
    return canvas;
  }

  createFallbackSegmentation(imageElement) {
    return tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(imageElement);
      const [height, width] = [imageTensor.shape[0], imageTensor.shape[1]];
      
      const rgb = tf.split(imageTensor, 3, 2);
      const r = rgb[0];
      const g = rgb[1];
      const b = rgb[2];
      
      const walkable = g.greater(r).logicalAnd(g.greater(b)).mul(tf.scalar(1));
      
      const water = b.greater(r).logicalAnd(b.greater(g)).mul(tf.scalar(2));
      
      const brightness = r.add(g).add(b).div(tf.scalar(3));
      const mountains = brightness.less(tf.scalar(50)).mul(tf.scalar(3));
      
      const combined = walkable.add(water).add(mountains);
      
      const segmentationMask = combined.where(
        combined.greater(tf.scalar(0)), 
        tf.ones([height, width]).mul(tf.scalar(1))
      );
      
      return segmentationMask;
    });
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
    }
    this.model = null;
    this.isModelLoaded = false;
  }
}