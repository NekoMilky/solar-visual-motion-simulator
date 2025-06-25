<template>
    <div>
        <Draggable ref="draggableRef"/>
		<div 
            class="floating-box location-control"
		    @mouseenter="draggableRef?.setButtonShow(true)" 
		    @mouseleave="draggableRef?.setButtonShow(false)" 
		    @mousedown="draggableRef?.startDrag($event)"
            @touchstart="draggableRef?.handleTouch($event)"
		    :class="{
			    'floating-box-day': !isNight,
			    'floating-box-night': isNight,
			    'floating-box-draggable': draggableRef?.isDraggable
		    }"
        >
			<button 
                class="drag-button" 
			    v-if="draggableRef?.isButtonShow" 
			    @click="draggableRef?.toggleDraggable"
			    :class="{
			    	'drag-button-day-lock': !isNight && draggableRef?.isDraggable,
			    	'drag-button-night-lock': isNight && draggableRef?.isDraggable,
			    	'drag-button-day-unlock': !isNight && !draggableRef?.isDraggable,
			    	'drag-button-night-unlock': isNight && !draggableRef?.isDraggable
			    }"
            >
            </button><br>
			<div>位置设置:</div>
			<div>
				经度:
				<input 
                    type="number" 
				    v-model.number="longitude" 
				    ref="longitudeInput"
				    @input="updateLocation"
				    min="-180" 
				    max="180" 
				    step="0.1" 
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
				°
			</div>
			<div>
				纬度:
				<input 
                    type="number" 
				    v-model.number="latitude" 
				    ref="latitudeInput"
				    @input="updateLocation"
				    min="-90" 
				    max="90" 
				    step="0.1" 
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
				°
			</div>
			<div class="earth-preview" ref="earthContainer"></div>
		</div>
    </div>
</template>

<script setup>
import earthTexture from '@/img/texture/earth_surface.jpg';
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { subscribeData, setLocation } from '../AppData.js';
import Draggable from './Draggable.vue';

const draggableRef = ref(null);

const earthContainer = ref(null);

const longitude = ref(0);
const latitude = ref(0);
const isNight = ref(false);

const longitudeInput = ref(null);
const latitudeInput = ref(null);

const EARTH_RADIUS = 1;
const PIN_RADIUS = 0.01;
const PIN_HEIGHT = 0.3;
const PIN_TOP_RADIUS = 0.02; 

const SCENE_WIDTH = 300;
const SCENE_HEIGHT = SCENE_WIDTH;
const CONTROLS_DAMPING_FACTOR = 0.05;
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_DISTANCE = 2;

let scene, camera, renderer, controls;
let earth, pin;
let isDraggingEarth = false;
let animationId = null;

const initEarthScene = () => {
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
        scene.add(pin);
    };

    // 更新元素
    const updateElements = () => {
        // 转换角度为弧度
        const longitudeObject = longitude.value * Math.PI / 180;
        const latitudeObject = latitude.value * Math.PI / 180;

        // 控制器在组件可被拖动时禁用
        controls.enabled = !draggableRef.value?.isDraggable ?? true;

        // 更新地球位置
        if (!isDraggingEarth) {
            camera.position.x = CAMERA_DISTANCE * Math.cos(longitudeObject) * Math.cos(latitudeObject);
            camera.position.y = CAMERA_DISTANCE * Math.sin(latitudeObject);
            camera.position.z = - CAMERA_DISTANCE * Math.sin(longitudeObject) * Math.cos(latitudeObject);
            camera.lookAt(0, 0, 0);
        }

        // 更新图钉位置
        pin.position.x = EARTH_RADIUS * Math.cos(longitudeObject) * Math.cos(latitudeObject);
        pin.position.y = EARTH_RADIUS * Math.sin(latitudeObject);
        pin.position.z = - EARTH_RADIUS * Math.sin(longitudeObject) * Math.cos(latitudeObject);
        pin.rotation.y = longitudeObject;
        pin.rotation.z = latitudeObject - Math.PI / 2;
    }
    
    // 动画循环
    const animate = () => {
		animationId = requestAnimationFrame(animate);
		controls.update();
		updateElements();
		renderer.render(scene, camera);
    };

    const onDragStart = () => {
        isDraggingEarth = true;
    }

    const onDragEnd = () => {
        isDraggingEarth = false;
    }

    // 根据地球更新坐标
    const handleDraggingEarth = () => {
        if (isDraggingEarth) {
            longitude.value = parseFloat(Math.atan2(-camera.position.z, camera.position.x) * 180 / Math.PI).toFixed(1);
            latitude.value = parseFloat(Math.asin(camera.position.y / CAMERA_DISTANCE) * 180 / Math.PI).toFixed(1);
            updateLocation();
        }
    }

    // 响应窗口大小变化
	const handleWindowResize = () => {
		camera.aspect = SCENE_WIDTH / SCENE_HEIGHT;
		camera.updateProjectionMatrix();
		renderer.setSize(SCENE_WIDTH, SCENE_HEIGHT);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
	};

    // 创建新场景
    const containerElement = earthContainer.value;
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(CAMERA_DISTANCE, 0, 0);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance", // 启用高性能模式
        alpha: true // 启用透明背景
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    containerElement.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('mousedown', onDragStart);
    renderer.domElement.addEventListener('touchstart', onDragStart);
    renderer.domElement.addEventListener('mouseup', onDragEnd);
    renderer.domElement.addEventListener('touchend', onDragEnd);

    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 允许相机惯性
    controls.dampingFactor = CONTROLS_DAMPING_FACTOR;
    controls.enablePan = false; // 禁止平移
    controls.enableZoom = false; // 禁止缩放
    controls.enableRotate = true; // 允许旋转
    controls.addEventListener('change', handleDraggingEarth);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0);
    scene.add(ambientLight);

    createEarth();
    createPin();
    animate();

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);

    onUnmounted(() => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        controls.removeEventListener('change', handleDraggingEarth);
        window.removeEventListener('resize', handleWindowResize);

        if (containerElement && renderer?.domElement) {
            renderer.domElement.removeEventListener('mousedown', onDragStart);
            renderer.domElement.removeEventListener('touchstart', onDragStart);
            renderer.domElement.removeEventListener('mouseup', onDragEnd);
            renderer.domElement.removeEventListener('touchend', onDragEnd);
            containerElement.removeChild(renderer.domElement);
        }
        renderer?.dispose();
        controls?.dispose();
    });
};

const updateLocation = () => {
    setLocation(longitude.value, latitude.value);
}

const updateData = (appData) => {
    const activeElement = document.activeElement;
    const isEditingLongitude = longitudeInput.value === activeElement;
    const isEditingLatitude = latitudeInput.value === activeElement;

    if (!isEditingLongitude) {
        longitude.value = appData.longitude;
    }
    if (!isEditingLatitude) {
        latitude.value = appData.latitude;
    }
    isNight.value = appData.solarData.solarHeight < 0;
};

onMounted(() => {
    draggableRef.value.setClassName('location-control', 'location_control');
    initEarthScene();
    const unsubscriber = subscribeData(updateData);

    onUnmounted(() => {
        unsubscriber();
    });
});
</script>

<style scoped>
.earth-preview {
    background-color: transparent !important;
}

input {
    width: 60px;
    padding: 3px;
    margin: 3px;
    background-color: transparent;
    border: none; 
    -webkit-appearance: textfield;
    appearance: textfield;
    font-size: 16px;
    text-align: center;
}
</style>
