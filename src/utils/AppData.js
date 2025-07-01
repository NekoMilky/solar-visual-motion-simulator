import { safeLocalStorage } from './SafeLocalStorage.js';
import { calculateSolarData } from './SolarCalculator.js';

// 数据
const dataSubscribers = new Set();
const fps = 25;

let timeLapse = 1;
let timeSync = true;
let timeZone = safeLocalStorage.get('time_zone') ?? 8;
let longitude = safeLocalStorage.get('longitude') ?? 116.4;
let latitude = safeLocalStorage.get('latitude') ?? 39.9;
let utcDate = new Date(1970, 1, 0, 0, 0, 0);

const notifyDataSubscribers = () => {
    dataSubscribers.forEach(callback => callback(getData()));
};

const subscribeData = (callback) => {
    dataSubscribers.add(callback);
    callback(getData())
    return () => dataSubscribers.delete(callback);
};

const setTimeZone = (val) => {
    if (Math.abs(val) <= 12) {
        timeZone = val;
        safeLocalStorage.set('time_zone', timeZone);
        notifyDataSubscribers();
    }
}

const setTimeLapse = (val) => {
    if (Math.abs(val) <= 9) {
        timeSync = false;
        timeLapse = val;
        notifyDataSubscribers();
    }
}

const setTimeSync = (val) => {
    if (val) {
        timeSync = true;
        timeLapse = 1;
    } else {
        timeSync = false;
    }
    notifyDataSubscribers();
}

const setLocation = (lng, lat) => {
    if (Math.abs(lng) <= 180 && Math.abs(lat) <= 90) {
        longitude = lng;
        latitude = lat;
        safeLocalStorage.set('longitude', longitude);
        safeLocalStorage.set('latitude', latitude);
        notifyDataSubscribers();
    }
}

const setDate = (val) => {
    if (val instanceof Date && val.getFullYear() >= 1970 && val.getFullYear() <= 9999) {
        setTimeSync(false);
        utcDate = new Date(val.getTime() - timeZone * 3600000);
        notifyDataSubscribers();
    }
}

let counter = 0;
const checkTime = (immediate) => {
    if (timeLapse == 0) {
        return;
    }
    counter++;
    if (counter >= fps || immediate) {
        counter = 0;
        if (timeSync) {
            const tempDate = new Date();
            utcDate = new Date(tempDate.getTime() + tempDate.getTimezoneOffset() * 60000);
            notifyDataSubscribers();
        } else if (Math.abs(timeLapse) == 1) {
            utcDate = new Date(utcDate.getTime() + timeLapse * 1000);
            notifyDataSubscribers();
        }
    }
    if (Math.abs(timeLapse) > 1) {
        utcDate = new Date(utcDate.getTime() + timeLapse * 10000 * Math.pow(4, Math.abs(timeLapse) - 2));
        notifyDataSubscribers();
    }
}
checkTime(true);
setInterval(checkTime, 1000 / fps);

const getData = () => {
    return {
        timeLapse: timeLapse,
        timeSync: timeSync,
        timeZone: timeZone,
        longitude: longitude,
        latitude: latitude,
        date: new Date(utcDate.getTime() + timeZone * 3600000),
        fps: fps,
        solarData: calculateSolarData(new Date(utcDate.getTime() + timeZone * 3600000), longitude, latitude, timeZone)
    }
}

export {
    setTimeLapse,
    setTimeSync,
    setTimeZone,
    setLocation,
    setDate,
    subscribeData
};
