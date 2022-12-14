'use strict';

const parkingService = require('../services/parking');
const httpHelper = require('../helpers/http');
const constants = require('../helpers/constants');
const code = constants.RESPONSE_STATUS_CODES;
const responseMsg = constants.RESPONSE_MSG;

exports.addLot = async (req, res) => {
    try {
        await parkingService.addLot(req);
        httpHelper.sendSuccess(res, { msg: responseMsg.PARKING_LOT_CREATED });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.modifyPrivacyPolicy = async (req, res) => {
    try {
        let retMsg = await parkingService.modifyPrivacyPolicy(req.body.policy);
        httpHelper.sendSuccess(res, { msg: retMsg });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.getPrivacyPolicy = async (req, res) => {
    try {
        let policy = await parkingService.getPrivacyPolicy();
        if (policy) {
            return httpHelper.sendSuccess(res, { policy });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.generateParkings = async (req, res) => {
    try {
        await parkingService.generateParkings();
        return httpHelper.sendSuccess(res, { msg: 'Parking slots generated.' });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.parkingSlotsChange = async (req, res) => {
    try {
        let p = await parkingService.getChangeParkingSlots();
        return httpHelper.sendSuccess(res, { msg: 'Parking slots generated.' });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.getParkingStatus = async (req, res) => {
    try {
        const parking = await parkingService.getParkingStatus();
        if (parking) {
            return httpHelper.sendSuccess(res, { parking });
        }
        return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);

    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.getBooking = async (req, res) => {
    try {
        const booking = await parkingService.getBookingByParking(req.params.id);
        if (booking) {
            return httpHelper.sendSuccess(res, { booking });
        }
        return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);

    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};