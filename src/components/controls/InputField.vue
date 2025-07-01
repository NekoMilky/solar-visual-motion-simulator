<template>
    <input
        :type="type"
        :value="modelValue"
        @input="onInput"
        :min="min"
        :max="max"
        :step="step"
        :class="{
            'input-day': !isNight,
            'input-night': isNight
        }"
    />
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    modelValue: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: 'number'
    },
    min: {
        type: [Number, String],
        default: 0
    },
    max: {
        type: [Number, String],
        default: null
    },
    step: {
        type: [Number, String],
        default: 1
    },
    isNight: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(['update:modelValue']);

const onInput = (e) => {
    emits('update:modelValue', parseFloat(e.target.value));
};
</script>

<style scoped>
input {
    width: 50px;
    padding: 3px;
    margin: 3px;
    background-color: transparent;
    border: none;
    font-size: 16px;
    text-align: center;
    transition: color 0.3s;
}

.input-day {
    color: rgb(0, 0, 0);
}

.input-night {
    color: rgb(255, 255, 255);
}
</style>
