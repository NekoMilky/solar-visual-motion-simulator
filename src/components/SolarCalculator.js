// 计算黄赤交角
const getObliquityOfEcliptic = (date = new Date()) => {
    const year = date.getFullYear();
    const t = (year - 2000) / 100;
    
    const epsilon = 23.4393 - 0.013 * t;
    
    return epsilon;
};

// 计算太阳赤纬
const getSolarDeclination = (date = new Date(), timeZone) => {
    const year = date.getFullYear();

    const offset = timeZone * 3600000;
    const startOfTheYear = new Date(year, 0, 1, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const n = (date.getTime() - startOfTheYear.getTime() - offset) / msPerDay;

    const n0 = 79.6764 + 0.2422 * (year - 1985) - Math.floor((year - 1985) / 4);
    const t = n - n0;

    const theta = 2 * Math.PI * t / 365.2422;

    const delta = 0.3723 + 
                  23.2567 * Math.sin(theta) + 
                  0.1149 * Math.sin(2 * theta) - 
                  0.1712 * Math.sin(3 * theta) -
                  0.758 * Math.cos(theta) +
                  0.3656 * Math.cos(2 * theta) +
                  0.0201 * Math.cos(3 * theta);

    return delta;
};

// 计算太阳赤经
const getSolarRightAscension = (date = new Date(), timeZone) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const startOfDay = new Date(year, month, day, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const offset = msPerDay / 2 + startOfDay.getTime() - date.getTime();
    let angle = offset / 4 / 60000 + timeZone * 15;
    if (angle >= 180) {
        angle -= 360;
    } else if (angle < -180) {
        angle += 360;
    }

    return angle;
}

// 计算太阳时角
const getSolarHourAngle = (date = new Date(), longitude, timeZone) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const offset = (longitude - timeZone * 15) * 4 * 60000;
    const startOfDay = new Date(year, month, day, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    let angle = (date.getTime() - startOfDay.getTime() + offset) / msPerDay * 360 - 180;
    if (angle >= 180) {
        angle -= 360;
    } else if (angle < -180) {
        angle += 360;
    }

    return angle;
}

// 计算太阳高度角
const getSolarHeight = (latitude, declination, hourAngle) => {
    const phi = latitude * Math.PI / 180;
    const delta = declination * Math.PI / 180;
    const t = hourAngle * Math.PI / 180;

    const h = Math.asin(
        Math.sin(phi) * Math.sin(delta) +
        Math.cos(phi) * Math.cos(delta) * Math.cos(t)
    );

    return h * 180 / Math.PI;
}

// 计算太阳方位角
const getSolarDirection = (latitude, declination, hourAngle, height) => {
    const phi = latitude * Math.PI / 180;
    const delta = declination * Math.PI / 180;
    const t = hourAngle * Math.PI / 180;
    const theta = height * Math.PI / 180;

    let d = Math.acos(
        ( 
            Math.sin(delta) * Math.cos(phi) -
            Math.cos(t) * Math.cos(delta) * Math.sin(phi)
        ) /
        Math.cos(theta)
    );
    if (t > 0) {
        d = 2 * Math.PI - d;
    }

    return d * 180 / Math.PI;
}

// 计算昼长
const getDayLength = (longitude, latitude, declination, timeZone) => {
    const phi = latitude * Math.PI / 180;
    const delta = declination * Math.PI / 180;
    const offset = timeZone - longitude / 15;

    // 判断极昼夜
    let polarDay = false, polarNight = false;
    const noonHeight = getSolarHeight(latitude, declination, 0);
    const midnightHeight = getSolarHeight(latitude, declination, -180);
    if (midnightHeight >= 0) {
        polarDay = true;
    } else if (noonHeight < 0) {
        polarNight = true;
    }

    // 昼长
    let dayLength = 12, sunRise = 12, sunSet = 12;
    if (polarDay) {
        dayLength = 24;
    } else if (polarNight) {
        dayLength = 0;
    } else {
        const t = Math.acos(
            (- Math.sin(phi) * Math.sin(delta)) / 
            (Math.cos(phi) * Math.cos(delta))
        ) * 180 / Math.PI;
        const halfDayLength = t / 15;
        dayLength = halfDayLength * 2;

        // 日出日落时间
        sunRise = 12 - halfDayLength + offset;
        if (sunRise >= 24) {
            sunRise -= 24;
        } else if (sunRise < 0) {
            sunRise += 24;
        }
        sunSet = 12 + halfDayLength + offset;
        if (sunSet >= 24) {
            sunSet -= 24;
        } else if (sunSet < 0) {
            sunSet += 24;
        }
    }

    return {
        polarDay: polarDay,
        polarNight: polarNight,
        dayLength: dayLength,
        sunRise: sunRise,
        sunSet: sunSet
    }
}

// 返回数据
const calculateSolarData = (longitude, latitude, date = new Date(), timeZone) => {
    const obliquityOfEcliptic = getObliquityOfEcliptic(date);
    const declination = getSolarDeclination(date, timeZone);
    const rightAscension = getSolarRightAscension(date, timeZone);
    const hourAngle = getSolarHourAngle(date, longitude, timeZone);
    const height = getSolarHeight(latitude, declination, hourAngle);
    const direction = getSolarDirection(latitude, declination, hourAngle, height);
    const dayLength = getDayLength(longitude, latitude, declination, timeZone);

    return {
        obliquityOfEcliptic: obliquityOfEcliptic,
        solarDeclination: declination,
        solarRightAscension: rightAscension,
        solarHourAngle: hourAngle,
        solarHeight: height, 
        solarDirection: direction,
        dayLength: dayLength
    };
};

export {
    calculateSolarData
}
