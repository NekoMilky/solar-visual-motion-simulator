import { safeLocalStorage } from './SafeLocalStorage.js';

// 设置选项
const settingSubscribers = new Set();

let isGroundSceneToggle = safeLocalStorage.get('is_ground_scene_toggle') ?? true;
let isEarthSceneToggle = safeLocalStorage.get('is_earth_scene_toggle') ?? false;
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

const toggleGroundScene = () => {
    isGroundSceneToggle = !isGroundSceneToggle;
    safeLocalStorage.set('is_ground_scene_toggle', isGroundSceneToggle);
    notifySettingSubscribers();
}

const toggleEarthScene = () => {
    isEarthSceneToggle = !isEarthSceneToggle;
    safeLocalStorage.set('is_earth_scene_toggle', isEarthSceneToggle);
    notifySettingSubscribers();
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
        isGroundSceneToggle: isGroundSceneToggle,
        isEarthSceneToggle: isEarthSceneToggle,
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
    toggleGroundScene,
    toggleEarthScene,
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
