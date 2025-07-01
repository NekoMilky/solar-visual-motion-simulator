<template>
    <main>
        <div class="scenes">
            <CelestialSphereScene v-if="appSetting.isSceneToggle?.[0]" />
            <EarthScene v-if="appSetting.isSceneToggle?.[1]" />
        </div>
        <div class="control">
            <InformationDisplay v-if="appSetting.isInformationDisplayToggle" />
            <LocationControl v-if="appSetting.isLocationControlToggle" />
            <TimeControl v-if="appSetting.isTimeControlToggle" />
        </div>
        <div class="nav-bar">
            <NavBarButton
                :isActive="appSetting.isInformationDisplayToggle"
                :isNight="isNight"
                customClass="toggle-information-display"
                @click="toggleInformationDisplay"
            />
            <NavBarButton
                :isActive="appSetting.isLocationControlToggle"
                :isNight="isNight"
                customClass="toggle-location-control"
                @click="toggleLocationControl"
            />
            <NavBarButton
                :isActive="appSetting.isTimeControlToggle"
                :isNight="isNight"
                customClass="toggle-time-control"
                @click="toggleTimeControl"
            />
            <div class="nav-bar-empty"></div>
            <NavBarButton
                :isActive="appSetting.isSceneToggle?.[0]"
                :isNight="isNight"
                customClass="toggle-ground-scene"
                @click="toggleScenes(0)"
            />
            <template v-if="appSetting.isSceneToggle?.[0]">
                <NavBarButton
                    :isActive="appSetting.isSunTrajectoryToggle"
                    :isNight="isNight"
                    customClass="toggle-sun-trajectory"
                    @click="toggleSunTrajectory"
                />
                <NavBarButton
                    :isActive="appSetting.isPoleStarPointerToggle"
                    :isNight="isNight"
                    customClass="toggle-pole-star-pointer"
                    @click="togglePoleStarPointer"
                />
            </template>
            <div class="nav-bar-empty"></div>
            <NavBarButton
                :isActive="appSetting.isSceneToggle?.[1]"
                :isNight="isNight"
                customClass="toggle-earth-scene"
                @click="toggleScenes(1)"
            />
            <template v-if="appSetting.isSceneToggle?.[1]">
                <NavBarButton
                    :isActive="appSetting.isPinToggle"
                    :isNight="isNight"
                    customClass="toggle-pin"
                    @click="togglePin"
                />
                <NavBarButton
                    :isActive="appSetting.isGridToggle"
                    :isNight="isNight"
                    customClass="toggle-grid"
                    @click="toggleGrid"
                />
                <NavBarButton
                    :isActive="appSetting.isSunRayPointerToggle"
                    :isNight="isNight"
                    customClass="toggle-sun-ray-pointer"
                    @click="toggleSunRayPointer"
                />
            </template>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import NavBarButton from './NavBarButton.vue';
import CelestialSphereScene from './components/CelestialSphereScene.vue';
import EarthScene from './components/EarthScene.vue';
import InformationDisplay from './components/control/InformationDisplay.vue';
import LocationControl from './components/control/Location.vue';
import TimeControl from './components/control/Time.vue';
import { subscribeData } from './components/AppData.js';
import { subscribeSetting, toggleScenes, toggleInformationDisplay, toggleLocationControl, toggleTimeControl, toggleSunTrajectory, togglePoleStarPointer, toggleGrid, togglePin, toggleSunRayPointer } from './components/AppSetting.js';

const appSetting = ref({});
const isNight = ref(false);

const updateData = (data) => {
    isNight.value = data.solarData.solarHeight < 0;
};

const updateSetting = (setting) => {
    appSetting.value = setting;
}

onMounted(() => {
    const unsubscriberData = subscribeData(updateData);
    const unsubscriberSetting = subscribeSetting(updateSetting);

    onUnmounted(() => {
        unsubscriberData();
        unsubscriberSetting();
    });
});
</script>

<style>
.scenes {
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
}

.nav-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    padding: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: rgb(255, 255, 255);
    gap: clamp(3px, 2vw, 20px);
}

.nav-bar-empty {
    width: clamp(10px, 4vw, 40px);
    height: clamp(10px, 4vw, 40px);
}

.toggle-information-display {
    background-image: url(@/img/icon/information.png);
}

.toggle-location-control {
    background-image: url(@/img/icon/location.png);
}

.toggle-time-control {
    background-image: url(@/img/icon/time.png);
}

.toggle-ground-scene {
    background-image: url(@/img/icon/ground_scene.png);
}

.toggle-sun-trajectory {
    background-image: url(@/img/icon/sun_trajectory.png);
}

.toggle-pole-star-pointer {
    background-image: url(@/img/icon/pole_star_pointer.png);
}

.toggle-earth-scene {
    background-image: url(@/img/icon/earth_scene.png);
}

.toggle-pin {
    background-image: url(@/img/icon/pin.png);
}

.toggle-grid {
    background-image: url(@/img/icon/grid.png);
}

.toggle-sun-ray-pointer {
    background-image: url(@/img/icon/sun_ray_pointer.png);
}
</style>
