import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 加载背景纹理
const textureLoader = new THREE.TextureLoader();
textureLoader.load('path/to/your/wall_texture.jpg', (texture) => {
    const wallMaterial = new THREE.MeshStandardMaterial({ map: texture });
    // 应用到你的3D墙面
});

// 加载3D模型（如家具）
const loader = new GLTFLoader();
loader.load('path/to/your/table.glb', (gltf) => {
    const table = gltf.scene;
    table.position.set(0, 0, 0);
    scene.add(table);
    
    // 为模型添加可点击交互
    table.traverse((child) => {
        if (child.isMesh) {
            child.userData = { isInteractable: true, itemId: 'item_key_001' };
        }
    });
});