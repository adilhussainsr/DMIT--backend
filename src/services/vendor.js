'use strict';

const db = require('../../models');
const vendorModel = db.vendor;

exports.getVedorsList = async() => {
    const vendors = await vendorModel.findAll();
    if(vendors && vendors.length) {
        return vendors;
    }
    return [];
};

exports.addVendor = async(reqBody) => {
    const vendor = await vendorModel.create(reqBody);
    return { vendor: vendor.dataValues };
};

exports.editVendor = async(id, reqBody) => {
    const condition = {
        where: {
            id
        }
    };
    const vendor = await vendorModel.update(reqBody, condition);
    if(vendor && vendor.length == 1) {
        return true;
    }
    return false;
};

exports.deleteVendor = async(id) => {
    const condition = {
        where: {
            id
        }
    };
    const ret = await vendorModel.destroy(condition);
    return ret;
};

exports.detailVendor = async(id) => {
    const ret = await vendorModel.findByPk(id);
    if(ret) {
        return ret;
    }
    return null;
};