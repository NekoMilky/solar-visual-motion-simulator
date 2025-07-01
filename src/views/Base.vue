<template>
    <div ref="sceneContainer"></div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { onUnmounted, ref } from 'vue';
import { subscribeData } from '../utils/AppData.js';
import { subscribeSetting } from '../utils/AppSetting.js';

const sceneContainer = ref(null);

let appData = {};
let appSetting = {};
let sceneSize = {};

// 定义固定常数
const CONTROLS_DAMPING_FACTOR = 0.05;
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;

let scene, camera, renderer, controls;
let ambientLight;
let animationId = null;

// 创建场景
const createScene = (
    background = {color: new THREE.Color(0x000000), transparent: false}, 
    cameraPosition = {distance: 0, direction: 0, height: 0, useCurrentPosition: false},
    controlToggle = {damping: true, pan: false, zoom: true, rotate: true},
    size = {fixed: false, width: 0, height: 0}
) => {
	// 更新数据
	const updateData = (data) => {
		appData = data;
	}
	
	// 更新选项
	const updateSetting = (setting, first) => {
		appSetting = setting;
		if (!first) {
			handleWindowResize();
		}
	}
	
	// 动画循环
	const animate = () => {
		animationId = requestAnimationFrame(animate);
		controls.update();
		updateElements();
		renderer.render(scene, camera);
	};
	
	// 响应窗口大小变化
	const handleWindowResize = () => {
		let width, height;
		if (sceneSize.fixed) {
			width = sceneSize.width;
			height = sceneSize.height;
		} else {
			const sceneToggle = appSetting.isSceneToggle;
			let sceneToggleCount = 0;
			for (const value of sceneToggle) {
				if (value) {
					sceneToggleCount++;
				}
			}
		
			// 小于800像素宽：竖向排列
			const container = sceneContainer.value.parentElement;
			width = container.clientWidth, height = container.clientHeight;
			if (container.clientWidth < 800) {
				height /= sceneToggleCount;
			} else {
				width /= sceneToggleCount;
			}
		}
	
		if (camera) {
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}
		if (renderer) {
			renderer.setSize(width, height);
		}
	};

    // 订阅数据与选项
    const unsubscriberData = subscribeData(updateData);
    const unsubscriberSetting = subscribeSetting(updateSetting);
    sceneSize = size;

    // 创建新场景
    const containerElement = sceneContainer.value;
    scene = new THREE.Scene();
    if (!background.transparent) {
        scene.background = background.color;
    }

    // 创建相机
    if (cameraPosition.useCurrentPosition) {
        cameraPosition.direction = appData.longitude * Math.PI / 180;
        cameraPosition.height = appData.latitude * Math.PI / 180;
    }
    camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
    camera.position.x = cameraPosition.distance * Math.cos(cameraPosition.direction) * Math.cos(cameraPosition.height);
    camera.position.y = cameraPosition.distance * Math.sin(cameraPosition.height);
    camera.position.z = - cameraPosition.distance * Math.sin(cameraPosition.direction) * Math.cos(cameraPosition.height);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance", // 启用高性能模式
        alpha: background.transparent
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    containerElement.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.dampingFactor = CONTROLS_DAMPING_FACTOR;
    controls.enableDamping = controlToggle.damping; // 相机惯性
    controls.enablePan = controlToggle.pan; // 平移
    controls.enableZoom = controlToggle.zoom; // 缩放
    controls.enableRotate = controlToggle.rotate; // 旋转

    // 添加环境光
    ambientLight = new THREE.AmbientLight(0xffffff, 0);
    scene.add(ambientLight);

    // 处理窗口大小变化
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);

    animate();

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

const getAppData = () => appData;
const getAppSetting = () => appSetting;
const getScene = () => scene;
const getCamera = () => camera;
const getControls = () => controls;
const getRenderer = () => renderer;
const getAmbientLight = () => ambientLight;

// 更新元素（子类重写）
let updateElements = () => {};
const setUpdateElements = (func) => {
    updateElements = func;
}

defineExpose({
    getAppData,
    getAppSetting,
    getScene,
    getCamera,
    getControls,
    getRenderer,
    getAmbientLight,
    createScene,
    setUpdateElements
});
</script>

<style scoped>
</style>
