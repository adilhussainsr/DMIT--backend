'use strict';

const db = require('../../models');
const carTypeModel = db.carType;

exports.getCarTypeList = async() => {
    const carType = await carTypeModel.findAll();
    if(carType && carType.length) {
        return carType;
    }
    return [];
};

exports.addCarType = async(reqBody) => {
    const carType = await carTypeModel.create(reqBody);
    return { carType: carType.dataValues };
};

exports.editCarType = async(id, reqBody) => {
    const condition = {
        where: {
            id
        }
    };
    const carType = await carTypeModel.update(reqBody, condition);
    if(carType && carType.length == 1) {
        return true;
    }
    return false;
};

exports.deleteCarType = async(id) => {
    const condition = {
        where: {
            id
        }
    };
    const ret = await carTypeModel.destroy(condition);
    return ret;
};

exports.detailCarType = async(id) => {
    const ret = await carTypeModel.findByPk(id);
    if(ret) {
        return ret;
    }
    return null;
};