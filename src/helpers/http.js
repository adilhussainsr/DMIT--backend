'use strict';

const constants = require('./constants');
const code = constants.RESPONSE_STATUS_CODES;
const string = constants.STRING_VARS;
const utils = require('../utils');

exports.sendSuccess = (res, obj) => {
    let data = {status: code.STATUS200};
    data = Object.assign(data, obj);
    return res.status(code.STATUS200).send(data);
};

exports.sendError = (res, errMsg = '') => {
    errMsg = errMsg || string.SERVER_ERROR;
    return res.status(code.STATUS500).send({ status: code.STATUS500, msg: errMsg });
};

exports.sendCustomSuccess = (res, statusCode, msg, data = {}) => {
    let statusObj = { status: statusCode, msg };
    if (utils.isObject(data) == true) statusObj.data = data;
    return res.status(statusCode).send(statusObj);
};

exports.sendCustomError = (res, statusCode, errMsg = '', data = {}) => {
    return res.status(statusCode).send({ status: statusCode, msg: errMsg.toString(), data });
};
exports.sendCustomErrorValid = (res, statusCode, errMsg = '', data = {}) => {
    return res.status(statusCode).send({ status: statusCode, msg: errMsg, data});
};