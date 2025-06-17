<template>
    <div>
        <Draggable ref="draggableRef"/>
		<div 
            class="floating-box time-control"
		    @mouseenter="draggableRef?.setButtonShow(true)" 
		    @mouseleave="draggableRef?.setButtonShow(false)" 
		    @mousedown="draggableRef?.startDrag($event)"
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
			<div>时间设置:</div>
			<div>
				日期:
				<input 
                    type="number" 
				    v-model.number="date.year" 
				    ref="yearInput"
				    @input="updateDate"
				    min="1970" 
				    max="9999" 
				    step="1" 
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
				/
				<input 
                    type="number" 
				    v-model.number="date.month" 
				    ref="monthInput"
				    @input="updateDate"
				    min="1" 
				    max="12" 
				    step="1" 
				    :class="{
				    	'input-day': !isNight,
				    	'input-night': isNight
				    }"
                >
				/
				<input 
                    type="number" 
				    v-model.number="date.date" 
				    ref="dateInput"
				    @input="updateDate"
				    min="1" 
				    :max="date.daysOfMonth"
				    step="1" 
				    :class="{
				    	'input-day': !isNight,
				    	'input-night': isNight
				    }"
                >
			</div>
			<div>
				时刻:
				<input 
                    type="number" 
				    v-model.number="date.hour"
				    ref="hourInput"
				    @input="updateDate"
				    min="0"
				    max="23"
				    step="1"
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
				:
				<input 
                    type="number" 
				    v-model.number="date.minute"
				    ref="minuteInput"
				    @input="updateDate"
				    min="0"
				    max="59"
				    step="1"
				    :class="{
				    	'input-day': !isNight,
				    	'input-night': isNight
				    }"
                >
				:
				<input 
                    type="number" 
				    v-model.number="date.second"
				    ref="secondInput"
				    @input="updateDate"
				    min="0"
				    max="59"
				    step="1"
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
			</div>
			<div>
				使用时区(UTC):
				<input 
                    type="number" 
				    v-model.number="timeZone" 
				    ref="timeZoneInput"
				    @input="updateTimeZone"
				    min="-12" 
				    max="12" 
				    step="0.5" 
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
			</div>
			<div>
				时间流逝倍率: 
				<input 
                    type="number" 
				    v-model.number="timeLapse" 
				    ref="timeLapseInput"
				    @input="updateTimeLapse"
				    min="-9" 
				    max="9" 
				    step="1" 
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
				倍
			</div>
			<div>
				同步现实时间:
				<input 
                    type="checkbox"
				    v-model="timeSync"
				    @change="toggleTimeSync"
				    :class="{
					    'input-day': !isNight,
					    'input-night': isNight
				    }"
                >
			</div>
		</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { subscribeData, setDate, setTimeLapse, setTimeSync, setTimeZone } from '../AppData.js';
import Draggable from './Draggable.vue';

const draggableRef = ref(null);

const date = ref({
    year: 1970,
    month: 1,
    date: 1,
    hour: 0,
    minute: 0,
    second: 0,
    daysOfMonth: 0
})
const timeZone = ref(0);
const timeSync = ref(true);
const timeLapse = ref(0);
const isNight = ref(false);

const yearInput = ref(null);
const monthInput = ref(null);
const dateInput = ref(null);
const hourInput = ref(null);
const minuteInput = ref(null);
const secondInput = ref(null);
const timeZoneInput = ref(null);
const timeLapseInput = ref(null);

const updateDate = () => {
    setDate(new Date(
        date.value.year, 
        date.value.month - 1, 
        date.value.date, 
        date.value.hour, 
        date.value.minute, 
        date.value.second
    ));
}

const updateTimeZone = () => {
    setTimeZone(timeZone.value);
}

const updateTimeLapse = () => {
    setTimeLapse(timeLapse.value);
}

const toggleTimeSync = () => {
    setTimeSync(timeSync.value);
}

const updateData = (appData) => {
    const activeElement = document.activeElement;
    const isEditingYear = yearInput.value === activeElement;
    const isEditingMonth = monthInput.value === activeElement;
    const isEditingDate = dateInput.value === activeElement;
    const isEditingHour = hourInput.value === activeElement;
    const isEditingMinute = minuteInput.value === activeElement;
    const isEditingSecond = secondInput.value === activeElement;
    const isEditingTimeZone = timeZoneInput.value === activeElement;
    const isEditingTimeLapse = timeLapseInput.value === activeElement;

    const dateObject = appData.date;
    if (!isEditingYear) {
        date.value.year = dateObject.getFullYear();
    }
    if (!isEditingMonth) {
        date.value.month = dateObject.getMonth() + 1;
    }
    if (!isEditingDate) {
        date.value.date = dateObject.getDate();
    }
    if (!isEditingHour) {
        date.value.hour = dateObject.getHours();
    }
    if (!isEditingMinute) {
        date.value.minute = dateObject.getMinutes();
    }
    if (!isEditingSecond) {
        date.value.second = dateObject.getSeconds();
    }
    if (!isEditingTimeZone) {
        timeZone.value = appData.timeZone;
    }
    if (!isEditingTimeLapse) {
        timeLapse.value = appData.timeLapse;
    }
    timeSync.value = appData.timeSync;
    isNight.value = appData.solarData.solarHeight < 0;

    let daysOfMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const year = dateObject.getFullYear();
    if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) {
        daysOfMonth[2] = 29;
    }
    date.value.daysOfMonth = daysOfMonth[date.value.month];
};

onMounted(() => {
    draggableRef.value.setClassName('time-control', 'time_control');
    const unsubscriber = subscribeData(updateData);

    onUnmounted(() => {
        unsubscriber();
    });
});
</script>

<style scoped>
input {
    width: 60px;
    padding: 3px;
    margin: 3px;
    background-color: transparent;
    border: none;
    font-size: 16px;
    text-align: center;
}
</style>
