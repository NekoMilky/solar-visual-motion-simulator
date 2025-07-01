<template>
    <div ref="sceneContainer"></div>
</template>

<script setup>
import earthTexture from '@/assets/images/texture/earth_surface.jpg';
import shadowTexture from '@/assets/images/texture/shadow.png';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { onMounted, onUnmounted, ref } from 'vue';
import { subscribeData } from '../utils/AppData.js';
import { subscribeSetting } from '../utils/AppSetting.js';

const sceneContainer = ref(null);

const appData = ref({});
const appSetting = ref({});

// 定义固定常数
const EARTH_RADIUS = 3;
const PIN_RADIUS = 0.02;
const PIN_HEIGHT = 0.5;
const PIN_TOP_RADIUS = 0.05; 
const SHADOW_RADIUS = EARTH_RADIUS + 0.01;
const GRID_RADIUS = EARTH_RADIUS + 0.02;
const SUN_RAY_POINTER_RADIUS = 0.02;
const SUN_RAY_POINTER_HEIGHT = 100;

const CONTROLS_DAMPING_FACTOR = 0.05;
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_DISTANCE = 7.5;

let scene, camera, renderer, controls;
let earth, shadowSphere, pin, grid, sunRayPointer;
let animationId = null;

// 创建场景
const createScene = () => {
    // 创建地球
	const createEarth = () => {
        const geometry = new THREE.SphereGeometry(
            EARTH_RADIUS, 
            128, 
            128
        );
        const texture = new THREE.TextureLoader().load(earthTexture, (texture) => {
            texture.generateMipmaps = false;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            earth.material.needsUpdate = true;
        });
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            alphaTest: 0.1
        });
        earth = new THREE.Mesh(geometry, material);
        earth.position.set(0, 0, 0);
        earth.rotation.set(0, 0, 0);
        scene.add(earth);
    }

    // 创建阴影球面
    const createShadowSphere = () => {
        const geometry = new THREE.SphereGeometry(
            SHADOW_RADIUS,
            128, 
            128
        );
        const texture = new THREE.TextureLoader().load(shadowTexture, (texture) => {
            texture.generateMipmaps = false;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            shadowSphere.material.needsUpdate = true;
        });
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            alphaTest: 0.1,
            transparent: true
        });
        shadowSphere = new THREE.Mesh(geometry, material);
        shadowSphere.position.set(0, 0, 0);
        shadowSphere.rotation.x = 0;
        scene.add(shadowSphere);
    };

    // 创建图钉
    const createPin = () => {
        // 圆柱部分
        const cylinderGeometry = new THREE.CylinderGeometry(
            PIN_RADIUS,
            PIN_RADIUS,
            PIN_HEIGHT,
            16
        );
        const cylinderMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        // 小球部分
        const sphereGeometry = new THREE.SphereGeometry(
            PIN_TOP_RADIUS, 
            32, 
            32
        );
        const sphereMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.y = PIN_HEIGHT / 2;
        // 组合
        pin = new THREE.Group();
        pin.add(cylinder);
        pin.add(sphere);
        pin.rotation.x = 0;
    };

    // 创建太阳光线指针
	const createSunRayPointer = () => {
		const geometry = new THREE.CylinderGeometry(
            SUN_RAY_POINTER_RADIUS, 
            SUN_RAY_POINTER_RADIUS, 
            SUN_RAY_POINTER_HEIGHT, 
        16);
		const material = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.7, 
            side: THREE.DoubleSide 
        });
		sunRayPointer = new THREE.Mesh(geometry, material);
        sunRayPointer.rotation.x = 0;
	};

    // 创建经纬网
    const createGrid = () => {
        grid = new THREE.Group();
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.5 
        });
        const dashedMaterial = new THREE.LineDashedMaterial({
            color: 0xffffff,
            dashSize: 0.1,   
            gapSize: 0.05,    
            transparent: true,
            opacity: 0.7    
        });
        // 经线
        for (let lon = -180; lon <= 180; lon += 30) {
            const longitude = lon * Math.PI / 180;
            const points = [];
            for (let lat = -90; lat <= 90; lat += 5) {
                const latitude = lat * Math.PI / 180;
                const x = GRID_RADIUS * Math.cos(latitude) * Math.cos(longitude);
                const y = GRID_RADIUS * Math.sin(latitude);
                const z = GRID_RADIUS * Math.cos(latitude) * Math.sin(longitude);
                points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            grid.add(line);
        }
        // 纬线
        for (let lat = -90; lat <= 90; lat += 30) {
            const latitude = lat * Math.PI / 180;
            const points = [];
            for (let lon = -180; lon <= 180; lon += 5) {
                const longitude = lon * Math.PI / 180;
                const x = GRID_RADIUS * Math.cos(latitude) * Math.cos(longitude);
                const y = GRID_RADIUS * Math.sin(latitude);
                const z = GRID_RADIUS * Math.cos(latitude) * Math.sin(longitude);
                points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            grid.add(line);
        }
        // 回归线和极圈
        const obliquity = appData.value.solarData.obliquityOfEcliptic;
        const specialLines = [
            obliquity,
            90 - obliquity,
            -obliquity,
            obliquity - 90
        ];
        specialLines.forEach(lat => {
            const points = [];
            const latitude = lat * Math.PI / 180;
            for (let lon = -180; lon <= 180; lon += 5) {
                const longitude = lon * Math.PI / 180;
                const x = GRID_RADIUS * Math.cos(latitude) * Math.cos(longitude);
                const y = GRID_RADIUS * Math.sin(latitude);
                const z = GRID_RADIUS * Math.cos(latitude) * Math.sin(longitude);
                points.push(new THREE.Vector3(x, y, z));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, dashedMaterial);
            line.computeLineDistances();
            grid.add(line);
        });
    };

    // 更新数据
    const updateData = (data) => {
        appData.value = data;
    }

    const updateSetting = (setting) => {
        appSetting.value = setting;
        handleWindowResize();
    }
	
	// 更新元素
	const updateElements = () => {
		const solarData = appData.value.solarData;

        // 转换角度为弧度
        const longitude = appData.value.longitude * Math.PI / 180;
        const latitude = appData.value.latitude * Math.PI / 180;
		const declination = solarData.solarPosition.latitude * Math.PI / 180;
		const ascension = solarData.solarPosition.longitude * Math.PI / 180;

        // 更新阴影球面位置
        shadowSphere.rotation.y = ascension;
        shadowSphere.rotation.z = declination;

        // 更新太阳光线指针
        if (appSetting.value.isSunRayPointerToggle) {
            if (!scene.children.includes(sunRayPointer)) {
                scene.add(sunRayPointer);
            }
            sunRayPointer.position.x = SUN_RAY_POINTER_HEIGHT / 2 * Math.cos(ascension) * Math.cos(declination);
            sunRayPointer.position.y = SUN_RAY_POINTER_HEIGHT / 2 * Math.sin(declination);
            sunRayPointer.position.z = - SUN_RAY_POINTER_HEIGHT / 2 * Math.sin(ascension) * Math.cos(declination);
            sunRayPointer.rotation.y = ascension;
            sunRayPointer.rotation.z = declination - Math.PI / 2;
        } else if (scene.children.includes(sunRayPointer)) {
            scene.remove(sunRayPointer);
        }

        // 更新图钉位置
        if (appSetting.value.isPinToggle) {
            if (!scene.children.includes(pin)) {
				scene.add(pin);
			}
            pin.position.x = EARTH_RADIUS * Math.cos(longitude) * Math.cos(latitude);
            pin.position.y = EARTH_RADIUS * Math.sin(latitude);
            pin.position.z = - EARTH_RADIUS * Math.sin(longitude) * Math.cos(latitude);
            pin.rotation.y = longitude;
            pin.rotation.z = latitude - Math.PI / 2;
        } else if (scene.children.includes(pin)) {
            scene.remove(pin);
        }

        // 更新经纬网位置
        if (appSetting.value.isGridToggle) {
            if (!scene.children.includes(grid)) {
                scene.add(grid);
            }
        } else if (scene.children.includes(grid)) {
            scene.remove(grid);
        }
	};
	
	// 动画循环
	const animate = () => {
		animationId = requestAnimationFrame(animate);
		controls.update();
		updateElements();
		renderer.render(scene, camera);
	};

    // 响应窗口大小变化
    const handleWindowResize = () => {
        const sceneToggle = appSetting.value.isSceneToggle;
        let sceneToggleCount = 0;
        for (const value of sceneToggle) {
            if (value) {
                sceneToggleCount++;
            }
        }

        // 小于800像素宽：竖向排列
        const container = sceneContainer.value.parentElement;
        let width = container.clientWidth, height = container.clientHeight;
        if (container.clientWidth < 800) {
            height /= sceneToggleCount;
        } else {
            width /= sceneToggleCount;
        }

        camera.aspect = width / height;
	    camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    // 创建新场景
    const containerElement = sceneContainer.value;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 创建相机
    camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance" // 启用高性能模式
    });
    containerElement.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 允许相机惯性
    controls.dampingFactor = CONTROLS_DAMPING_FACTOR;
    controls.enablePan = false; // 禁止平移
    controls.enableZoom = false; // 禁止缩放
    controls.enableRotate = true; // 允许旋转

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0);
    scene.add(ambientLight);

    const unsubscriberData = subscribeData(updateData);
    const unsubscriberSetting = subscribeSetting(updateSetting);

    const cameraHeight = appData.value.latitude * Math.PI / 180;
    const cameraDirection = appData.value.longitude * Math.PI / 180;
    camera.position.x = CAMERA_DISTANCE * Math.cos(cameraDirection) * Math.cos(cameraHeight);
    camera.position.y = CAMERA_DISTANCE * Math.sin(cameraHeight);
    camera.position.z = - CAMERA_DISTANCE * Math.sin(cameraDirection) * Math.cos(cameraHeight);
    camera.lookAt(0, 0, 0);

    createEarth();
    createShadowSphere();
    createSunRayPointer();
    createPin();
    createGrid();
    animate();

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);

    onUnmounted(() => {
        unsubscriberData();
        unsubscriberSetting();

        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        window.removeEventListener('resize', handleWindowResize);

        if (containerElement && renderer?.domElement) {
            containerElement.removeChild(renderer.domElement);
        }
        renderer?.dispose();
        controls?.dispose();
    });
};

onMounted(() => {
    createScene();
});
</script>

<style scoped>
</style>
