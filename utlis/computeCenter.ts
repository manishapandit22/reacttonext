import * as THREE from 'three'

type prop =  string | any;
type exp = {
    boxSize: string | number,
    boxCenter: string| number
};

export default function getCenter(root:prop):exp{
    var box = new THREE.Box3().setFromObject(root);
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());
    return {boxSize,boxCenter};
}


