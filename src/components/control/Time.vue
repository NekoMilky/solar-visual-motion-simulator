<template>
    <Draggable ref="draggableRef" :isNight="isNight" customClass="time-control">
        <div>时间设置:</div>
        <div>
            日期:
            <InputField 
                v-model="date.year" 
                :min="1970" 
                :max="9999" 
                :isNight="isNight" 
                @input="updateDate"
                ref="yearInput"
            />
            -
            <InputField 
                v-model="date.month" 
                :min="1" 
                :max="12" 
                :isNight="isNight" 
                @input="updateDate"
                ref="monthInput"
            />
            -
            <InputField 
                v-model="date.date" 
                :min="1" 
                :max="date.daysOfMonth" 
                :isNight="isNight" 
                @input="updateDate"
                ref="dateInput"
            />
        </div>
        <div>
            时刻:
            <InputField 
                v-model="date.hour" 
                :min="0" 
                :max="23" 
                :isNight="isNight" 
                @input="updateDate"
                ref="hourInput"
            />
            :
            <InputField 
                v-model="date.minute" 
                :min="0" 
                :max="59" 
                :isNight="isNight" 
                @input="updateDate"
                ref="minuteInput"
            />
            :
            <InputField 
                v-model="date.second" 
                :min="0" 
                :max="59" 
                :isNight="isNight" 
                @input="updateDate"
                ref="secondInput"
            />
        </div>
        <div>
            使用时区(UTC):
            <InputField 
                v-model="timeZone" 
                :min="-12" 
                :max="12" 
                :step="0.5" 
                :isNight="isNight" 
                @input="updateTimeZone"
                ref="timeZoneInput"
            />
        </div>
        <div>
            时间流逝倍率: 
            <InputField 
                v-model="timeLapse" 
                :min="-9" 
                :max="9" 
                :isNight="isNight" 
                @input="updateTimeLapse"
                ref="timeLapseInput"
            />
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
    </Draggable>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { subscribeData, setDate, setTimeLapse, setTimeSync, setTimeZone } from '../AppData.js';
import Draggable from './Draggable.vue';
import InputField from './InputField.vue';

const draggableRef = ref(null);
const yearInput = ref(null);
const monthInput = ref(null);
const dateInput = ref(null);
const hourInput = ref(null);
const minuteInput = ref(null);
const secondInput = ref(null);
const timeZoneInput = ref(null);
const timeLapseInput = ref(null);

const date = ref({})
const timeZone = ref(0);
const timeSync = ref(true);
const timeLapse = ref(0);
const isNight = ref(false);

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
    const isEditingYear = yearInput.value?.$el === activeElement;
    const isEditingMonth = monthInput.value?.$el === activeElement;
    const isEditingDate = dateInput.value?.$el === activeElement;
    const isEditingHour = hourInput.value?.$el === activeElement;
    const isEditingMinute = minuteInput.value?.$el === activeElement;
    const isEditingSecond = secondInput.value?.$el === activeElement;
    const isEditingTimeZone = timeZoneInput.value?.$el === activeElement;
    const isEditingTimeLapse = timeLapseInput.value?.$el === activeElement;

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
}
</style>
