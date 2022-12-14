'use strict';

const db = require('../../models');
const parkingLotModel = db.parkingLot;
const privacyPolicyModel = db.privacyPolicy;
const carTypeModel = db.carType;
const parkingModel = db.parking;
const bookingModel = db.booking;
const constants = require('../helpers/constants');
const _ = require('underscore');
const Op = db.Sequelize.Op;
const responseMsg = constants.RESPONSE_MSG;

exports.addLot = async (req) => {
    let lotData = req.body;
    let carTypeIds = req.body.car_type_id;
    delete lotData['car_type_id'];
    let newLot = await parkingLotModel.create(lotData);

    for (var i = 0; i < carTypeIds.length; i++) {
        const carTypeData = await carTypeModel.findByPk(carTypeIds[i]);
        await newLot.addCarType(carTypeData);
    }
};

exports.findLot = async (carTypeId) => {
    let condition = {
        include: {
            model: carTypeModel,
            where: {
                id: carTypeId
            }
        }
    };
    let parkingLots = await parkingLotModel.findAll(condition);

    for (let lot of parkingLots) {
        let condition = {
            where: {
                status: 'vacant',
                parking_lot_id: lot.id
            }
        }
        let parking = await parkingModel.findOne(condition);
        if (parking && parking.id) {
            return parking;
        }
    }
};

exports.modifyPrivacyPolicy = async (policy) => {
    let policyObj = await privacyPolicyModel.findOne();
    if (policyObj) {
        await privacyPolicyModel.update({ policy }, { where: { id: policyObj.id } });
        return responseMsg.PRIVACY_POLICY_UPDATED;
    }
    await privacyPolicyModel.create({ policy });
    return responseMsg.PRIVACY_POLICY_CREATED;
};

exports.getPrivacyPolicy = async () => {
    let policy = await privacyPolicyModel.findOne();
    if (policy) {
        return policy.policy;
    }
    return null;
};

exports.generateParkings = async () => {
    const lots = await parkingLotModel.findAll();
    let row = 0;
    for (let lot of lots) {
        if (lot.data_entered) {
            continue;
        }
        if (lot.lot == 'M') {
            for (let m = 1; m <= 30; m++) {
                let slot = `M${m}S1`;
                await parkingModel.create({ slot, parking_lot_id: lot.id });
            }
        } else {
            for (let i = 0; i < lot.rows; i++) {
                row++;
                for (let j = 0; j < lot.sections; j++) {
                    let slot = `R${row}S${j + 1}`;
                    await parkingModel.create({ slot, parking_lot_id: lot.id });
                }
            }
        }
        await parkingLotModel.update({ data_entered: true }, { where: { id: lot.id } });
    }
};

exports.getParkingStatus = async () => {
    await this.updateParkingSlotsStatus();
    let retObj = {};
    let condition = {
        include: {
            all: true
        }
    }
    let parking = await parkingModel.findAll(condition);
    for (var p of parking) {
        let lot = p.parkingLot.lot;
        let subLot = p.parkingLot.sub_lot;
        if (!retObj.hasOwnProperty(lot)) {
            retObj[lot] = {};
        }
        if (!retObj[lot].hasOwnProperty(subLot)) {
            retObj[lot][subLot] = {};
        }
        let { id, slot, status, parking_lot_id, display_slot } = p;
        let regexp = /[A-Z](\d+)S(\d+)/mg;
        let match = regexp.exec(slot);
        if (!retObj[lot][subLot].hasOwnProperty(match[1])) {
            retObj[lot][subLot][match[1]] = [];
            for (var i = 0; i < p.parkingLot.sections; i++) {
                retObj[lot][subLot][match[1]].push({});
            }
        }
        retObj[lot][subLot][match[1]][match[2] - 1] = { id, slot, status, parking_lot_id, display_slot };
    }
    return retObj;
}

exports.updateParkingSlotsStatus = async () => {
    let notCheckedOut = await bookingModel.findAll({ where: { is_checked_out: false } });
    let overStay = _.filter(notCheckedOut, (o) => {
        return (new Date(o.pick_up_time).getTime() < new Date().getTime());
    });
    overStay = _.pluck(overStay, 'parking_id');
    notCheckedOut = _.reject(notCheckedOut, (n) => {
        return (new Date(n.pick_up_time).getTime() < new Date().getTime());
    });
    let leavingToday = _.filter(notCheckedOut, (l) => {
        return (new Date(l.pick_up_time).getDate() == new Date().getDate());
    });
    leavingToday = _.pluck(leavingToday, 'parking_id');

    let condition = {
        where: {
            id: {
                [Op.in]: overStay
            }
        }
    };
    await parkingModel.update({ status: 'overstay' }, condition);

    condition = {
        where: {
            id: {
                [Op.in]: leavingToday
            }
        }
    };
    await parkingModel.update({ status: 'leaving_today' }, condition);

    return;
};

exports.getBookingByParking = async (parkingId) => {
    const condition = {
        include: {
            all: true
        },
        where: {
            parking_id: parkingId
        }
    };
    const booking = await bookingModel.findOne(condition);
    return booking;
};

exports.getChangeParkingSlots = async () => {
    // const condition = {
    //     include: {
    //         all: true
    //     },
        
    // };

    const condition = {
        where: {
            id: {
                [Op.and]: {
                    [Op.gte]: 52,
                    [Op.lte]: 162
                }
            },
        },
        include: {
            all: true
        }
    }

    // const condition = {
    //     include: {
    //         all: true
    //     },
    //     where: {
    //         id: parkingId
    //     }
    // };
    const parking = await parkingModel.findAll(condition);
    console.log("**********************************************************************************")
    //console.log(parking)
    var ds = "";
    parking.map((item, index) => {
        console.log(item.dataValues.id)
        console.log(item.dataValues.display_slot)
        ds = item.dataValues.display_slot;
        ds = ds.replace("R","L");
        console.log(ds);
        var conditionnext = {
            where: {
                id: {
                    [Op.eq]: item.dataValues.id
                }
            }
        };
        parkingModel.update({ display_slot: ds }, conditionnext);
    })

    
    
    console.log("**********************************************************************************")

    return parking;
};