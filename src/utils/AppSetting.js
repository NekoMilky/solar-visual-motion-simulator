import { safeLocalStorage } from './SafeLocalStorage.js';

// 设置选项
const settingSubscribers = new Set();

let isSceneToggle = safeLocalStorage.get('is_scene_toggle') ?? [true, false];
let isInformationDisplayToggle = safeLocalStorage.get('is_information_display_toggle') ?? false;
let isLocationControlToggle = safeLocalStorage.get('is_location_control_toggle') ?? false;
let isTimeControlToggle = safeLocalStorage.get('is_time_control_toggle') ?? false;
let isSunTrajectoryToggle = safeLocalStorage.get('is_sun_trajectory_toggle') ?? true;
let isPoleStarPointerToggle = safeLocalStorage.get('is_pole_star_pointer_toggle') ?? true;
let isGridToggle = safeLocalStorage.get('is_grid_toggle') ?? false;
let isPinToggle = safeLocalStorage.get('is_pin_toggle') ?? true;
let isSunRayPointerToggle = safeLocalStorage.get('is_sun_ray_pointer_toggle') ?? false;

const notifySettingSubscribers = () => {
    settingSubscribers.forEach(callback => callback(getSetting()));
};

const subscribeSetting = (callback) => {
    settingSubscribers.add(callback);
    callback(getSetting())
    return () => settingSubscribers.delete(callback);
};

const toggleScenes = (index) => {
    if (index >= 0 && index < isSceneToggle.length) {
        isSceneToggle[index] = !isSceneToggle[index];
        safeLocalStorage.set('is_scene_toggle', isSceneToggle);
        notifySettingSubscribers();
    }
}

const toggleInformationDisplay = () => {
    isInformationDisplayToggle = !isInformationDisplayToggle;
    safeLocalStorage.set('is_information_display_toggle', isInformationDisplayToggle);
    notifySettingSubscribers();
}

const toggleLocationControl = () => {
    isLocationControlToggle = !isLocationControlToggle;
    safeLocalStorage.set('is_location_control_toggle', isLocationControlToggle);
    notifySettingSubscribers();
}

const toggleTimeControl = () => {
    isTimeControlToggle = !isTimeControlToggle;
    safeLocalStorage.set('is_time_control_toggle', isTimeControlToggle);
    notifySettingSubscribers();
}

const toggleSunTrajectory = () => {
    isSunTrajectoryToggle = !isSunTrajectoryToggle;
    safeLocalStorage.set('is_sun_trajectory_toggle', isSunTrajectoryToggle);
    notifySettingSubscribers();
}

const togglePoleStarPointer = () => {
    isPoleStarPointerToggle = !isPoleStarPointerToggle;
    safeLocalStorage.set('is_pole_star_pointer_toggle', isPoleStarPointerToggle);
    notifySettingSubscribers();
}

const toggleGrid = () => {
    isGridToggle = !isGridToggle;
    safeLocalStorage.set('is_grid_toggle', isGridToggle);
    notifySettingSubscribers();
}

const togglePin = () => {
    isPinToggle = !isPinToggle;
    safeLocalStorage.set('is_pin_toggle', isPinToggle);
    notifySettingSubscribers();
}

const toggleSunRayPointer = () => {
    isSunRayPointerToggle = !isSunRayPointerToggle;
    safeLocalStorage.set('is_sun_ray_pointer_toggle', isSunRayPointerToggle);
    notifySettingSubscribers();
}

const getSetting = () => {
    return {
        isSceneToggle: isSceneToggle,
        isInformationDisplayToggle: isInformationDisplayToggle,
        isLocationControlToggle: isLocationControlToggle,
        isTimeControlToggle: isTimeControlToggle,
        isSunTrajectoryToggle: isSunTrajectoryToggle,
        isPoleStarPointerToggle: isPoleStarPointerToggle,
        isGridToggle: isGridToggle,
        isPinToggle: isPinToggle,
        isSunRayPointerToggle: isSunRayPointerToggle
    }
}

export {
    toggleScenes,
    toggleInformationDisplay,
    toggleLocationControl,
    toggleTimeControl,
    toggleSunTrajectory,
    togglePoleStarPointer,
    toggleGrid,
    togglePin,
    toggleSunRayPointer,
    subscribeSetting
};
