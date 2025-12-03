<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PolyForge 3D Editor</title>
    <!-- Tailwind CSS for UI -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        body { margin: 0; overflow: hidden; background-color: #1a1a1a; color: #e5e5e5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; z-index: 0; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #2d2d2d; }
        ::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #777; }

        .panel {
            background: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(5px);
            border: 1px solid #333;
        }

        .input-group label { font-size: 0.75rem; color: #aaa; display: block; margin-bottom: 2px; }
        .input-row { display: flex; gap: 5px; margin-bottom: 8px; align-items: center; }
        .input-control { 
            background: #2a2a2a; border: 1px solid #444; color: white; 
            padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; width: 100%; 
        }
        .input-control:focus { outline: none; border-color: #3b82f6; }
        
        .tool-btn {
            width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
            background: #2d2d2d; border-radius: 6px; color: #ccc; cursor: pointer; transition: all 0.2s;
            border: 1px solid #333;
        }
        .tool-btn:hover { background: #3d3d3d; color: white; }
        .tool-btn.active { background: #3b82f6; color: white; border-color: #2563eb; }

        .scene-item {
            padding: 6px 10px; cursor: pointer; border-bottom: 1px solid #333; font-size: 0.85rem;
            display: flex; align-items: center; justify-content: space-between;
        }
        .scene-item:hover { background: #2d2d2d; }
        .scene-item.selected { background: #3b82f6; color: white; }
        .scene-item i { margin-right: 8px; opacity: 0.7; }

        /* Toast Notification */
        #toast {
            position: fixed; bottom: 20px; right: 20px; background: #3b82f6; color: white;
            padding: 10px 20px; border-radius: 6px; transform: translateY(100px); opacity: 0;
            transition: all 0.3s; z-index: 100; font-weight: 500;
        }
    </style>
    
    <!-- Import Map for Three.js -->
    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
            }
        }
    </script>
</head>
<body>

    <!-- 3D Canvas -->
    <div id="canvas-container"></div>

    <!-- Top Toolbar -->
    <div class="panel fixed top-0 left-0 right-0 h-14 flex items-center px-4 justify-between z-10 border-b border-gray-700">
        <div class="flex items-center gap-4">
            <div class="font-bold text-xl tracking-wider text-blue-400"><i class="fa-solid fa-cube mr-2"></i>POLYFORGE</div>
            <div class="h-6 w-px bg-gray-600 mx-2"></div>
            
            <!-- File Operations -->
            <button onclick="app.clearScene()" class="text-xs hover:text-white text-gray-400 flex flex-col items-center gap-1 px-2">
                <i class="fa-solid fa-file"></i> New
            </button>
            <button onclick="app.saveScene()" class="text-xs hover:text-white text-gray-400 flex flex-col items-center gap-1 px-2">
                <i class="fa-solid fa-floppy-disk"></i> Save
            </button>
            <button onclick="app.loadScene()" class="text-xs hover:text-white text-gray-400 flex flex-col items-center gap-1 px-2">
                <i class="fa-solid fa-folder-open"></i> Load
            </button>
        </div>

        <div class="flex gap-2">
            <!-- Transform Modes -->
            <button id="btn-translate" class="tool-btn active" title="Translate (W)" onclick="app.setTransformMode('translate')"><i class="fa-solid fa-up-down-left-right"></i></button>
            <button id="btn-rotate" class="tool-btn" title="Rotate (E)" onclick="app.setTransformMode('rotate')"><i class="fa-solid fa-rotate"></i></button>
            <button id="btn-scale" class="tool-btn" title="Scale (R)" onclick="app.setTransformMode('scale')"><i class="fa-solid fa-expand"></i></button>
            <div class="h-8 w-px bg-gray-600 mx-1"></div>
            <button class="tool-btn text-red-400 hover:bg-red-900/30 hover:border-red-500" title="Delete Selected (Del)" onclick="app.deleteSelected()"><i class="fa-solid fa-trash"></i></button>
        </div>
    </div>

    <!-- Left Sidebar: Outliner / Add -->
    <div class="panel fixed top-14 left-0 bottom-0 w-64 flex flex-col z-10 border-r border-gray-700">
        <!-- Add Objects Header -->
        <div class="p-3 bg-gray-800 font-semibold text-xs uppercase tracking-wider text-gray-400">Add Object</div>
        <div class="grid grid-cols-3 gap-2 p-3 border-b border-gray-700">
            <button onclick="app.addMesh('cube')" class="flex flex-col items-center justify-center p-2 bg-gray-700/50 hover:bg-blue-600/20 rounded border border-transparent hover:border-blue-500 transition">
                <i class="fa-solid fa-cube mb-1 text-blue-400"></i> <span class="text-[10px]">Cube</span>
            </button>
            <button onclick="app.addMesh('sphere')" class="flex flex-col items-center justify-center p-2 bg-gray-700/50 hover:bg-blue-600/20 rounded border border-transparent hover:border-blue-500 transition">
                <i class="fa-solid fa-circle mb-1 text-purple-400"></i> <span class="text-[10px]">Sphere</span>
            </button>
            <button onclick="app.addMesh('plane')" class="flex flex-col items-center justify-center p-2 bg-gray-700/50 hover:bg-blue-600/20 rounded border border-transparent hover:border-blue-500 transition">
                <i class="fa-solid fa-vector-square mb-1 text-green-400"></i> <span class="text-[10px]">Plane</span>
            </button>
            <button onclick="app.addMesh('torus')" class="flex flex-col items-center justify-center p-2 bg-gray-700/50 hover:bg-blue-600/20 rounded border border-transparent hover:border-blue-500 transition">
                <i class="fa-regular fa-life-ring mb-1 text-yellow-400"></i> <span class="text-[10px]">Torus</span>
            </button>
            <button onclick="app.addLight('point')" class="flex flex-col items-center justify-center p-2 bg-gray-700/50 hover:bg-blue-600/20 rounded border border-transparent hover:border-blue-500 transition">
                <i class="fa-regular fa-lightbulb mb-1 text-orange-400"></i> <span class="text-[10px]">Point</span>
            </button>
        </div>

        <!-- Scene Graph -->
        <div class="p-3 bg-gray-800 font-semibold text-xs uppercase tracking-wider text-gray-400 flex justify-between">
            <span>Scene Hierarchy</span>
            <span id="obj-count" class="text-gray-500">0 items</span>
        </div>
        <div id="scene-graph" class="flex-1 overflow-y-auto">
            <!-- Items injected by JS -->
        </div>
    </div>

    <!-- Right Sidebar: Properties -->
    <div class="panel fixed top-14 right-0 bottom-0 w-72 flex flex-col z-10 border-l border-gray-700 overflow-y-auto">
        <div class="p-3 bg-gray-800 font-semibold text-xs uppercase tracking-wider text-gray-400">Properties</div>
        
        <div id="properties-panel" class="p-4 hidden">
            
            <div class="mb-4">
                <label class="text-xs text-gray-400 uppercase font-bold mb-2 block">Identity</label>
                <div class="input-row">
                    <span class="text-gray-500 text-xs w-8">Type</span>
                    <input id="prop-type" type="text" class="input-control text-gray-500" disabled>
                </div>
                <div class="input-row">
                    <span class="text-gray-500 text-xs w-8">Name</span>
                    <input id="prop-name" type="text" class="input-control" onchange="app.updateName(this.value)">
                </div>
                 <div class="input-row mt-2">
                    <span class="text-gray-500 text-xs w-8">Vis</span>
                    <input id="prop-visible" type="checkbox" onchange="app.updateVisible(this.checked)">
                </div>
            </div>

            <div class="border-t border-gray-700 my-4"></div>

            <div class="mb-4">
                <label class="text-xs text-gray-400 uppercase font-bold mb-2 block">Transform</label>
                
                <div class="input-group mb-2">
                    <label>Position (X, Y, Z)</label>
                    <div class="flex gap-1">
                        <input type="number" step="0.1" id="pos-x" class="input-control text-red-400" onchange="app.updateTransform('pos', 'x', this.value)">
                        <input type="number" step="0.1" id="pos-y" class="input-control text-green-400" onchange="app.updateTransform('pos', 'y', this.value)">
                        <input type="number" step="0.1" id="pos-z" class="input-control text-blue-400" onchange="app.updateTransform('pos', 'z', this.value)">
                    </div>
                </div>

                <div class="input-group mb-2">
                    <label>Rotation (Deg)</label>
                    <div class="flex gap-1">
                        <input type="number" step="1" id="rot-x" class="input-control text-red-400" onchange="app.updateTransform('rot', 'x', this.value)">
                        <input type="number" step="1" id="rot-y" class="input-control text-green-400" onchange="app.updateTransform('rot', 'y', this.value)">
                        <input type="number" step="1" id="rot-z" class="input-control text-blue-400" onchange="app.updateTransform('rot', 'z', this.value)">
                    </div>
                </div>

                <div class="input-group">
                    <label>Scale</label>
                    <div class="flex gap-1">
                        <input type="number" step="0.1" id="scl-x" class="input-control" onchange="app.updateTransform('scl', 'x', this.value)">
                        <input type="number" step="0.1" id="scl-y" class="input-control" onchange="app.updateTransform('scl', 'y', this.value)">
                        <input type="number" step="0.1" id="scl-z" class="input-control" onchange="app.updateTransform('scl', 'z', this.value)">
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-700 my-4"></div>

            <div id="material-section">
                <label class="text-xs text-gray-400 uppercase font-bold mb-2 block">Material</label>
                <div class="input-row">
                    <span class="text-gray-500 text-xs w-12">Color</span>
                    <input type="color" id="mat-color" class="w-full h-8 bg-transparent border-0 cursor-pointer" oninput="app.updateMaterial('color', this.value)">
                </div>
                <div class="input-row">
                    <span class="text-gray-500 text-xs w-12">Wire</span>
                    <input type="checkbox" id="mat-wireframe" onchange="app.updateMaterial('wireframe', this.checked)">
                </div>
            </div>
            
            <div id="light-section" class="hidden">
                 <label class="text-xs text-gray-400 uppercase font-bold mb-2 block">Light Properties</label>
                <div class="input-row">
                    <span class="text-gray-500 text-xs w-12">Color</span>
                    <input type="color" id="light-color" class="w-full h-8 bg-transparent border-0 cursor-pointer" oninput="app.updateLight('color', this.value)">
                </div>
                <div class="input-row">
                    <span class="text-gray-500 text-xs w-12">Inten</span>
                    <input type="number" step="0.1" min="0" max="10" id="light-intensity" class="input-control" onchange="app.updateLight('intensity', this.value)">
                </div>
            </div>

        </div>

        <div id="no-selection" class="p-8 text-center text-gray-600 mt-10">
            <i class="fa-solid fa-cube text-4xl mb-3 opacity-20"></i>
            <p>Select an object to edit properties</p>
        </div>
    </div>

    <div id="toast">Operation Successful</div>

    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { TransformControls } from 'three/addons/controls/TransformControls.js';

        class EditorApp {
            constructor() {
                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.orbit = null;
                this.transformControl = null;
                this.raycaster = new THREE.Raycaster();
                this.pointer = new THREE.Vector2();
                this.selectedObject = null;
                this.objects = []; // Track user-created objects
                this.meshCount = 0;
                
                this.init();
            }

            init() {
                // Scene Setup
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x222222);
                
                // Grid
                const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
                this.scene.add(gridHelper);
                
                // Axes
                const axesHelper = new THREE.AxesHelper(2);
                this.scene.add(axesHelper);

                // Default Lights
                const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
                this.scene.add(ambientLight);
                
                const dirLight = new THREE.DirectionalLight(0xffffff, 1);
                dirLight.position.set(5, 10, 7.5);
                dirLight.castShadow = true;
                this.scene.add(dirLight);

                // Camera
                this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.camera.position.set(5, 5, 5);

                // Renderer
                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.shadowMap.enabled = true;
                document.getElementById('canvas-container').appendChild(this.renderer.domElement);

                // Controls
                this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
                this.orbit.enableDamping = true;
                this.orbit.dampingFactor = 0.05;

                this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
                this.transformControl.addEventListener('dragging-changed', (event) => {
                    this.orbit.enabled = !event.value;
                });
                this.transformControl.addEventListener('change', () => {
                    if (this.selectedObject) this.updateUIFromObject(this.selectedObject);
                });
                this.scene.add(this.transformControl);

                // Event Listeners
                window.addEventListener('resize', () => this.onWindowResize());
                document.addEventListener('keydown', (e) => this.onKeyDown(e));
                
                // Raycasting click
                this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));

                // Animation Loop
                this.animate();
                
                // Initial welcome object
                this.addMesh('cube');
            }

            onWindowResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            animate() {
                requestAnimationFrame(() => this.animate());
                this.orbit.update();
                this.renderer.render(this.scene, this.camera);
            }

            addMesh(type) {
                let geometry, material, mesh;
                material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
                const name = `${type}_${this.meshCount++}`;

                switch(type) {
                    case 'cube': geometry = new THREE.BoxGeometry(1, 1, 1); break;
                    case 'sphere': geometry = new THREE.SphereGeometry(0.6, 32, 16); break;
                    case 'plane': 
                        geometry = new THREE.PlaneGeometry(2, 2); 
                        material.side = THREE.DoubleSide; 
                        break;
                    case 'torus': geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 50); break;
                }

                if (geometry) {
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.name = name;
                    mesh.position.y = 0.5;
                    
                    if (type === 'plane') {
                        mesh.rotation.x = -Math.PI / 2;
                        mesh.position.y = 0;
                    }

                    this.scene.add(mesh);
                    this.objects.push(mesh);
                    this.refreshSceneGraph();
                    this.selectObject(mesh);
                }
            }

            addLight(type) {
                if (type === 'point') {
                    const light = new THREE.PointLight(0xffaa00, 1, 10);
                    light.position.set(0, 2, 0);
                    light.castShadow = true;
                    
                    // Add helper
                    const sphereSize = 0.2;
                    const pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
                    light.userData.helper = pointLightHelper; // link helper to light
                    this.scene.add( pointLightHelper );
                    
                    light.name = `light_${this.meshCount++}`;
                    this.scene.add(light);
                    this.objects.push(light);
                    this.refreshSceneGraph();
                    this.selectObject(light);
                }
            }

            onPointerDown(event) {
                // Don't deselect if clicking on gizmo (handled by TransformControls)
                // We use a small timeout to let transform control logic run first if needed
                
                this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

                this.raycaster.setFromCamera(this.pointer, this.camera);

                // Intersect with our tracked objects
                const intersects = this.raycaster.intersectObjects(this.objects, false);

                if (intersects.length > 0) {
                    // Clicked on object
                    if (this.selectedObject !== intersects[0].object) {
                        this.selectObject(intersects[0].object);
                    }
                } else {
                    // Clicked on empty space? 
                    // Need to check if we hovered over the transform gizmo.
                    // Raycaster doesn't see gizmo easily. 
                    // Simple logic: if not dragging gizmo (which we can't easily check here), deselect.
                    // However, pointerdown starts a drag. Let's rely on simple deselect logic for now.
                    // But prevent deselecting if clicking UI. (Already handled since canvas is in back)
                    this.deselect();
                }
            }
            
            selectObject(object) {
                this.selectedObject = object;
                this.transformControl.attach(object);
                
                // Highlight in Scene Graph
                this.renderSceneGraphSelection();
                
                // Show Properties
                document.getElementById('properties-panel').classList.remove('hidden');
                document.getElementById('no-selection').classList.add('hidden');
                
                // Update Inputs
                this.updateUIFromObject(object);
            }

            deselect() {
                this.selectedObject = null;
                this.transformControl.detach();
                this.renderSceneGraphSelection(); // clear highlights
                document.getElementById('properties-panel').classList.add('hidden');
                document.getElementById('no-selection').classList.remove('hidden');
            }

            deleteSelected() {
                if (!this.selectedObject) return;
                
                const obj = this.selectedObject;
                this.deselect();

                // Remove from Scene
                this.scene.remove(obj);
                
                // If it has a helper, remove it too
                if (obj.userData.helper) {
                    this.scene.remove(obj.userData.helper);
                }

                // Remove from our list
                this.objects = this.objects.filter(o => o !== obj);
                
                // Clean up memory
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();

                this.refreshSceneGraph();
            }

            // --- UI Updates ---

            refreshSceneGraph() {
                const container = document.getElementById('scene-graph');
                container.innerHTML = '';
                document.getElementById('obj-count').innerText = `${this.objects.length} items`;

                this.objects.forEach(obj => {
                    const el = document.createElement('div');
                    el.className = 'scene-item';
                    el.dataset.uuid = obj.uuid;
                    
                    let icon = 'fa-cube';
                    if (obj.isPointLight) icon = 'fa-lightbulb';
                    if (obj.geometry && obj.geometry.type === 'SphereGeometry') icon = 'fa-circle';
                    
                    el.innerHTML = `<div><i class="fa-solid ${icon}"></i> ${obj.name}</div>`;
                    el.onclick = (e) => {
                        e.stopPropagation();
                        this.selectObject(obj);
                    };
                    container.appendChild(el);
                });
                
                if (this.selectedObject) this.renderSceneGraphSelection();
            }

            renderSceneGraphSelection() {
                const items = document.querySelectorAll('.scene-item');
                items.forEach(el => {
                    if (this.selectedObject && el.dataset.uuid === this.selectedObject.uuid) {
                        el.classList.add('selected');
                    } else {
                        el.classList.remove('selected');
                    }
                });
            }

            updateUIFromObject(obj) {
                if (!obj) return;

                // Identity
                document.getElementById('prop-name').value = obj.name;
                document.getElementById('prop-type').value = obj.type;
                document.getElementById('prop-visible').checked = obj.visible;

                // Transform
                document.getElementById('pos-x').value = obj.position.x.toFixed(2);
                document.getElementById('pos-y').value = obj.position.y.toFixed(2);
                document.getElementById('pos-z').value = obj.position.z.toFixed(2);

                document.getElementById('rot-x').value = THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(0);
                document.getElementById('rot-y').value = THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(0);
                document.getElementById('rot-z').value = THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(0);

                document.getElementById('scl-x').value = obj.scale.x.toFixed(2);
                document.getElementById('scl-y').value = obj.scale.y.toFixed(2);
                document.getElementById('scl-z').value = obj.scale.z.toFixed(2);

                // Material / Light
                const matSection = document.getElementById('material-section');
                const lightSection = document.getElementById('light-section');

                if (obj.material) {
                    matSection.classList.remove('hidden');
                    lightSection.classList.add('hidden');
                    document.getElementById('mat-color').value = '#' + obj.material.color.getHexString();
                    document.getElementById('mat-wireframe').checked = obj.material.wireframe;
                } else if (obj.isLight) {
                    matSection.classList.add('hidden');
                    lightSection.classList.remove('hidden');
                    document.getElementById('light-color').value = '#' + obj.color.getHexString();
                    document.getElementById('light-intensity').value = obj.intensity;
                }
            }

            // --- Logic Updates triggered by UI ---

            updateName(val) {
                if (this.selectedObject) {
                    this.selectedObject.name = val;
                    this.refreshSceneGraph();
                }
            }
            
            updateVisible(val) {
                 if (this.selectedObject) this.selectedObject.visible = val;
            }

            updateTransform(mode, axis, val) {
                if (!this.selectedObject) return;
                const v = parseFloat(val);
                if (isNaN(v)) return;

                if (mode === 'pos') {
                    this.selectedObject.position[axis] = v;
                } else if (mode === 'rot') {
                    this.selectedObject.rotation[axis] = THREE.MathUtils.degToRad(v);
                } else if (mode === 'scl') {
                    this.selectedObject.scale[axis] = v;
                }
                
                // If it has a helper (light), update it
                if (this.selectedObject.userData.helper) {
                    this.selectedObject.userData.helper.update();
                }
            }

            updateMaterial(prop, val) {
                if (!this.selectedObject || !this.selectedObject.material) return;
                if (prop === 'color') {
                    this.selectedObject.material.color.set(val);
                } else if (prop === 'wireframe') {
                    this.selectedObject.material.wireframe = val;
                }
            }

            updateLight(prop, val) {
                 if (!this.selectedObject || !this.selectedObject.isLight) return;
                 if (prop === 'color') {
                     this.selectedObject.color.set(val);
                 } else if (prop === 'intensity') {
                     this.selectedObject.intensity = parseFloat(val);
                 }
                 // Update helper visual
                 if (this.selectedObject.userData.helper) this.selectedObject.userData.helper.update();
            }

            setTransformMode(mode) {
                this.transformControl.setMode(mode);
                // Update UI buttons
                ['translate', 'rotate', 'scale'].forEach(m => {
                    const btn = document.getElementById(`btn-${m}`);
                    if (m === mode) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            }

            onKeyDown(e) {
                switch(e.key.toLowerCase()) {
                    case 'delete': this.deleteSelected(); break;
                    case 'w': this.setTransformMode('translate'); break;
                    case 'e': this.setTransformMode('rotate'); break;
                    case 'r': this.setTransformMode('scale'); break;
                }
            }

            // --- Persistence ---

            showToast(msg) {
                const t = document.getElementById('toast');
                t.innerText = msg;
                t.style.opacity = '1';
                t.style.transform = 'translateY(0)';
                setTimeout(() => {
                    t.style.opacity = '0';
                    t.style.transform = 'translateY(100px)';
                }, 2000);
            }

            clearScene() {
                if(confirm("Delete everything?")) {
                    [...this.objects].forEach(o => {
                        this.selectedObject = o;
                        this.deleteSelected();
                    });
                    this.meshCount = 0;
                    this.showToast("Scene Cleared");
                }
            }

            saveScene() {
                const data = this.objects.map(obj => {
                    const base = {
                        type: obj.isLight ? (obj.isPointLight ? 'pointlight' : 'light') : 
                              (obj.geometry.type.replace('Geometry', '').toLowerCase()),
                        name: obj.name,
                        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                        rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
                    };

                    if (obj.material) {
                        base.color = '#' + obj.material.color.getHexString();
                        base.wireframe = obj.material.wireframe;
                    }
                    if (obj.isLight) {
                        base.color = '#' + obj.color.getHexString();
                        base.intensity = obj.intensity;
                    }
                    return base;
                });

                localStorage.setItem('polyforge_scene', JSON.stringify(data));
                this.showToast("Scene Saved to LocalStorage");
            }

            loadScene() {
                const json = localStorage.getItem('polyforge_scene');
                if (!json) {
                    alert("No saved scene found.");
                    return;
                }

                // Clear current
                [...this.objects].forEach(o => {
                    this.selectedObject = o;
                    this.deleteSelected();
                });

                const data = JSON.parse(json);
                data.forEach(item => {
                    // Re-create objects based on stored data
                    if (['cube', 'sphere', 'plane', 'torus'].includes(item.type)) {
                        this.addMesh(item.type);
                    } else if (item.type === 'pointlight') {
                        this.addLight('point');
                    }

                    // Apply properties
                    const obj = this.selectedObject; // addMesh selects the new object
                    if (obj) {
                        obj.name = item.name;
                        obj.position.set(item.position.x, item.position.y, item.position.z);
                        obj.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
                        obj.scale.set(item.scale.x, item.scale.y, item.scale.z);

                        if (obj.material && item.color) {
                            obj.material.color.set(item.color);
                            obj.material.wireframe = item.wireframe || false;
                        }
                        if (obj.isLight && item.color) {
                            obj.color.set(item.color);
                            obj.intensity = item.intensity || 1;
                        }
                    }
                });
                this.deselect();
                this.showToast("Scene Loaded");
            }
        }

        // Initialize App once DOM is ready
        window.onload = () => {
            window.app = new EditorApp();
        };

    </script>
</body>
</html>
