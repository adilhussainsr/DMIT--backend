'use strict';

const vendorService = require('../services/vendor');
const httpHelper = require('../helpers/http');
const constants = require('../helpers/constants');
const code = constants.RESPONSE_STATUS_CODES;
const responseMsg = constants.RESPONSE_MSG;

exports.listVendors = async(req, res) => {
    try {
        const vendors = await vendorService.getVedorsList();
        return httpHelper.sendSuccess(res, { vendors });
    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.addVendor = async(req, res) => {
    try {
        /**
         **
         req.body = {
        **    name: 'Vendor Name',
        **    initials: 'VN',
        **    onsie_charge_applicable: true
        **};
        */
        const reqBody = req.body;
       const vendor = await vendorService.addVendor(reqBody);
       return httpHelper.sendSuccess(res, vendor);

    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.editVendor = async(req, res) => {
    try {
        /**
         **
         req.body = {
        **    id: 1,
        **    name: 'Vendor Name',
        **    initials: 'VN',
        **    onsie_charge_applicable: true
        **};
        */
        const vendorId = req.body.id;
        const reqBody = {...req.body};
        delete reqBody['id'];
        const vendor = await vendorService.editVendor(vendorId, reqBody);
        if(vendor) {
            return httpHelper.sendSuccess(res, { msg: responseMsg.UPDATE_SUCCESSFUL });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.UPDATE_ERROR);
        }
    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.deleteVendor = async(req, res) => {
    try {
        const vendorId = req.params.id;
        const status = await vendorService.deleteVendor(vendorId);
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

exports.vendorDetail = async(req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await vendorService.detailVendor(vendorId);
        if(vendor) {
            return httpHelper.sendSuccess(res, { vendor });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.GETVENDOR_ERROR);
        }
    } catch(err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};