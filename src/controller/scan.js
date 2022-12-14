'use strict';

const parkingService = require('../services/parking');
const scanService = require('../services/scan');

const httpHelper = require('../helpers/http');
const constants = require('../helpers/constants');
const code = constants.RESPONSE_STATUS_CODES;
const responseMsg = constants.RESPONSE_MSG;

exports.addScan = async (req, res) => { 
    const email = req.body.email.value;
    
    const bodyReq = {
      email: req?.body?.email?.value,
      fullname: req?.body?.name?.value,
      phone: req?.body?.phone?.value,
      pincode: req?.body?.pincode?.value,
      city: req?.body?.city?.value,
      state: req?.body?.state?.value,
      address: req?.body?.address?.value,
      user_id:1,

    };
   
    try {
        await scanService.addScan(bodyReq);
        httpHelper.sendSuccess(res, { msg: "Scan created!" });
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