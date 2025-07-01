const STORAGE_PREFIX = 'SOLAR_VISUAL_MOTION_SIMULATOR_';

const safeLocalStorage = {
    set(key, value) {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    },
    get(key) {
        const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        return value !== null ? JSON.parse(value) : null;
    }
};

export {
    safeLocalStorage
};
