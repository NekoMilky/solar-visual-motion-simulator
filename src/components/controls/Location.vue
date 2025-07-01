<template>
    <DraggableBox ref="draggableRef" :isNight="isNight" customClass="location-control">
		<div>位置设置:</div>
		<div>
			经度:
			<InputField 
                v-model="longitude" 
                :min="-180" 
                :max="180" 
                :step="0.1"
                :isNight="isNight" 
                @input="updateLocation"
                ref="longitudeInput"
            />
			°
		</div>
		<div>
			纬度:
			<InputField 
                v-model="latitude" 
                :min="-90" 
                :max="90" 
                :step="0.1"
                :isNight="isNight" 
                @input="updateLocation"
                ref="latitudeInput"
            />
			°
		</div>
		<Base class="earth-preview" ref="baseRef" />
    </DraggableBox>
</template>

<script setup>
import earthTexture from '@/assets/images/texture/earth_surface.jpg';
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { subscribeData, setLocation } from '../../utils/AppData.js';
import DraggableBox from './DraggableBox.vue';
import InputField from './InputField.vue';
import Base from '../../views/Base.vue';

const draggableRef = ref(null);
const longitudeInput = ref(null);
const latitudeInput = ref(null);

const baseRef = ref(null);

const longitude = ref(0);
const latitude = ref(0);
const isNight = ref(false);

const EARTH_RADIUS = 1;
const PIN_RADIUS = 0.01;
const PIN_HEIGHT = 0.3;
const PIN_TOP_RADIUS = 0.02; 

const SCENE_SIZE = 300;
const CAMERA_DISTANCE = 2;

let earth, pin;
let isDraggingEarth = false;

const initEarthScene = () => {
    baseRef.value.createScene(
        {
            color: new THREE.Color(0x000000),
            transparent: true
        },
        {
            distance: CAMERA_DISTANCE, 
            useCurrentPosition: true
        },
        {
            damping: true,
            pan: false,
            zoom: false,
            rotate: true
        },
        {
            fixed: true,
            width: SCENE_SIZE,
            height: SCENE_SIZE
        }
    );

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
        baseRef.value.getScene().add(earth);
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
        baseRef.value.getScene().add(pin);
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
            longitude.value = parseFloat((Math.atan2(- baseRef.value.getCamera().position.z, baseRef.value.getCamera().position.x) * 180 / Math.PI).toFixed(1));
            latitude.value = parseFloat((Math.asin(baseRef.value.getCamera().position.y / CAMERA_DISTANCE) * 180 / Math.PI).toFixed(1));
            updateLocation();
        }
    }

    baseRef.value.getRenderer().domElement.addEventListener('mousedown', onDragStart);
    baseRef.value.getRenderer().domElement.addEventListener('touchstart', onDragStart);
    baseRef.value.getRenderer().domElement.addEventListener('mouseup', onDragEnd);
    baseRef.value.getRenderer().domElement.addEventListener('touchend', onDragEnd);

    baseRef.value.getControls().addEventListener('change', handleDraggingEarth);

    createEarth();
    createPin();
};

// 更新元素
const updateElements = () => {
    // 转换角度为弧度
    const longitudeObject = longitude.value * Math.PI / 180;
    const latitudeObject = latitude.value * Math.PI / 180;

    // 控制器在组件可被拖动时禁用
    baseRef.value.getControls().enabled = !draggableRef.value?.isDraggable ?? true;

    // 更新地球位置
    if (!isDraggingEarth) {
        baseRef.value.getCamera().position.x = CAMERA_DISTANCE * Math.cos(longitudeObject) * Math.cos(latitudeObject);
        baseRef.value.getCamera().position.y = CAMERA_DISTANCE * Math.sin(latitudeObject);
        baseRef.value.getCamera().position.z = - CAMERA_DISTANCE * Math.sin(longitudeObject) * Math.cos(latitudeObject);
        baseRef.value.getCamera().lookAt(0, 0, 0);
    }

    // 更新图钉位置
    pin.position.x = EARTH_RADIUS * Math.cos(longitudeObject) * Math.cos(latitudeObject);
    pin.position.y = EARTH_RADIUS * Math.sin(latitudeObject);
    pin.position.z = - EARTH_RADIUS * Math.sin(longitudeObject) * Math.cos(latitudeObject);
    pin.rotation.y = longitudeObject;
    pin.rotation.z = latitudeObject - Math.PI / 2;
}

const updateLocation = () => {
    setLocation(longitude.value, latitude.value);
}

const updateData = (appData) => {
    const activeElement = document.activeElement;
    const isEditingLongitude = longitudeInput.value?.$el === activeElement;
    const isEditingLatitude = latitudeInput.value?.$el === activeElement;

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
    baseRef.value.setUpdateElements(updateElements);
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
}
</style>
