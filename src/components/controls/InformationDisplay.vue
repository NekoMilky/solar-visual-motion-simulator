<template>
    <Draggable ref="draggableRef" :isNight="isNight" customClass="information-display">
		<div>信息显示:</div>
		<div>时间: {{ currentTime }}</div>
        <div>太阳直射点经度: {{ solarData.solarPosition?.longitude.toFixed(3) }}°</div>
		<div>太阳直射点纬度: {{ solarData.solarPosition?.latitude.toFixed(3) }}°</div>
		<div>太阳时角: {{ solarData.solarHourAngle?.toFixed(3) }}°</div>
		<div>太阳方位角: {{ solarData.solarDirection?.toFixed(3) }}° ({{ directionDisplay }})</div>
		<div>太阳高度角: {{ solarData.solarHeight?.toFixed(3) }}°</div>
        <br>
        <div v-if="solarData.solarTime?.isPolarDay">极昼</div>
        <div v-if="solarData.solarTime?.isPolarNight">极夜</div>
        <div v-if="!solarData.solarTime?.isPolarDay && !solarData.solarTime?.isPolarNight">昼长: {{ dayDurationTime }}</div>
        <div v-if="!solarData.solarTime?.isPolarDay && !solarData.solarTime?.isPolarNight">日出: {{ sunRiseTime }}</div>
        <div>日中: {{ noonTime }}</div>
        <div v-if="!solarData.solarTime?.isPolarDay && !solarData.solarTime?.isPolarNight">日落: {{ sunSetTime }}</div>
        <template v-if="solarData.solarTime?.isCivilTwilight">
            <br>
            <div>民用曙光始: {{ civilTwilightStartTime }}</div>
            <div>民用暮光终: {{ civilTwilightEndTime }}</div>
        </template>
        <template v-if="solarData.solarTime?.isNauticalTwilight">
            <br>
            <div>航海曙光始: {{ nauticalTwilightStartTime }}</div>
            <div>航海暮光终: {{ nauticalTwilightEndTime }}</div>
        </template>
        <template v-if="solarData.solarTime?.isAstronomicalTwilight">
            <br>
            <div>天文曙光始: {{ astronomicalTwilightStartTime }}</div>
            <div>天文暮光终: {{ astronomicalTwilightEndTime }}</div>
        </template>
    </Draggable>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { subscribeData } from '../../utils/AppData.js';
import Draggable from './Draggable.vue';

const draggableRef = ref(null);

const currentTime = ref('');
const dayDurationTime = ref('');
const sunRiseTime = ref('');
const sunSetTime = ref('');
const noonTime = ref('');
const civilTwilightStartTime = ref('');
const civilTwilightEndTime = ref('');
const nauticalTwilightStartTime = ref('');
const nauticalTwilightEndTime = ref('');
const astronomicalTwilightStartTime = ref('');
const astronomicalTwilightEndTime = ref('');
const directionDisplay = ref('');
const solarData = ref({});
const isNight = ref(false);

const dateFormat = (date = new Date()) => {
    const formattedYear = date.getFullYear();
    const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const formattedDate = date.getDate().toString().padStart(2, '0');
    const formattedHours = date.getHours().toString().padStart(2, '0');
    const formattedMinutes = date.getMinutes().toString().padStart(2, '0');
    const formattedSeconds = date.getSeconds().toString().padStart(2, '0');
    return `${formattedYear}-${formattedMonth}-${formattedDate} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

const timeFormat = (time, showSecond) => {
    const hours = Math.floor(time);
    const minutes = Math.floor(time % 1 * 60);
    const seconds = Math.floor(time * 60 % 1 * 60);
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${showSecond ? `:${formattedSeconds}` : ``}`;
}

const updateData = (appData) => {
    solarData.value = appData.solarData;
    isNight.value = solarData.value.solarHeight < 0;

    // 格式化日期
    const date = appData.date;
    const dateFormatted = dateFormat(date);
    const timeZone = appData.timeZone;
    const timeZoneFormatted = timeFormat(timeZone, false);
    currentTime.value = `${dateFormatted} UTC${timeZone < 0 ? '-' : '+'}${timeZoneFormatted}`;

    // 方位更新
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

    // 昼长、日出、日中、日落
    if (!solarData.value.solarTime.isPolarDay && !solarData.value.solarTime.isPolarNight) {
        const dayDuration = solarData.value.solarTime.dayDuration;
        const dayDurationFormatted = timeFormat(dayDuration, true);
        dayDurationTime.value = `${dayDurationFormatted}`;

        const sunRise = solarData.value.solarTime.sunRise;
        const sunRiseFormatted = timeFormat(sunRise, true);
        sunRiseTime.value = `${sunRiseFormatted}`;

        const sunSet = solarData.value.solarTime.sunSet;
        const sunSetFormatted = timeFormat(sunSet, true);
        sunSetTime.value = `${sunSetFormatted}`;
    }
    const noon = solarData.value.solarTime.noon;
    const noonFormatted = timeFormat(noon, true);
    noonTime.value = `${noonFormatted}`;

    // 民用曙暮光
    if (solarData.value.solarTime.isCivilTwilight) {
        const start = solarData.value.solarTime.civilTwilightStart;
        const startFormatted = timeFormat(start, true);
        civilTwilightStartTime.value = `${startFormatted}`;

        const end = solarData.value.solarTime.civilTwilightEnd;
        const endFormatted = timeFormat(end, true);
        civilTwilightEndTime.value = `${endFormatted}`;
    }

    // 航海曙暮光
    if (solarData.value.solarTime.isNauticalTwilight) {
        const start = solarData.value.solarTime.nauticalTwilightStart;
        const startFormatted = timeFormat(start, true);
        nauticalTwilightStartTime.value = `${startFormatted}`;

        const end = solarData.value.solarTime.nauticalTwilightEnd;
        const endFormatted = timeFormat(end, true);
        nauticalTwilightEndTime.value = `${endFormatted}`;
    }

    // 天文曙暮光
    if (solarData.value.solarTime.isAstronomicalTwilight) {
        const start = solarData.value.solarTime.astronomicalTwilightStart;
        const startFormatted = timeFormat(start, true);
        astronomicalTwilightStartTime.value = `${startFormatted}`;

        const end = solarData.value.solarTime.astronomicalTwilightEnd;
        const endFormatted = timeFormat(end, true);
        astronomicalTwilightEndTime.value = `${endFormatted}`;
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
