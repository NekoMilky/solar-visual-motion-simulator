<template>
    <button
        class="nav-bar-button"
        :class="[
            {
                'nav-bar-button-day': isActive && !isNight,
                'nav-bar-button-night': isActive && isNight
            },
            customClass
        ]"
        @click="handleClick"
    ></button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    isActive: {
        type: Boolean,
        default: false
    },
    isNight: {
        type: Boolean,
        default: false
    },
    customClass: {
        type: String,
        default: ''
    }
});

const emits = defineEmits(['click']);

const handleClick = () => {
    emits('click');
};
</script>

<style scoped>
.nav-bar-button {
  width: clamp(10px, 4vw, 40px);
  height: clamp(10px, 4vw, 40px);
  border-radius: clamp(2px, 1vw, 10px);
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
</style>
