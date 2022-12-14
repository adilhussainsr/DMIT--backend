'use strict';

exports.isObject = (obj) => {
    return obj && Object.keys(obj).length > 0 && obj instanceof Object;
};

exports.isArray = (arr) => {
    return arr && arr.length > 0 && arr instanceof Array;
};

exports.removeEmptyKeys = async(obj) => {
    Object.keys(obj).forEach((k) => (!obj[k] && obj[k] !== undefined) && delete obj[k]);
    return obj;
};

exports.calculateDays = (startTime, endTime) => {
    if(!startTime) {
        startTime = new Date();
    } else {
        startTime = new Date(startTime);
    }

    if(!endTime || endTime < startTime) {
        return null;
    }
    endTime = new Date(endTime);

    startTime.setHours(0);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    endTime.setHours(0);
    endTime.setMinutes(0);
    endTime.setSeconds(0);

    let days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
    return days;
};