// three-scene.js
// 3D场景的创建和交互

class ThreeScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.objects = [];
        this.currentLocation = null;
    }
    
    // 初始化3D场景
    initThreeScene(locationId, locationData) {
        // 获取容器
        const container = document.getElementById('three-canvas-container');
        if (!container) return;
        
        // 清除之前的场景
        this.clearScene();
        
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 添加到容器
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);
        
        // 添加光源
        this.setupLights();
        
        // 添加地面
        this.createGround();
        
        // 根据地点创建场景
        this.createLocationScene(locationId, locationData);
        
        // 添加控件（如果可用）
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }
        
        // 开始渲染循环
        this.animate();
        
        // 处理窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize(container));
    }
    
    // 设置光源
    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // 平行光（模拟太阳）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // 点光源（补充照明）
        const pointLight = new THREE.PointLight(0xffaa00, 0.5, 20);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }
    
    // 创建地面
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(30, 30);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2d5a27,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
    
    // 创建地点场景
    createLocationScene(locationId, locationData) {
        this.currentLocation = locationId;
        
        // 根据地点类型创建不同的场景
        switch(locationId) {
            case 'room':
                this.createRoomScene();
                break;
            case 'hotspring':
                this.createHotspringScene();
                break;
            case 'library':
                this.createLibraryScene();
                break;
            case 'gym':
                this.createGymScene();
                break;
            case 'cafe':
                this.createCafeScene();
                break;
            case 'garden':
                this.createGardenScene();
                break;
            case 'waterfall':
                this.createWaterfallScene();
                break;
            case 'camp':
                this.createCampScene();
                break;
            default:
                this.createDefaultScene();
        }
        
        // 添加交互物体
        this.addInteractiveObjects(locationData.objects || []);
    }
    
    // 创建房间场景
    createRoomScene() {
        // 创建墙壁
        this.createWall(-8, 2.5, 0, 15, 5, 0.2); // 左墙
        this.createWall(8, 2.5, 0, 15, 5, 0.2);  // 右墙
        this.createWall(0, 2.5, -8, 0.2, 5, 15); // 后墙
        
        // 创建地板（不同颜色）
        const floorGeometry = new THREE.PlaneGeometry(16, 16);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b7355,
            roughness: 0.7
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // 创建家具
        this.createTable(0, 0.5, -3);
        this.createBed(-5, 0.5, 3);
        this.createWardrobe(5, 1.5, 3);
        
        // 调整相机位置
        this.camera.position.set(0, 8, 12);
        if (this.controls) this.controls.update();
    }
    
    // 创建温泉场景
    createHotspringScene() {
        // 创建温泉池
        this.createPool(0, 0, 0, 8, 6, 0x3366aa);
        this.createPool(-6, 0, -4, 3, 3, 0x3366aa);
        this.createPool(6, 0, -4, 3, 3, 0x3366aa);
        
        // 创建岩石
        this.createRock(-4, 0.5, 5, 1.5);
        this.createRock(4, 0.5, 5, 1.5);
        
        // 创建树木
        this.createTree(-8, 0, -8);
        this.createTree(8, 0, -8);
        this.createTree(-10, 0, 8);
        this.createTree(10, 0, 8);
        
        // 调整相机位置
        this.camera.position.set(0, 10, 15);
        if (this.controls) this.controls.update();
    }
    
    // 创建图书室场景
    createLibraryScene() {
        // 创建书架
        for (let i = -3; i <= 3; i += 2) {
            this.createBookshelf(i, 1.5, -4);
        }
        
        // 创建阅读桌
        this.createDesk(0, 0.8, 2);
        
        // 创建椅子
        this.createChair(-1.5, 0.5, 2);
        this.createChair(1.5, 0.5, 2);
        
        // 调整相机位置
        this.camera.position.set(0, 8, 10);
        if (this.controls) this.controls.update();
    }
    
    // 创建基本几何体函数
    createWall(x, y, z, width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xd4b483,
            roughness: 0.6
        });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
    }
    
    createTable(x, y, z) {
        // 桌面
        const topGeometry = new THREE.BoxGeometry(3, 0.2, 2);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(x, y + 0.6, z);
        top.castShadow = true;
        top.receiveShadow = true;
        this.scene.add(top);
        
        // 桌腿
        const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        
        for (let i = -1; i <= 1; i += 2) {
            for (let j = -0.8; j <= 0.8; j += 1.6) {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(x + i * 1.2, y, z + j);
                leg.castShadow = true;
                this.scene.add(leg);
            }
        }
    }
    
    createPool(x, y, z, width, depth, color) {
        const geometry = new THREE.BoxGeometry(width, 1, depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.7
        });
        const pool = new THREE.Mesh(geometry, material);
        pool.position.set(x, y - 0.5, z);
        this.scene.add(pool);
        
        // 水面
        const waterGeometry = new THREE.PlaneGeometry(width - 0.2, depth - 0.2);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x44aaff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(x, y, z);
        water.rotation.x = -Math.PI / 2;
        this.scene.add(water);
    }
    
    createTree(x, y, z) {
        // 树干
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, y + 1, z);
        trunk.castShadow = true;
        this.scene.add(trunk);
        
        // 树冠
        const crownGeometry = new THREE.SphereGeometry(1.5, 8, 6);
        const crownMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(x, y + 3, z);
        crown.castShadow = true;
        this.scene.add(crown);
    }
    
    createBookshelf(x, y, z) {
        const geometry = new THREE.BoxGeometry(1.5, 3, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const shelf = new THREE.Mesh(geometry, material);
        shelf.position.set(x, y, z);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        this.scene.add(shelf);
    }
    
    createDesk(x, y, z) {
        const geometry = new THREE.BoxGeometry(4, 0.8, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xd4a76a });
        const desk = new THREE.Mesh(geometry, material);
        desk.position.set(x, y, z);
        desk.castShadow = true;
        desk.receiveShadow = true;
        this.scene.add(desk);
    }
    
    createChair(x, y, z) {
        const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
        const material = new THREE.MeshStandardMaterial({ color: 0xa0522d });
        const chair = new THREE.Mesh(geometry, material);
        chair.position.set(x, y, z);
        chair.castShadow = true;
        this.scene.add(chair);
    }
    
    createBed(x, y, z) {
        // 床架
        const frameGeometry = new THREE.BoxGeometry(4, 0.8, 3);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, y, z);
        frame.castShadow = true;
        frame.receiveShadow = true;
        this.scene.add(frame);
        
        // 床垫
        const mattressGeometry = new THREE.BoxGeometry(3.8, 0.3, 2.8);
        const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.set(x, y + 0.55, z);
        this.scene.add(mattress);
    }
    
    createWardrobe(x, y, z) {
        const geometry = new THREE.BoxGeometry(2, 3, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const wardrobe = new THREE.Mesh(geometry, material);
        wardrobe.position.set(x, y, z);
        wardrobe.castShadow = true;
        wardrobe.receiveShadow = true;
        this.scene.add(wardrobe);
    }
    
    createRock(x, y, z, size) {
        const geometry = new THREE.SphereGeometry(size, 6, 6);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            roughness: 0.8
        });
        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(x, y, z);
        rock.castShadow = true;
        this.scene.add(rock);
    }
    
    // 添加交互物体
    addInteractiveObjects(objectNames) {
        // 创建射线检测器
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        // 为每个物体创建3D对象并添加点击事件
        objectNames.forEach((objectName, index) => {
            const object = this.createInteractiveObject(objectName, index);
            if (object) {
                object.userData = {
                    name: objectName,
                    type: 'interactive',
                    index: index
                };
                this.scene.add(object);
                this.objects.push(object);
            }
        });
        
        // 添加点击事件
        this.renderer.domElement.addEventListener('click', (event) => {
            // 计算鼠标位置
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // 更新射线
            raycaster.setFromCamera(mouse, this.camera);
            
            // 检测相交物体
            const intersects = raycaster.intersectObjects(this.objects);
            
            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                this.handleObjectClick(clickedObject.userData);
            }
        });
    }
    
    // 创建交互物体
    createInteractiveObject(name, index) {
        let geometry, material, mesh;
        
        // 根据物体名称创建不同的几何体
        switch(name.toLowerCase()) {
            case '桌子':
            case 'table':
                geometry = new THREE.BoxGeometry(1.5, 1, 1);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x8b4513,
                    transparent: true,
                    opacity: 0.8
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(Math.sin(index) * 3, 0.5, Math.cos(index) * 3);
                break;
                
            case '床':
            case 'bed':
                geometry = new THREE.BoxGeometry(2, 0.5, 1.5);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0xff69b4,
                    transparent: true,
                    opacity: 0.8
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(-3 + index, 0.25, 2);
                break;
                
            case '书架':
            case 'bookshelf':
                geometry = new THREE.BoxGeometry(1, 2, 0.3);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x8b4513,
                    transparent: true,
                    opacity: 0.8
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(index * 2 - 2, 1, -3);
                break;
                
            default:
                // 默认物体
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x3498db,
                    transparent: true,
                    opacity: 0.8
                });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(
                    Math.sin(index) * 4,
                    0.5,
                    Math.cos(index) * 4
                );
        }
        
        mesh.castShadow = true;
        return mesh;
    }
    
    // 处理物体点击
    handleObjectClick(objectData) {
        if (!objectData || !objectData.name) return;
        
        // 显示交互消息
        if (window.gameManager && window.gameManager.showMessage) {
            window.gameManager.showMessage(`点击了: ${objectData.name}`);
        }
        
        // 在地点内搜索（消耗行动点）
        if (window.mapManager && this.currentLocation) {
            window.mapManager.searchLocation(this.currentLocation);
        }
    }
    
    // 创建其他场景的函数（简略版）
    createGymScene() {
        this.createDefaultScene();
        this.camera.position.set(0, 8, 12);
    }
    
    createCafeScene() {
        this.createDefaultScene();
        this.camera.position.set(0, 6, 10);
    }
    
    createGardenScene() {
        // 创建花园场景
        for (let i = -4; i <= 4; i += 2) {
            for (let j = -4; j <= 4; j += 2) {
                this.createFlower(i, 0, j);
            }
        }
        
        // 创建喷泉
        this.createFountain(0, 0, 0);
        
        this.camera.position.set(0, 15, 20);
    }
    
    createFlower(x, y, z) {
        // 花茎
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x00aa00 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.set(x, y + 0.25, z);
        this.scene.add(stem);
        
        // 花朵
        const flowerGeometry = new THREE.SphereGeometry(0.2);
        const flowerMaterial = new THREE.MeshStandardMaterial({ 
            color: Math.random() > 0.5 ? 0xff0000 : 0xff69b4 
        });
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.set(x, y + 0.6, z);
        this.scene.add(flower);
    }
    
    createFountain(x, y, z) {
        const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(x, y, z);
        this.scene.add(base);
        
        const waterGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.3);
        const waterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3366ff,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(x, y + 0.15, z);
        this.scene.add(water);
    }
    
    createWaterfallScene() {
        this.createDefaultScene();
        this.camera.position.set(0, 10, 15);
    }
    
    createCampScene() {
        // 创建帐篷
        this.createTent(-3, 0, 0);
        
        // 创建篝火
        this.createCampfire(3, 0, 0);
        
        this.camera.position.set(0, 8, 12);
    }
    
    createTent(x, y, z) {
        const geometry = new THREE.ConeGeometry(1.5, 2, 4);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xff6600,
            side: THREE.DoubleSide
        });
        const tent = new THREE.Mesh(geometry, material);
        tent.position.set(x, y + 1, z);
        tent.rotation.y = Math.PI / 4;
        this.scene.add(tent);
    }
    
    createCampfire(x, y, z) {
        // 木柴
        const logGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
        const logMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        
        for (let i = 0; i < 6; i++) {
            const log = new THREE.Mesh(logGeometry, logMaterial);
            log.position.set(
                x + Math.cos(i * Math.PI / 3) * 0.3,
                y,
                z + Math.sin(i * Math.PI / 3) * 0.3
            );
            log.rotation.x = Math.PI / 2;
            this.scene.add(log);
        }
        
        // 火焰
        const fireGeometry = new THREE.SphereGeometry(0.5);
        const fireMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff3300,
            emissive: 0xff3300,
            emissiveIntensity: 0.5
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(x, y + 0.5, z);
        this.scene.add(fire);
    }
    
    createDefaultScene() {
        // 创建一些默认物体
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0xffffff,
                roughness: 0.5
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                Math.sin(i) * 3,
                0.5,
                Math.cos(i) * 3
            );
            cube.castShadow = true;
            this.scene.add(cube);
        }
    }
    
    // 动画循环
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 更新控件
        if (this.controls) {
            this.controls.update();
        }
        
        // 简单的动画
        if (this.scene && this.objects) {
            this.objects.forEach((object, index) => {
                object.rotation.y += 0.01;
                object.position.y = 0.5 + Math.sin(Date.now() * 0.001 + index) * 0.1;
            });
        }
        
        // 渲染场景
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // 窗口大小变化处理
    onWindowResize(container) {
        if (this.camera && this.renderer) {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }
    
    // 清除场景
    clearScene() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = [];
        this.currentLocation = null;
        
        // 清理Three.js资源
        if (this.controls) {
            this.controls.dispose();
        }
    }
}

// 创建3D场景实例
const threeScene = new ThreeScene();

// 导出函数
function initThreeScene(locationId, locationData) {
    threeScene.initThreeScene(locationId, locationData);
}

function clearThreeScene() {
    threeScene.clearScene();
}

// 导出到全局
window.threeScene = threeScene;
window.initThreeScene = initThreeScene;
window.clearThreeScene = clearThreeScene;