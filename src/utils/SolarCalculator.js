// 计算儒略日
const getJulianDay = (date, timeZone) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;

    let jdn = day + 365 * y - 32045 +
              Math.floor((153 * m + 2) / 5) + 
              Math.floor(y / 4) - 
              Math.floor(y / 100) + 
              Math.floor(y / 400);
    let jd = jdn + 
             (hour - 12 - timeZone) / 24 + 
             minute / 1440 + 
             second / 86400;

    return jd;
};

// 计算格林尼治恒星时
const getGAST = (julianDay) => {
    const T = (julianDay - 2451545.0) / 36525;
    
    let GAST = 280.46061837 + 
               360.98564736629 * (julianDay - 2451545.0) +
               (0.000387933 * T * T) - 
               (T * T * T / 38710000);
    GAST %= 360;
    if (GAST < 0) {
        GAST += 360;
    }
    
    return GAST;
};

// 计算黄赤交角
const getObliquityOfEcliptic = (julianDay) => {
    const T = (julianDay - 2451545.0) / 36525;
    const epsilon0 = 23 + (26 / 60) + (21.448 / 3600) - 
                     (46.8150 / 3600) * T - 
                     (0.00059 / 3600) * T * T + 
                     (0.001813 / 3600) * T * T * T;
    const deltaEpsilon = - (0.00256 / 3600) * Math.cos((125 + (2 / 60) - 1934.136 * T) * (Math.PI / 180));
    const epsilon = epsilon0 + deltaEpsilon;

    return epsilon;
};

// 计算太阳赤经、赤纬
const getSolarEquatorialPosition = (julianDay, obliquityOfEcliptic) => {
    const T = (julianDay - 2451545.0) / 36525;
    const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const M_rad = M * Math.PI / 180;
    
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad) +
              0.000289 * Math.sin(3 * M_rad);
    
    const lambda = L0 + C;
    const lambda_rad = lambda * Math.PI / 180;
    
    const epsilon_rad = obliquityOfEcliptic * Math.PI / 180;
    
    // 赤纬
    const delta = Math.asin(Math.sin(epsilon_rad) * Math.sin(lambda_rad));
    // 赤经
    const alpha = Math.atan2(
        Math.sin(lambda_rad) * Math.cos(epsilon_rad),
        Math.cos(lambda_rad)
    );
    
    const delta_deg = delta * 180 / Math.PI;
    let alpha_deg = alpha * 180 / Math.PI;
    alpha_deg %= 360;
    if (alpha_deg < 0) {
        alpha_deg += 360;
    }
    const EoT = (L0 - alpha_deg) / 15;
    
    return {
        declination: delta_deg,
        ascension: alpha_deg,
        equationOfTime: EoT
    };
};

// 计算太阳直射点经度、纬度
const getSolarPosition = (gast, declination, ascension) => {
    let longitude = ascension - gast;
    longitude %= 360;
    if (longitude > 180) {
        longitude -= 360;
    } else if (longitude < -180) {
        longitude += 360;
    }
    
    return {
        longitude: longitude,
        latitude: declination
    };
};

// 计算太阳时角
const getSolarHourAngle = (longitude, solarLongitude) => {
    let angle = longitude - solarLongitude;
    angle %= 360;
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
const getSolarDirection = (latitude, declination, hourAngle) => {
    const phi = latitude * Math.PI / 180;
    const delta = declination * Math.PI / 180;
    const t = hourAngle * Math.PI / 180;

    const y = Math.sin(t);
    const x = Math.cos(t) * Math.sin(phi) - Math.tan(delta) * Math.cos(phi);
    let direction = Math.atan2(y, x) + Math.PI;

    let direction_deg = direction * 180 / Math.PI;
    direction_deg %= 360;
    if (direction_deg < 0) {
        direction_deg += 360;
    }

    return direction_deg;
}

// 计算特定高度角的起止、历时
const getSolarDuration = (h0, EoT, longitude, latitude, declination, timeZone) => {
    const phi = latitude * Math.PI / 180;
    const delta = declination * Math.PI / 180;
    const offset = timeZone - longitude / 15 - EoT;

    let highest = (12 + offset) % 24;
    if (highest < 0) {
        highest += 24;
    }
    let lowest = offset % 24;
    if (lowest < 0) {
        lowest += 24;
    }

    const cosH0 = (Math.sin(h0) - Math.sin(phi) * Math.sin(delta)) / 
                  (Math.cos(phi) * Math.cos(delta));
    
    let neverSet = false, neverRise = false;
    if (cosH0 >= 1) {
        neverRise = true;
    } else if (cosH0 <= -1) {
        neverSet = true;
    }
    
    let duration = null, rise = null, set = null;
    if (neverSet) {
        duration = 24;
    } else if (neverRise) {
        duration = 0;
    } else {
        const halfDuration = Math.acos(cosH0) * 12 / Math.PI;
        duration = halfDuration * 2;

        rise = highest - halfDuration;
        rise %= 24;
        if (rise < 0) {
            rise += 24;
        }
        set = highest + halfDuration;
        set %= 24;
        if (set < 0) {
            set += 24;
        }
    }
    
    return {
        neverSet,
        neverRise,
        highest,
        lowest,
        duration,
        rise,
        set
    };
}

// 计算特定时刻与时长
const getSolarTime = (EoT, longitude, latitude, declination, timeZone) => {
    // 昼长、日出、日落、日中
    const day = getSolarDuration(-0.833 * Math.PI / 180, EoT, longitude, latitude, declination, timeZone);
    const isPolarDay = day.neverSet;
    const isPolarNight = day.neverRise;
    const noon = day.highest;
    const dayDuration = day.duration;
    const sunRise = day.rise;
    const sunSet = day.set;

    // 民用曙暮光
    const civilTwilight = getSolarDuration(-6 * Math.PI / 180, EoT, longitude, latitude, declination, timeZone);
    const isCivilTwilight = !civilTwilight.neverRise && !civilTwilight.neverSet;
    const civilTwilightStart = civilTwilight.rise;
    const civilTwilightEnd = civilTwilight.set;

    // 航海曙暮光
    const nauticalTwilight = getSolarDuration(-12 * Math.PI / 180, EoT, longitude, latitude, declination, timeZone);
    const isNauticalTwilight = !nauticalTwilight.neverRise && !nauticalTwilight.neverSet;
    const nauticalTwilightStart = nauticalTwilight.rise;
    const nauticalTwilightEnd = nauticalTwilight.set;

    // 天文曙暮光
    const astronomicalTwilight = getSolarDuration(-18 * Math.PI / 180, EoT, longitude, latitude, declination, timeZone);
    const isAstronomicalTwilight = !astronomicalTwilight.neverRise && !astronomicalTwilight.neverSet;
    const astronomicalTwilightStart = astronomicalTwilight.rise;
    const astronomicalTwilightEnd = astronomicalTwilight.set;

    return {
        isPolarDay: isPolarDay,
        isPolarNight: isPolarNight,
        noon: noon,
        dayDuration: dayDuration,
        sunRise: sunRise,
        sunSet: sunSet,

        isCivilTwilight: isCivilTwilight,
        civilTwilightStart: civilTwilightStart,
        civilTwilightEnd: civilTwilightEnd,

        isNauticalTwilight: isNauticalTwilight,
        nauticalTwilightStart: nauticalTwilightStart,
        nauticalTwilightEnd: nauticalTwilightEnd,

        isAstronomicalTwilight: isAstronomicalTwilight,
        astronomicalTwilightStart: astronomicalTwilightStart,
        astronomicalTwilightEnd: astronomicalTwilightEnd
    }
}

// 返回数据
const calculateSolarData = (date = new Date(), longitude, latitude, timeZone, override = {}) => {
    const julianDay = getJulianDay(date, timeZone);
    const gast = getGAST(julianDay);

    const obliquityOfEcliptic = override.obliquityOfEcliptic ?? getObliquityOfEcliptic(julianDay);
    const solarEquatorialPosition = getSolarEquatorialPosition(julianDay, obliquityOfEcliptic);
    const solarPosition = getSolarPosition(gast, solarEquatorialPosition.declination, solarEquatorialPosition.ascension);

    const hourAngle = getSolarHourAngle(longitude, solarPosition.longitude);
    const height = getSolarHeight(latitude, solarPosition.latitude, hourAngle);
    const direction = getSolarDirection(latitude, solarPosition.latitude, hourAngle);
    const time = getSolarTime(solarEquatorialPosition.equationOfTime, longitude, latitude, solarPosition.latitude, timeZone);

    return {
        obliquityOfEcliptic: obliquityOfEcliptic,
        solarPosition: solarPosition,
        solarHourAngle: hourAngle,
        solarHeight: height, 
        solarDirection: direction,
        solarTime: time
    };
};

export {
    calculateSolarData
}