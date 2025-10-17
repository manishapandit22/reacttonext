import * as THREE from 'three'
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'
import {TextureLoader} from 'three/src/loaders/TextureLoader.js'
import { Loader } from '@/interface';
import getSceneGraph from './getSceneGraph';
import getCenter from './computeCenter';

//renderer.shadowMap.enabled = true;

export default function load3d(props: Loader){
    var objLoader = new OBJLoader();
    var gltfLoader = new GLTFLoader();
    var textureLoader = new TextureLoader();
    var modelAnimations = [];


    if(props.src){
        if(props.src.endsWith('.gltf')){
            gltfLoader.load(props.model,(gltf:any)=>{
                const root = gltf.scene;
                console.log('the root is',root)
               const {boxSize,boxCenter} =  getCenter(root);
               console.log("the box center and size are",boxCenter,boxSize)
                props.scene.add(gltf)
                let obj = gltf
                const prop = {obj,isLast: true}
                console.log(getSceneGraph(prop)?.join('\n'));
                root.traverse((obj:any)=>{
                    if(obj.castShadow !== undefined){
                        obj.castShadow = true;
                        obj.receiveShadow = true;
                    }
                })
            })
        }
        else if(props.src.endsWith('.obj')){
            objLoader.load(props.model,(obj:any)=>{
                let root = obj;
               console.log('the root is',root)
               const {boxSize,boxCenter} =  getCenter(root);
               console.log("the box center and size are",boxCenter,boxSize)
                props.scene.add(root);
            })
        }
    }
}