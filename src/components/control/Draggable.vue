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
        e.preventDefault();

        let clientX, clientY;
        if (e.type === 'touchstart') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        startX.value = clientX;
        startY.value = clientY;
        offsetX.value = currentLeft.value;
        offsetY.value = currentTop.value;
        
        if (e.type === 'touchstart') {
            document.addEventListener('touchmove', handleDrag);
            document.addEventListener('touchend', stopDrag, { once: true });
        } else {
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag, { once: true });
        }
    }
};

const handleDrag = (e) => {
    e.preventDefault();

    let clientX, clientY;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const dx = clientX - startX.value;
    const dy = clientY - startY.value;

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
    }
};

const stopDrag = () => {
    safeLocalStorage.set(`${pathName.value}_left`, currentLeft.value);
    safeLocalStorage.set(`${pathName.value}_top`, currentTop.value);

    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
};

const handleTouch = (e) => {
    setButtonShow(true);
    // 点击按钮
    const target = e.target;
    if (target.classList.contains('drag-button')) {
        return;
    }
    startDrag(e);
    // 3秒后自动隐藏
    setTimeout(() => {
        setButtonShow(false);
    }, 3000); 
}

onBeforeUnmount(() => {
    stopDrag();
});

defineExpose({
    isButtonShow,
    isDraggable,
    setButtonShow,
    setClassName,
    toggleDraggable,
    startDrag,
    handleTouch
});
</script>

<stype scoped>
</stype>
