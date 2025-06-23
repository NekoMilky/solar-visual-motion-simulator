<template>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { safeLocalStorage } from '../SafeLocalStorage.js';

const isButtonShow = ref(false);
const isDraggable = ref(false);
const startX = ref(0);
const startY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const currentLeft = ref(0);
const currentTop = ref(0);

const className = ref('');
const pathName = ref('');

const setButtonShow = (val) => {
    isButtonShow.value = val;
}

const setClassName = (cName, pName) => {
    className.value = cName;
    pathName.value = pName;

    isDraggable.value = safeLocalStorage.get(pathName.value) ?? false;
    currentLeft.value = safeLocalStorage.get(`${pathName.value}_left`) ?? 0;
    currentTop.value = safeLocalStorage.get(`${pathName.value}_top`) ?? 0;

    const element = document.querySelector(`.${className.value}`);
    if (element) {
        element.style.left = `${currentLeft.value}px`;
        element.style.top = `${currentTop.value}px`;
    }
};

const toggleDraggable = () => {
    isDraggable.value = !isDraggable.value;
    safeLocalStorage.set(pathName.value, isDraggable.value);
    if (!isDraggable.value) {
        stopDrag();
    }
};

const startDrag = (e) => {
    if (isDraggable.value) {
        startX.value = e.clientX ?? e.touches[0].clientX;
        startY.value = e.clientY ?? e.touches[0].clientY;
        const element = document.querySelector(`.${className.value}`);
        offsetX.value = parseFloat(getComputedStyle(element).left) || 0;
        offsetY.value = parseFloat(getComputedStyle(element).top) || 0;

        e.preventDefault();
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('touchmove', handleDrag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }
};

const handleDrag = (e) => {
    const dx = e.clientX ?? e.touches[0].clientX - startX.value;
    const dy = e.clientY ?? e.touches[0].clientY - startY.value;
    const element = document.querySelector(`.${className.value}`);
    if (element) {
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 60; // 导航栏高度

        currentLeft.value = offsetX.value + dx;
        currentTop.value = offsetY.value + dy;

        if (currentLeft.value < 0) {
            currentLeft.value = 0;
        } else if (currentLeft.value > screenWidth - elementWidth) {
            currentLeft.value = screenWidth - elementWidth;
        }

        if (currentTop.value < 0) {
            currentTop.value = 0;
        } else if (currentTop.value > screenHeight - elementHeight) {
            currentTop.value = screenHeight - elementHeight;
        }

        element.style.left = `${currentLeft.value}px`;
        element.style.top = `${currentTop.value}px`;

        e.preventDefault();
    }
};

const stopDrag = () => {
    safeLocalStorage.set(`${pathName.value}_left`, currentLeft.value);
    safeLocalStorage.set(`${pathName.value}_top`, currentTop.value);
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
};

onBeforeUnmount(() => {
    stopDrag();
});

defineExpose({
    isButtonShow,
    isDraggable,
    setButtonShow,
    setClassName,
    toggleDraggable,
    startDrag
});
</script>

<stype scoped>
</stype>
