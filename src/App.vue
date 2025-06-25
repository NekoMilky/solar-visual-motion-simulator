<template>
    <main>
        <div class="scenes">
            <GroundScene v-if="appSetting.isGroundSceneToggle"/>
            <EarthScene v-if="appSetting.isEarthSceneToggle"/>
        </div>
        <InformationDisplay v-if="appSetting.isInformationDisplayToggle"/>
        <LocationControl v-if="appSetting.isLocationControlToggle"/>
        <TimeControl v-if="appSetting.isTimeControlToggle"/>
        <div class="nav-bar">
            <button 
                class="nav-bar-button toggle-information-display"  
                @click="toggleInformationDisplay"
                :class="{
                    'nav-bar-button-day': appSetting.isInformationDisplayToggle && !isNight,
                    'nav-bar-button-night': appSetting.isInformationDisplayToggle && isNight
                }"
            ></button>
            <button 
                class="nav-bar-button toggle-location-control" 
                @click="toggleLocationControl"
                :class="{
                    'nav-bar-button-day': appSetting.isLocationControlToggle && !isNight,
                    'nav-bar-button-night': appSetting.isLocationControlToggle && isNight
                }"
            ></button>
            <button 
                class="nav-bar-button toggle-time-control"  
                @click="toggleTimeControl"
                :class="{
                    'nav-bar-button-day': appSetting.isTimeControlToggle && !isNight,
                    'nav-bar-button-night': appSetting.isTimeControlToggle && isNight
                }"
            ></button>
            <div class="nav-bar-empty"></div>
            <button 
                class="nav-bar-button toggle-ground-scene"  
                @click="toggleGroundScene"
                :class="{
                    'nav-bar-button-day': appSetting.isGroundSceneToggle && !isNight,
                    'nav-bar-button-night': appSetting.isGroundSceneToggle && isNight
                }"
            ></button>
            <div v-if="appSetting.isGroundSceneToggle">
                <button 
                    class="nav-bar-button toggle-sun-trajectory"  
                    @click="toggleSunTrajectory"
                    :class="{
                        'nav-bar-button-day': appSetting.isSunTrajectoryToggle && !isNight,
                        'nav-bar-button-night': appSetting.isSunTrajectoryToggle && isNight
                    }"
                ></button>
                <button 
                    class="nav-bar-button toggle-pole-star-pointer"  
                    @click="togglePoleStarPointer"
                    :class="{
                        'nav-bar-button-day': appSetting.isPoleStarPointerToggle && !isNight,
                        'nav-bar-button-night': appSetting.isPoleStarPointerToggle && isNight
                    }"
                ></button>
            </div>
            <div class="nav-bar-empty"></div>
            <button 
                class="nav-bar-button toggle-earth-scene"  
                @click="toggleEarthScene"
                :class="{
                    'nav-bar-button-day': appSetting.isEarthSceneToggle && !isNight,
                    'nav-bar-button-night': appSetting.isEarthSceneToggle && isNight
                }"
            ></button>
            <div v-if="appSetting.isEarthSceneToggle">
                <button 
                    class="nav-bar-button toggle-pin"  
                    @click="togglePin"
                    :class="{
                        'nav-bar-button-day': appSetting.isPinToggle && !isNight,
                        'nav-bar-button-night': appSetting.isPinToggle && isNight
                    }"
                ></button>
                <button 
                    class="nav-bar-button toggle-grid"  
                    @click="toggleGrid"
                    :class="{
                        'nav-bar-button-day': appSetting.isGridToggle && !isNight,
                        'nav-bar-button-night': appSetting.isGridToggle && isNight
                    }"
                ></button>
                <button 
                    class="nav-bar-button toggle-sun-ray-pointer"  
                    @click="toggleSunRayPointer"
                    :class="{
                        'nav-bar-button-day': appSetting.isSunRayPointerToggle && !isNight,
                        'nav-bar-button-night': appSetting.isSunRayPointerToggle && isNight
                    }"
                ></button>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import GroundScene from './components/GroundScene.vue';
import EarthScene from './components/EarthScene.vue';
import InformationDisplay from './components/control/InformationDisplay.vue';
import LocationControl from './components/control/Location.vue';
import TimeControl from './components/control/Time.vue';
import { subscribeData } from './components/AppData.js';
import { subscribeSetting, toggleGroundScene, toggleEarthScene, toggleInformationDisplay, toggleLocationControl, toggleTimeControl, toggleSunTrajectory, togglePoleStarPointer, toggleGrid, togglePin, toggleSunRayPointer } from './components/AppSetting.js';

const appSetting = ref({
    isGroundSceneToggle: true,
    isEarthSceneToggle: false,
    isInformationDisplayToggle: false,
    isLocationControlToggle: false,
    isTimeControlToggle: false,
    isSunTrajectoryToggle: true,
    isPoleStarPointerToggle: true,
    isGridToggle: false,
    isPinToggle: true,
    isSunRayPointerToggle: false
});
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

<style scoped>
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
    background-color: rgb(255, 255, 255);
}

.nav-bar-empty {
    width: 40px;
    height: 40px;
    margin: 10px;
}

.nav-bar-button {
    width: 40px;
    height: 40px;
    margin: 10px;
    border-radius: 10px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: transparent;
    border: none;
    transition: background-color 0.3s, opacity 0.3s;
}

.nav-bar-button-day {
    background-color: rgb(255, 140, 0);
}

.nav-bar-button-night {
    background-color: rgb(89, 118, 186);
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
