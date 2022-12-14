'use strict';

const carTypeService = require('../services/carType');
const httpHelper = require('../helpers/http');
const constants = require('../helpers/constants');
const code = constants.RESPONSE_STATUS_CODES;
const responseMsg = constants.RESPONSE_MSG;

exports.listCarTypes = async(req, res) => {
    try {
        const types = await carTypeService.getCarTypeList();
        return httpHelper.sendSuccess(res, { types });
    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.addCarType = async(req, res) => {
    try {
        const reqBody = req.body;
        const carType = await carTypeService.addCarType(reqBody);
        return httpHelper.sendSuccess(res, carType);

    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.editCarType = async(req, res) => {
    try {
        const carTypeId = req.body.id;
        const reqBody = {...req.body};
        delete reqBody['id'];
        const carType = await carTypeService.editCarType(carTypeId, reqBody);
        if(carType) {
            return httpHelper.sendSuccess(res, { msg: responseMsg.UPDATE_SUCCESSFUL });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.UPDATE_ERROR);
        }
    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.deleteCarType = async(req, res) => {
    try {
        const carTypeId = req.params.id;
        const status = await carTypeService.deleteCarType(carTypeId);
        if(status === 1) {
            return httpHelper.sendSuccess(res, { msg: responseMsg.DELETE_SUCCESSFUL });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.DELETE_ERROR);
        }
    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.carTypeDetail =async(req, res) => {
    try {
        const carTypeId = req.params.id;
        const carType = await carTypeService.detailCarType(carTypeId);
        if(carType) {
            return httpHelper.sendSuccess(res, { carType });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.GETCARTYPE_ERROR);
        }
    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};