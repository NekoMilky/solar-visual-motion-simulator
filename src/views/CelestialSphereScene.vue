<template>
    <Base ref="baseRef" />
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref } from 'vue';
import Base from './Base.vue';

const baseRef = ref(null);

// 定义固定常数
const SKY_COLORS = {
    astronomical: new THREE.Color(0x0B0B2D), // 天文晨光（深蓝黑）
    nautical: new THREE.Color(0x1A2B4D), // 航海晨光（暗蓝）
    civil: new THREE.Color(0x4B6A9D), // 民用晨光（灰蓝）
    sunriseEdge: new THREE.Color(0xFFA07A), // 日出边缘（橙红）
    daytime: new THREE.Color(0x87CEEB), // 白天（天蓝）
};
// 光照参数（基于物理单位）
const LIGHT_PARAMS = {
    night: { 
        intensity: 0.01, 
        color: new THREE.Color(0x001144), // 深蓝（月照）
        heightThreshold: -Math.PI / 6 
    },
    nautical: { 
        intensity: 0.1, 
        color: new THREE.Color(0x334D80), // 暗蓝
        heightThreshold: -Math.PI / 12    
    },
    civil: { 
        intensity: 0.3, 
        color: new THREE.Color(0x7788AA), // 灰蓝
        heightThreshold: -Math.PI / 36     
    },
    sunrise: { 
        intensity: 0.6, 
        color: new THREE.Color(0xFFDDBB), // 橙黄
        heightThreshold: 0                
    },
    day: { 
        intensity: 1.0, 
        color: new THREE.Color(0xFFFFFF), // 纯白
        heightThreshold: Math.PI / 12       
    }
};
const GROUND_RADIUS = 3;
const SUN_RADIUS = 0.2;
const SUN_TRAJECTORY_WIDTH = 0.05;
const POLE_STAR_POINTER_RADIUS = 0.02;
const DIRECTION_LABEL_SIZE = 0.3;
const DIRECTION_LABEL_RADIUS = GROUND_RADIUS + DIRECTION_LABEL_SIZE;
const FONT_SIZE = 64;

const CAMERA_DISTANCE = 7.5;
const CAMERA_DIRECTION = 3 * Math.PI / 4;
const CAMERA_HEIGHT = Math.PI / 6;

let sun, sunTrajectory, poleStarPointer, directionSprites;

// 创建场景
const createScene = () => {
    baseRef.value.createScene(
        {
            color: SKY_COLORS.daytime,
            transparent: false
        },
        {
            distance: CAMERA_DISTANCE, 
            direction: CAMERA_DIRECTION, 
            height: CAMERA_HEIGHT
        }
    );

    // 创建地平面
	const createGround = () => {
		// 正面材质 - 绿色带白色十字线
		const frontCanvas = document.createElement('canvas');
		frontCanvas.width = 512;
		frontCanvas.height = 512;
		const frontContext = frontCanvas.getContext('2d');
		// 填充绿色背景
		frontContext.fillStyle = '#008000';
		frontContext.fillRect(0, 0, frontCanvas.width, frontCanvas.height);
		// 绘制白色十字线
		frontContext.strokeStyle = '#ffffff';
		frontContext.lineWidth = 4;
		frontContext.beginPath();
		// 垂直线（南北方向）
		frontContext.moveTo(frontCanvas.width / 2, 0);
		frontContext.lineTo(frontCanvas.width / 2, frontCanvas.height);
		// 水平线（东西方向）
		frontContext.moveTo(0, frontCanvas.height / 2);
		frontContext.lineTo(frontCanvas.width, frontCanvas.height / 2);
		frontContext.stroke();
		const frontTexture = new THREE.CanvasTexture(frontCanvas);
		const frontMaterial = new THREE.MeshStandardMaterial({
            map: frontTexture, 
            side: THREE.FrontSide
        });
	
		// 背面材质 - 黑色带白色十字线
		const backCanvas = document.createElement('canvas');
		backCanvas.width = 512;
		backCanvas.height = 512;
		const backContext = backCanvas.getContext('2d');
		// 填充黑色背景
		backContext.fillStyle = '#000000';
		backContext.fillRect(0, 0, backCanvas.width, backCanvas.height);
		// 绘制白色十字线
		backContext.strokeStyle = '#ffffff';
		backContext.lineWidth = 4;
		backContext.beginPath();
		// 垂直线（南北方向）
		backContext.moveTo(backCanvas.width / 2, 0);
		backContext.lineTo(backCanvas.width / 2, backCanvas.height);
		// 水平线（东西方向）
		backContext.moveTo(0, backCanvas.height / 2);
		backContext.lineTo(backCanvas.width, backCanvas.height / 2);
		backContext.stroke();
		const backTexture = new THREE.CanvasTexture(backCanvas);
		const backMaterial = new THREE.MeshStandardMaterial({
            map: backTexture, 
            side: THREE.BackSide
        });
	
		const geometry = new THREE.CircleGeometry(
            GROUND_RADIUS, 
            64
        );
	
		const groundFront = new THREE.Mesh(geometry, frontMaterial);
		groundFront.position.set(0, 0, 0);
		groundFront.rotation.set(- Math.PI / 2, 0, 0);
		baseRef.value.getScene().add(groundFront);
	
		const groundBack = new THREE.Mesh(geometry, backMaterial);
		groundBack.position.set(0, 0, 0);
		groundBack.rotation.set(- Math.PI / 2, 0, 0);
		baseRef.value.getScene().add(groundBack);
	};
	
	// 创建天球
	const createCelestialSphere = () => {
		const geometry = new THREE.SphereGeometry(
            GROUND_RADIUS, 
            64, 
            64
        );
		const material = new THREE.MeshBasicMaterial({
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.05, 
            side: THREE.BackSide
        });
		const celestialSphere = new THREE.Mesh(geometry, material);
        celestialSphere.position.set(0, 0, 0);
        celestialSphere.rotation.set(0, 0, 0);
		baseRef.value.getScene().add(celestialSphere);
	};
	
	// 创建太阳
	const createSun = () => {
		const geometry = new THREE.SphereGeometry(
            SUN_RADIUS, 
            32, 
            32
        );
		const material = new THREE.MeshBasicMaterial({
            color: 0xffff00 
        });
		sun = new THREE.Mesh(geometry, material);
		baseRef.value.getScene().add(sun);
	};
	
	// 创建太阳视运动轨迹
	const createSunTrajectory = () => {
		const geometry = new THREE.RingGeometry(
            GROUND_RADIUS - SUN_TRAJECTORY_WIDTH / 2, 
            GROUND_RADIUS + SUN_TRAJECTORY_WIDTH / 2, 
            64
        );
		const material = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.7, 
            side: THREE.DoubleSide 
        });
		sunTrajectory = new THREE.Mesh(geometry, material);
        sunTrajectory.position.x = 0;
        sunTrajectory.rotation.y = 0;
        sunTrajectory.rotation.z = 0;
	};
	
    // 创建北极星指针
	const createPoleStarPointer = () => {
		const geometry = new THREE.CylinderGeometry(
            POLE_STAR_POINTER_RADIUS, 
            POLE_STAR_POINTER_RADIUS, 
            GROUND_RADIUS, 
            16
        );
		const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.7, 
            side: THREE.DoubleSide 
        });
		poleStarPointer = new THREE.Mesh(geometry, material);
        poleStarPointer.position.x = 0;
        poleStarPointer.rotation.y = 0;
        poleStarPointer.rotation.z = 0;
	};
	
	// 创建方位标签
	const createDirectionLabels = () => {
		directionSprites = [];
		const angles = [3 * Math.PI / 2, 0, Math.PI / 2, Math.PI];
	
		angles.forEach(angle => {
            const canvas = document.createElement('canvas');
			const texture = new THREE.CanvasTexture(canvas);
			const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture 
            });
			const sprite = new THREE.Sprite(spriteMaterial);
	
			sprite.position.set(DIRECTION_LABEL_RADIUS * Math.cos(angle), 0.01, DIRECTION_LABEL_RADIUS * Math.sin(angle));
			sprite.scale.setScalar(DIRECTION_LABEL_SIZE);
	
			directionSprites.push(sprite);
			baseRef.value.getScene().add(sprite);
		});
	};

    createGround();
    createCelestialSphere();
    createSun();
    createSunTrajectory();
    createPoleStarPointer();
    createDirectionLabels();
};

// 更新元素
const updateElements = () => {
	const solarData = baseRef.value.getAppData().solarData;

	// 转换角度为弧度
	const declination = solarData.solarPosition.latitude * Math.PI / 180;
	const height = solarData.solarHeight * Math.PI / 180;
	const direction = (solarData.solarDirection - 90) * Math.PI / 180;
	const latitude = baseRef.value.getAppData().latitude * Math.PI / 180;

    const isNight = height < 0;

	// 计算太阳显示位置
	sun.position.x = GROUND_RADIUS * Math.cos(direction) * Math.cos(height);
	sun.position.y = GROUND_RADIUS * Math.sin(height);
	sun.position.z = GROUND_RADIUS * Math.sin(direction) * Math.cos(height);

	// 计算太阳视运动轨迹显示位置
	if (baseRef.value.getAppSetting().isSunTrajectoryToggle) {
		if (!baseRef.value.getScene().children.includes(sunTrajectory)) {
			baseRef.value.getScene().add(sunTrajectory);
		}
		sunTrajectory.position.y = GROUND_RADIUS * Math.sin(declination) * Math.sin(latitude);
		sunTrajectory.position.z = - GROUND_RADIUS * Math.sin(declination) * Math.cos(latitude);
		sunTrajectory.rotation.x = latitude;
		sunTrajectory.scale.setScalar(Math.cos(declination));
	} else if (baseRef.value.getScene().children.includes(sunTrajectory)) {
		baseRef.value.getScene().remove(sunTrajectory);
	}

	// 计算北极星指针显示位置
	if (baseRef.value.getAppSetting().isPoleStarPointerToggle) {
		if (!baseRef.value.getScene().children.includes(poleStarPointer)) {
			baseRef.value.getScene().add(poleStarPointer);
		}
		poleStarPointer.position.y = GROUND_RADIUS / 2 * Math.sin(latitude);
		poleStarPointer.position.z = - GROUND_RADIUS / 2 * Math.cos(latitude);
		poleStarPointer.rotation.x = latitude - Math.PI / 2;
	} else if (baseRef.value.getScene().children.includes(poleStarPointer)) {
		baseRef.value.getScene().remove(poleStarPointer);
	}

	// 更新方位标签
	const directions = ['北', '东', '南', '西'];
	if (latitude == Math.PI / 2) {
		directions.fill('南');
	} else if (latitude == -Math.PI / 2) {
		directions.fill('北');
	}
	directions.forEach((direction, index) => {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		context.font = `${FONT_SIZE}px Arial`;
		const textWidth = context.measureText(direction).width;

		canvas.width = textWidth;
		canvas.height = FONT_SIZE;
		context.font = `${FONT_SIZE}px Arial`;
		context.fillStyle = isNight ? 'white' : 'black';
		context.textBaseline = 'middle';
		context.fillText(direction, 0, FONT_SIZE / 2);

		const texture = new THREE.CanvasTexture(canvas);
		const spriteMaterial = directionSprites[index].material;
		spriteMaterial.map = texture;
		spriteMaterial.needsUpdate = true;
	});

	// 动态计算环境光参数
	let lightParams;
	if (height <= LIGHT_PARAMS.night.heightThreshold) {
		lightParams = LIGHT_PARAMS.night;
	} 
	else if (height <= LIGHT_PARAMS.nautical.heightThreshold) {
		const t = (height - LIGHT_PARAMS.night.heightThreshold) / (LIGHT_PARAMS.nautical.heightThreshold - LIGHT_PARAMS.night.heightThreshold);
		lightParams = {
			intensity: THREE.MathUtils.lerp(LIGHT_PARAMS.night.intensity, LIGHT_PARAMS.nautical.intensity, t),
			color: LIGHT_PARAMS.night.color.clone().lerp(LIGHT_PARAMS.nautical.color, t)
		};
	}
	else if (height <= LIGHT_PARAMS.civil.heightThreshold) {
		const t = (height - LIGHT_PARAMS.nautical.heightThreshold) / (LIGHT_PARAMS.civil.heightThreshold - LIGHT_PARAMS.nautical.heightThreshold);
		lightParams = {
			intensity: THREE.MathUtils.lerp(LIGHT_PARAMS.nautical.intensity, LIGHT_PARAMS.civil.intensity, t),
			color: LIGHT_PARAMS.nautical.color.clone().lerp(LIGHT_PARAMS.civil.color, t)
		};
	}
	else if (height <= LIGHT_PARAMS.sunrise.heightThreshold) {
		const t = (height - LIGHT_PARAMS.civil.heightThreshold) / (LIGHT_PARAMS.sunrise.heightThreshold - LIGHT_PARAMS.civil.heightThreshold);
		lightParams = {
			intensity: THREE.MathUtils.lerp(LIGHT_PARAMS.civil.intensity, LIGHT_PARAMS.sunrise.intensity, t),
			color: LIGHT_PARAMS.civil.color.clone().lerp(LIGHT_PARAMS.sunrise.color, t)
		};
	}
	else {
		const t = Math.min(1, height / LIGHT_PARAMS.day.heightThreshold);
		lightParams = {
			intensity: THREE.MathUtils.lerp(LIGHT_PARAMS.sunrise.intensity, LIGHT_PARAMS.day.intensity, t),
			color: LIGHT_PARAMS.sunrise.color.clone().lerp(LIGHT_PARAMS.day.color, t)
		};
	}
	baseRef.value.getAmbientLight().intensity = lightParams.intensity;
	baseRef.value.getAmbientLight().color.copy(lightParams.color);

	// 动态计算背景色
	let skyColor;
	if (height <= -Math.PI / 6) { // 天文晨光                   
		skyColor = SKY_COLORS.astronomical;
	} else if (height <= -Math.PI / 12) { // 航海晨光          
		const t = (height + Math.PI / 6) / (Math.PI / 12);
		skyColor = SKY_COLORS.astronomical.clone().lerp(SKY_COLORS.nautical, t);
	} else if (height <= -Math.PI / 36) { // 民用晨光     
		const t = (height + Math.PI / 12) / (Math.PI / 18);
		skyColor = SKY_COLORS.nautical.clone().lerp(SKY_COLORS.civil, t);
	} else if (height <= 0) { // 日出边缘             
		const t = (height + Math.PI / 36) / (Math.PI / 36);
		skyColor = SKY_COLORS.civil.clone().lerp(SKY_COLORS.sunriseEdge, t);
	} else { // 白天   
		const t = Math.min(1, height / (Math.PI / 12)); 
		skyColor = SKY_COLORS.sunriseEdge.clone().lerp(SKY_COLORS.daytime, t);
	}
	baseRef.value.getScene().background = skyColor;
};

onMounted(() => {
    createScene();
    baseRef.value.setUpdateElements(updateElements);
});
</script>

<style scoped>
</style>
