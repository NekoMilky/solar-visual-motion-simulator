<template>
    <div>
        <Draggable ref="draggableRef"/>
		<div 
            class="floating-box information-display" 
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
            ></button><br>
			<div>信息显示:</div>
			<div>时间: {{ currentTime }}</div>
            <div>太阳直射点经度: {{ solarData.solarPosition?.longitude.toFixed(3) }}°</div>
			<div>太阳直射点纬度: {{ solarData.solarPosition?.latitude.toFixed(3) }}°</div>
			<div>太阳时角: {{ solarData.solarHourAngle?.toFixed(3) }}°</div>
			<div>太阳方位角: {{ solarData.solarDirection?.toFixed(3) }}° ({{ directionDisplay }})</div>
			<div>太阳高度角: {{ solarData.solarHeight?.toFixed(3) }}°</div>
            <br>
            <div v-if="!solarData.dayLength?.polarDay && !solarData.dayLength?.polarNight">昼长: {{ dayLengthTime }}</div>
            <div v-if="!solarData.dayLength?.polarDay && !solarData.dayLength?.polarNight">日出时间: {{ sunRiseTime }}</div>
            <div v-if="!solarData.dayLength?.polarDay && !solarData.dayLength?.polarNight">日落时间: {{ sunSetTime }}</div>
            <div v-if="solarData.dayLength?.polarDay">极昼</div>
            <div v-if="solarData.dayLength?.polarNight">极夜</div>
		</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { subscribeData } from '../AppData.js';
import Draggable from './Draggable.vue';

const draggableRef = ref(null);

const currentTime = ref('');
const dayLengthTime = ref('');
const sunRiseTime = ref('');
const sunSetTime = ref('');
const directionDisplay = ref('');
const solarData = ref({});
const isNight = ref(false);

const updateData = (appData) => {
    const date = appData.date;
    const dateHours = date.getHours();
    const dateMinutes = date.getMinutes();
    const dateSeconds = date.getSeconds();
    const dateFormattedHours = dateHours.toString().padStart(2, '0');
    const dateFormattedMinutes = dateMinutes.toString().padStart(2, '0');
    const dateFormattedSeconds = dateSeconds.toString().padStart(2, '0');
    const timeZone = appData.timeZone;
    const timeZoneHours = Math.floor(Math.abs(timeZone));
    const timeZoneMinutes = Math.floor(Math.abs(timeZone) % 1 * 60);
    const timeZoneFormattedHours = timeZoneHours.toString().padStart(2, '0');
    const timeZoneFormattedMinutes = timeZoneMinutes.toString().padStart(2, '0');
    currentTime.value = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${dateFormattedHours}:${dateFormattedMinutes}:${dateFormattedSeconds} UTC${timeZone < 0 ? '-' : '+'}${timeZoneFormattedHours}:${timeZoneFormattedMinutes}`;
    
    solarData.value = appData.solarData;
    isNight.value = solarData.value.solarHeight < 0;

    if (appData.latitude == 90) {
        directionDisplay.value = 'S';
    } else if (appData.latitude == -90) {
        directionDisplay.value = 'N';
    } else {
        let direction = solarData.value.solarDirection + 22.5;
        if (direction >= 360) {
            direction -= 360;
        }
        const directionText = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        directionDisplay.value = directionText[Math.floor(direction / 45)];
    }

    if (!solarData.value.dayLength.polarDay && !solarData.value.dayLength.polarNight) {
        const dayLength = solarData.value.dayLength.dayLength;
        const dayLengthHours = Math.floor(dayLength);
        const dayLengthMinutes = Math.floor(dayLength % 1 * 60);
        const dayLengthSeconds = Math.floor(dayLength % (1 / 60) * 3600);
        const dayLengthFormattedHours = dayLengthHours.toString().padStart(2, '0');
        const dayLengthFormattedMinutes = dayLengthMinutes.toString().padStart(2, '0');
        const dayLengthFormattedSeconds = dayLengthSeconds.toString().padStart(2, '0');
        dayLengthTime.value = `${dayLengthFormattedHours}:${dayLengthFormattedMinutes}:${dayLengthFormattedSeconds}`;

        const sunRise = solarData.value.dayLength.sunRise;
        const sunRiseHours = Math.floor(sunRise);
        const sunRiseMinutes = Math.floor(sunRise % 1 * 60);
        const sunRiseSeconds = Math.floor(sunRise % (1 / 60) * 3600);
        const sunRiseFormattedHours = sunRiseHours.toString().padStart(2, '0');
        const sunRiseFormattedMinutes = sunRiseMinutes.toString().padStart(2, '0');
        const sunRiseFormattedSeconds = sunRiseSeconds.toString().padStart(2, '0');
        sunRiseTime.value = `${sunRiseFormattedHours}:${sunRiseFormattedMinutes}:${sunRiseFormattedSeconds}`;

        const sunSet = solarData.value.dayLength.sunSet;
        const sunSetHours = Math.floor(sunSet);
        const sunSetMinutes = Math.floor(sunSet % 1 * 60);
        const sunSetSeconds = Math.floor(sunSet % (1 / 60) * 3600);
        const sunSetFormattedHours = sunSetHours.toString().padStart(2, '0');
        const sunSetFormattedMinutes = sunSetMinutes.toString().padStart(2, '0');
        const sunSetFormattedSeconds = sunSetSeconds.toString().padStart(2, '0');
        sunSetTime.value = `${sunSetFormattedHours}:${sunSetFormattedMinutes}:${sunSetFormattedSeconds}`;
    }
};

onMounted(() => {
    draggableRef.value.setClassName('information-display', 'information_display');
    const unsubscriber = subscribeData(updateData);

    onUnmounted(() => {
        unsubscriber();
    });
});
</script>

<style scoped>
</style>
