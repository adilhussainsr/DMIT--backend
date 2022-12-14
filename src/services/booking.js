'use strict';

const csvParser = require('json2csv').Parser;
const db = require('../../models');
const parkingService = require('./parking');
const utils = require('../utils');
const _ = require('underscore');
const csv = require('csvtojson');
const bookingModel = db.booking;
const carTypeModel = db.carType;
const parkingModel = db.parking;
const parkingLotModel = db.parkingLot;
const vendorModel = db.vendor;
const userModel = db.user;
const Op = db.Sequelize.Op;
const timeConvertCoef = 1000 * 60 * 60;
const maxFreePassengers = 4;
const chargesExtraPerPassenger = 10;
const twentyFour = 24;
const two = 2;
const fixedCancellationCharges = 10;
const Sequelize = db.Sequelize;

exports.checkin = async (req) => { 
    const reqBody = req.body;
    const booking = { ...reqBody };
    let onsiteAmount = reqBody.onsite_amount || 0;
    let extraPassengerCharge = 0;
    const carType = await carTypeModel.findOne({ where: { id: reqBody.car_type_id } });
    let vendor = null;
    if (reqBody.vendor_id) {
        vendor = await vendorModel.findOne({ where: { id: reqBody.vendor_id } });
    }

    let parkingCharges = 0;
    let preBookingCharges = 0;
    let days = 0;
    const now = new Date();
    let bookingTime = reqBody.booking_time || null;
    let reservationTime = reqBody.reservation_time || now.toISOString();
    let pickupTime = reqBody.pick_up_time;
    if (!pickupTime) {
        return { val: null, msg: 'Pick-up time is missing.' };
    }
    let preBookingDays = 0;
    let dailyCharges = 0;

    if (bookingTime && bookingTime < reservationTime) {
        preBookingDays = utils.calculateDays(bookingTime, reservationTime) - 1;
    }

    if (!vendor/* || (vendor && !vendor.onsie_charge_applicable)*/) {
        preBookingDays = 0;
        dailyCharges = carType.regular_charges;
    } else {
        if (carType.onsite_charges) {
            dailyCharges = carType.onsite_charges;
        }
    }
    days = utils.calculateDays(reservationTime, pickupTime);
    if (days <= 0) {
        return { val: null, msg: 'Invlid reservation and(or) pick-up time.' };
    }
    parkingCharges = days * dailyCharges;
    preBookingCharges = preBookingDays * carType.regular_charges;

    if (reqBody.passengers > maxFreePassengers) {
        extraPassengerCharge = (reqBody.passengers - maxFreePassengers) * chargesExtraPerPassenger;
    }

    let parking = await parkingService.findLot(reqBody.car_type_id);
    // if (!parking) {
    //     return { val: null, msg: 'Parking slot unavailable.' };
    // }
    
    booking.extra_passenger_charges = extraPassengerCharge;
    booking.calculated_charges = parkingCharges;
    booking.pre_booking_charges = preBookingCharges;
    booking.pre_booking_days = preBookingDays;
    booking.total_amount = parkingCharges + extraPassengerCharge + parseInt(onsiteAmount) + preBookingCharges;
    booking.parking_id = parking?parking.id:null;
    booking.days = days;
    booking.ready_date = reqBody.pick_up_time;
    booking.user_id = req.userData.id;
    const ret = await bookingModel.create(booking);
    console.log("Reached here nav");
    console.log(ret)
    if (parking && parking.id) {
        await parkingModel.update({ status: 'occupied' }, { where: { id: parking.id } });
    }
    return { val: ret.id, msg: 'Booking successful.' };
};

exports.getBooking = async (id) => {
    const ret = await bookingModel.findByPk(id, { include: { all: true } });
    if (ret) {
        return ret;
    }
    return null;
};

exports.checkout = async (id) => {
    let booking = await bookingModel.findByPk(id, { include: { all: true } });
    if (!booking) {
        return null;
    }

    let total = booking.total_amount;
    const now = new Date();
    const endTime = new Date(booking.pick_up_time).getTime();
    let extraTime = (now.getTime() - endTime) / timeConvertCoef;
    let result = null;
    if (extraTime <= 0) {
        result = await handleEarlyReturn(booking, now);
        total += result.cancellation_charges;
        total -= result.refund;
    } else {
        result = await handleOverstay(booking, now);
        total += result.overstay_charges;
    }

    booking = JSON.parse(JSON.stringify(booking));
    for (let key in result) {
        booking[key] = result[key];
    }

    booking.total_amount = total;
    return booking;
};

const handleEarlyReturn = async (booking, now) => {
    let retObj = {};
    let earlyDays = 0;
    let onHold = 0;
    let refund = 0;
    let reservationTime = new Date(booking.reservation_time);
    if (!booking.reservation_time) {
        reservationTime = now;
    }
    const pickupTime = new Date(booking.pick_up_time);
    let cancellationCharges = 0;
    if (!booking.vendor_id) {
        earlyDays = utils.calculateDays(null, booking.pick_up_time) - 1;
        earlyDays = earlyDays >= 0 ? earlyDays : 0;
        if (reservationTime.toLocaleDateString() === now.toLocaleDateString()
            && pickupTime.toLocaleDateString() !== now.toLocaleDateString()) {
            cancellationCharges = fixedCancellationCharges;
            earlyDays = 0;
            refund = (booking.calculated_charges / booking.days) * (booking.days - 1);
        }
    } else {
        if (reservationTime.toLocaleDateString() === now.toLocaleDateString()
            && pickupTime.toLocaleDateString() !== now.toLocaleDateString()) {
            cancellationCharges = booking.carType.regular_charges;
            onHold = 1;
        }
    }
    retObj.cancellation_charges = cancellationCharges;
    retObj.credit_days = earlyDays;
    retObj.on_hold = onHold;
    retObj.refund = refund;
    return retObj;
};

const handleOverstay = async (booking, now) => {
    let retObj = {};
    const pickupTime = new Date(booking.pick_up_time);
    let extraHours = (now.getTime() - pickupTime.getTime()) / timeConvertCoef;
    let extraDays = Math.floor(extraHours / twentyFour);
    extraHours = Math.ceil(extraHours % twentyFour);
    if (extraHours > 1) {
        extraDays++;
        extraHours = 0;
    }
    let extraCharges = extraDays * booking.carType.regular_charges;
    extraCharges += extraHours * booking.carType.hourly_overstay_charges;

    retObj.overstay_charges = extraCharges;
    retObj.overstay_days = extraDays;
    retObj.overstay_hours = extraHours;
    return retObj;
}

exports.searchBooking = async (reqBody) => {
    const body = await utils.removeEmptyKeys(reqBody);
    let result = null;

    let condition = {
        where: {
            id:body.ticket_id
        }
    };
    result = await bookingModel.findOne(condition);
    return result;
};

exports.checkoutCompleted = async (id) => {
    const condition = { where: { id } };
    const values = { is_checked_out: true };
    await bookingModel.update(values, condition);
    const booking = await bookingModel.findByPk(id);
    await parkingModel.update({ status: 'vacant' }, { where: { id: booking.parking_id } });
    if (booking) {
        return booking.is_checked_out;
    }
    return null;
};

exports.searchSuggestions = async (searchObj) => {
    const key = Object.keys(searchObj)[0];
    const value = searchObj[key];
    const condition = {
        where: {
            [Op.and]: {
                [key]: {
                    [Op.like]: `%${value}%`
                },
                is_checked_out: {
                    [Op.eq]: 0,
                },
            }
        }
    }

    const bookings = await bookingModel.findAll(condition);
    if (bookings && bookings.length) {
        return bookings;
    }
    return null;
};

exports.getInventory = async () => {
    const condition = {
        include: {
            model: parkingLotModel,
            include: {
                model: carTypeModel
            }
        }
    };
    let parking = await parkingModel.findAll(condition);

    //const carType = await carTypeModel.findAll({include: {all: true}});
    parking = JSON.parse(JSON.stringify(parking));

    let vacant = _.where(parking, { status: 'vacant' });
    let occupied = _.reject(parking, function (p) { return p.status === 'vacant'; });
    let singleTypeVacant = _.filter(vacant, function (v) { return v.parkingLot.carTypes.length == 1; });
    let singleTypeOccupied = _.filter(occupied, function (o) { return o.parkingLot.carTypes.length == 1; });
    let multipleTypeVacant = _.filter(vacant, function (v) { return v.parkingLot.carTypes.length > 1; });
    let multipleTypeOccupied = _.filter(occupied, function (o) { return o.parkingLot.carTypes.length > 1; });

    for (let stv of singleTypeVacant) {
        stv.car_type = stv.parkingLot.carTypes[0].type;
    }

    for (let sto of singleTypeOccupied) {
        sto.car_type = sto.parkingLot.carTypes[0].type;
    }

    let carTypes = _.uniq(_.pluck(singleTypeVacant, 'car_type'));
    carTypes = _.union(carTypes, _.uniq(_.pluck(singleTypeOccupied, 'car_type')));

    let ret = [];
    let obj = {};
    for (let ct of carTypes) {
        let tmpVacant = _.where(singleTypeVacant, { car_type: ct });
        let tmpOccupied = _.where(singleTypeOccupied, { car_type: ct });
        obj = {
            type: ct,
            occupied: tmpOccupied.length,
            vacant: tmpVacant.length,
            total: tmpOccupied.length + tmpVacant.length
        };
        ret.push(obj);
    }
    obj = {
        type: 'Common',
        occupied: multipleTypeOccupied.length,
        vacant: multipleTypeVacant.length,
        total: multipleTypeOccupied.length + multipleTypeVacant.length
    };
    ret.push(obj);
    obj = {
        type: 'Total',
        occupied: _.reduce(_.pluck(ret, 'occupied'), function (memo, num) { return memo + num; }, 0),
        vacant: _.reduce(_.pluck(ret, 'vacant'), function (memo, num) { return memo + num; }, 0),
        total: _.reduce(_.pluck(ret, 'total'), function (memo, num) { return memo + num; }, 0)
    };
    ret.push(obj);

    return ret;
};

exports.getRevenue = async (reqBody) => {
    const condition = {
        where: {
            created_at: {
                [Op.and]: {
                    [Op.gte]: new Date(reqBody.start_date),
                    [Op.lte]: new Date(reqBody.end_date)
                }
            },
        },
        include: {
            all: true
        }
    }
    let userId = reqBody.user_id || null;
    if (userId) {
        condition.where.user_id = userId;
    }
    let revenue = await bookingModel.findAll(condition);
    if (!revenue || !revenue.length) {
        return [];
    }
    revenue = JSON.parse(JSON.stringify(revenue));
    for (let r of revenue) {
        r.vendor = r.vendor ? r.vendor.name : null;
        r.car_type = r.carType.type;
    }
    let vendors = await vendorModel.findAll();
    let carTypes = await carTypeModel.findAll();

    let retArr = [];

    for (let v of vendors) {
        let obj = {};
        let vendorRevenue = _.where(revenue, { vendor_id: v.id });
        obj.vendor = v.name;
        obj.cash = getData(vendorRevenue, carTypes, 'Cash');
        obj.credit = getData(vendorRevenue, carTypes, 'Card');
        obj.all = getData(vendorRevenue, carTypes);

        retArr.push(obj);
    }

    let allObj = {};
    let allRevenue = _.filter(revenue, function (o) { return (o.vendor_id ? true : false); });
    allObj.vendor = 'All';
    allObj.cash = getData(allRevenue, carTypes, 'Cash');
    allObj.credit = getData(allRevenue, carTypes, 'Card');
    allObj.all = getData(allRevenue, carTypes);
    retArr.push(allObj);

    let noneObj = {};
    let noneRevenue = _.filter(revenue, function (o) { return (o.vendor_id ? false : true); });
    noneObj.vendor = '----';
    noneObj.cash = getData(noneRevenue, carTypes, 'Cash');
    noneObj.credit = getData(noneRevenue, carTypes, 'Card');
    noneObj.all = getData(noneRevenue, carTypes);
    retArr.push(noneObj);
    return retArr;
};

const getData = (vendorRevenue, carTypes, paymentMode = null) => {
    if (paymentMode) {
        var modeRevenue = _.where(vendorRevenue, { payment_mode: paymentMode });
    } else {
        modeRevenue = vendorRevenue;
    }
    let obj = {};
    obj.parking_fee = {};
    obj.extra_passenger_charges = {};
    obj.overstay_charges = {};
    for (let ct of carTypes) {
        let ctRevenue = _.where(modeRevenue, { car_type_id: ct.id });
        obj.parking_fee[ct.type] = calculateParkingCharges(ctRevenue);

        obj.extra_passenger_charges[ct.type] = calculateExtraPassengerCharge(ctRevenue);

        obj.overstay_charges[ct.type] = calculateOverstayCharges(ctRevenue);
    }

    obj.parking_fee_total = calculateTotalParkingCharges(obj.parking_fee);
    obj.extra_passenger_charges_total = calculateTotalExtraPassengerCharges(obj.extra_passenger_charges);
    obj.overstay_charges_total = calculateTotalOverstayCharges(obj.overstay_charges);

    obj.grand_toatal = obj.parking_fee_total.revenue
        + obj.extra_passenger_charges_total.revenue
        + obj.overstay_charges_total.revenue;

    return obj;
};

const calculateParkingCharges = (ctRevenue) => {
    let tmp = _.reduce(_.pluck(ctRevenue, 'calculated_charges'), function (memo, num) { return memo + num; }, 0);
    tmp += _.reduce(_.pluck(ctRevenue, 'onsite_amount'), function (memo, num) { return memo + num; }, 0);
    const retData = {
        no_of_cars: ctRevenue.length,
        revenue: tmp || 0
    };
    return retData;
};

const calculateExtraPassengerCharge = (ctRevenue) => {
    let tmp = _.reduce(_.pluck(ctRevenue, 'extra_passenger_charges'), function (memo, num) { return memo + num; }, 0);
    let passengers = _.pluck(ctRevenue, 'passengers');
    passengers = passengers.map(function (value) { return value > maxFreePassengers ? value - maxFreePassengers : 0; });
    const retData = {
        extra_passengers: _.reduce(passengers, function (memo, num) { return memo + num; }, 0),
        revenue: tmp || 0
    };
    return retData;
};

const calculateOverstayCharges = (ctRevenue) => {
    let tmp = _.reduce(_.pluck(ctRevenue, 'overstay_charges'), function (memo, num) { return memo + num; }, 0);
    let overStayVehicles = _.pluck(ctRevenue, 'overstay_charges').map(function (value) { return value > 0 ? 1 : 0; });
    let totalOverstayVehicles = _.reduce(overStayVehicles, function (memo, num) { return memo + num; }, 0);

    tmp += _.reduce(_.pluck(ctRevenue, 'pre_booking_charges'), function (memo, num) { return memo + num; }, 0);
    let preBookingVehicles = _.pluck(ctRevenue, 'pre_booking_charges').map(function (value) { return value > 0 ? 1 : 0; });
    totalOverstayVehicles += _.reduce(preBookingVehicles, function (memo, num) { return memo + num; }, 0);

    const retData = {
        no_of_vehicles: totalOverstayVehicles,
        revenue: tmp || 0
    };

    return retData;
};

const calculateTotalParkingCharges = (parkingFee) => {
    const retData = {
        no_of_cars: _.reduce(_.pluck(parkingFee, 'no_of_cars'), function (memo, num) { return memo + num; }, 0),
        revenue: _.reduce(_.pluck(parkingFee, 'revenue'), function (memo, num) { return memo + num; }, 0)
    };
    return retData;
};

const calculateTotalExtraPassengerCharges = (extraPassengerCharges) => {
    const retData = {
        extra_passengers: _.reduce(_.pluck(extraPassengerCharges, 'extra_passengers'), function (memo, num) { return memo + num; }, 0),
        revenue: _.reduce(_.pluck(extraPassengerCharges, 'revenue'), function (memo, num) { return memo + num; }, 0)
    };
    return retData;
}

const calculateTotalOverstayCharges = (overstayCharges) => {
    const retData = {
        no_of_vehicles: _.reduce(_.pluck(overstayCharges, 'no_of_vehicles'), function (memo, num) { return memo + num; }, 0),
        revenue: _.reduce(_.pluck(overstayCharges, 'revenue'), function (memo, num) { return memo + num; }, 0)
    };
    return retData;
}

exports.updateBooking = async (reqBody) => {
    let body = await utils.removeEmptyKeys(reqBody);
    if (!body.hasOwnProperty('id')) {
        return false;
    }
    const id = body.id;
    delete body['id'];
    const condition = {
        where: {
            id
        }
    };
    const booking = await bookingModel.update(body, condition);
    if (booking && booking.length == 1) {
        return true;
    }
    return false;
};

exports.updateAssignUser = async (reqBody) => {
    let body = await utils.removeEmptyKeys(reqBody);
    console.log("Body of *****")
    console.log(body)
    if (!body.hasOwnProperty('id')) {
        return false;
    }
    const id = body.id;
    delete body['id'];
    const condition = {
        where: {
            id
        }
    };
    const booking = await bookingModel.update(body, condition);
    if (booking && booking.length == 1) {
        return true;
    }
    return false;
};

exports.carMovementReport = async (reqBody) => {
    let condition = {
        where: {
            created_at: {
                [Op.and]: {
                    [Op.gte]: new Date(reqBody.start_date),
                    [Op.lte]: new Date(reqBody.end_date)
                }
            }
        }
    };

    let checkIns = await bookingModel.findAll(condition);
    let retData = {
        check_in: {},
        check_in_total: 0,
        check_out: {},
        check_out_total: 0
    };
    let carTypes = await carTypeModel.findAll();
    let checkinTotal = 0;
    for (let ct of carTypes) {
        let data = _.where(checkIns, { car_type_id: ct.id });
        retData.check_in[ct.type] = data.length || 0;
        checkinTotal += retData.check_in[ct.type];
    }
    retData.check_in_total = checkinTotal;

    condition = {
        where: {
            updated_at: {
                [Op.and]: {
                    [Op.gte]: new Date(reqBody.start_date),
                    [Op.lte]: new Date(reqBody.end_date)
                }
            },
            is_checked_out: true
        }
    };

    let checkedOuts = await bookingModel.findAll(condition);
    let checkedOutTotal = 0;
    for (let ct of carTypes) {
        let data = _.where(checkedOuts, { car_type_id: ct.id });
        retData.check_out[ct.type] = { checked_out: data.length };
        checkedOutTotal += data.length;
    }

    condition = {
        where: {
            pick_up_time: {
                /*[Op.and]: {
                    [Op.gte]: new Date(reqBody.start_date),
                    [Op.lte]: new Date(reqBody.end_date)
                }*/
                [Op.lte]: new Date()
            },
            is_checked_out: false
        }
    };

    let pendingCheckOuts = await bookingModel.findAll(condition);
    let pendingCheckOutTotal = 0;
    for (let ct of carTypes) {
        let data = _.where(pendingCheckOuts, { car_type_id: ct.id });
        retData.check_out[ct.type].pending_check_out = data.length;
        pendingCheckOutTotal += data.length;
    }

    retData.check_out_total = {
        checked_out: checkedOutTotal,
        pending_check_out: pendingCheckOutTotal
    };

    return retData;
};

exports.updateBooking = async (reqBody) => {
    let body = await utils.removeEmptyKeys(reqBody);
    const id = body.id;
    delete body['id'];
    await bookingModel.update(body, { where: { id } });
    return;
};

const bookingsPerPage = 10;
exports.getDashboardData = async (page) => {
    let lowLimit = page === 0? 0 : page * bookingsPerPage;
    let upperLimit = page === 0? bookingsPerPage : bookingsPerPage + lowLimit;
    let condition = {
        where: {
            is_checked_out: false
        },
        order: [['pick_up_time', 'ASC']],
        limit: upperLimit
    };
    let booking = await bookingModel.findAll(condition);
    let users = await userModel.findAll();
    return { booking, users };
};

exports.getDashboardDataForUser = async (page,id) => {
    let lowLimit = page === 0? 0 : page * bookingsPerPage;
    let upperLimit = page === 0? bookingsPerPage : bookingsPerPage + lowLimit;
    let condition = {
        where: {
            is_checked_out: false,
            [Op.or]: [{assigned_to: id}, {status: 'Pending'}]
        },
        order: [['pick_up_time', 'DESC']],
        limit: upperLimit
    };
    let booking = await bookingModel.findAll(condition);
    let users = await userModel.findAll();
    return { booking, users };
};

exports.getDashboardDataByPage = async (req) => {
    let page = req.body.page || 1;
    let startDate = req.body.start_date;
    let endDate = req.body.end_date;
    let condition = {
        where: {
            is_checked_out: false,
            created_at: {
                [Op.and]: {
                    [Op.gte]: new Date(startDate),
                    [Op.lte]: new Date(endDate)
                }
            }
        },
        order: [['pick_up_time', 'ASC']],
        offset: (page - 1) * bookingsPerPage,
        limit: bookingsPerPage
    };
    let booking = await bookingModel.findAll(condition);
    let users = await userModel.findAll();
    delete condition['offset'];
    delete condition['limit'];
    let count = await bookingModel.count(condition);
    return { booking, users, count };
};

exports.uploadData = async (req) => {
    let bookings = await csv().fromFile(req.file.path);
    for (let i = 0; i < bookings.length; i++) {
        let obj = {};
        obj.prebooked = bookings[i]['Pre-Booking'] === 'Yes' ? 1 : 0;
        obj.customer_name = bookings[i]['Customer\'s Name'];
        obj.onsite_amount = !bookings[i]['Onsite Amount($)'] ? null : parseInt(bookings[i]['Onsite Amount($)']);
        obj.mobile_number = bookings[i]['Mobile No.'];
        obj.plate_number = bookings[i]['Plate Number'];
        obj.reservation_id = !bookings[i]['Reservation Id'] ? null : parseInt(bookings[i]['Reservation Id']);
        obj.passengers = !bookings[i]['Number of passengers'] ? null : parseInt(bookings[i]['Number of passengers']);

        obj.reservation_time = new Date(bookings[i]['Check-In Date']).toJSON();

        obj.pick_up_time = new Date(bookings[i]['Pick Up Date']).toJSON();

        let carType = await carTypeModel.findOne({ where: { type: bookings[i]['Car Type'] } });
        if (!carType) continue;
        obj.car_type_id = carType.id;
        let vendor = await vendorModel.findOne({ where: { name: bookings[i]['Vendor\'s Name'] } });
        //if(!vendor) continue;
        obj.vendor_id = vendor ? vendor.id : null;

        obj.payment_mode = bookings[i]['Payment Mode'];
        let calculatedCharges = bookings[i]['Reservation Charges, at the time of Check-In'] || 0;
        obj.calculated_charges = parseFloat(calculatedCharges);
        obj.extra_passenger_charges = parseFloat(bookings[i]['Extra Passenger $']) || 0;
        obj.total_amount = parseFloat(bookings[i]['Total Amount']);
        //let totalTime = new Date(obj.pick_up_time).getTime() - new Date(obj.reservation_time).getTime();
        let days = utils.calculateDays(obj.reservation_time, obj.pick_up_time);
        obj.days = parseInt(days);

        obj.booking_time = bookings[i]['Booking Time'] ? new Date(bookings[i]['Booking Time']).toJSON() : null;

        //obj.booking_time = bookings[i]['Booking Time'] || null;
        if (obj.vendor_id && obj.booking_time && obj.booking_time < obj.reservation_time) {
            obj.pre_booking_days = utils.calculateDays(obj.booking_time, obj.reservation_time);
        } else {
            obj.pre_booking_days = 0;
        }
        obj.pre_booking_charges = obj.pre_booking_days * carType.regular_charges;

        let parking = await parkingModel.findOne({ where: { display_slot: bookings[i]['Parking Slot'] } });
        if (!parking) continue;
        obj.parking_id = parking.id;

        console.log(obj);
        await bookingModel.create(obj);
    }
    return;
};

exports.downloadRevenueReport = async (revenueType, vendorId, startDate, endDate, paymentMode, userId = null) => {
    let where = {
        created_at: {
            [Op.and]: {
                [Op.gte]: new Date(startDate),
                [Op.lte]: new Date(endDate)
            }
        }
    };

    vendorId = vendorId ? Number(vendorId) : null;
    if (vendorId > 0) {
        let vendorData = await db.vendor.findOne({ where: { id: vendorId } });
        if (!vendorData) {
            throw new Error('Invalid vendor-id.');
        }
        where.vendor_id = vendorData.id;
    } else if (vendorId === 0) {
        where.vendor_id = {
            [db.Sequelize.Op.not]: null
        };
    } else {
        where.vendor_id = {
            [db.Sequelize.Op.is]: null
        };
    }

    if (userId) {
        where.user_id = userId;
    }

    if (paymentMode === 'Cash' || paymentMode === 'Card') {
        where.payment_mode = paymentMode;
    }
    const condition = {
        attributes: [
            'customer_name',
            'onsite_amount',
            'mobile_number',
            'plate_number',
            'reservation_id',
            'passengers',
            'calculated_charges',
            'extra_passenger_charges',
            'overstay_charges',
            'pre_booking_charges',
            [db.Sequelize.literal(`CASE prebooked WHEN 1 THEN 'Yes' ELSE 'No' END`), 'prebooked']
        ],
        where,
        include: {
            all: true
        }
    }
    let revenue = await bookingModel.findAll(condition);
    if (!revenue || !revenue.length) {
        return [];
    }
    revenue = JSON.parse(JSON.stringify(revenue));
    for (let r of revenue) {
        r.car_type = r.carType.type;
        r.vendor = r.vendor ? r.vendor.name : null;
        r.parking_slot = r.parking.slot;
        r.parking_fee = r.onsite_amount + r.calculated_charges;
        r.overstay_charges = r.pre_booking_charges + r.overstay_charges;
    }
    let csvFields = [];
    let parser = null;
    let revenueData = [];
    switch (revenueType) {
        case 'parking':
            csvFields = ['Customer Name', 'Mobile Number', 'Plate Number',
                'With Reservation', 'Reservation ID', 'Parking Slot', 'Parking Fee'];
            parser = new csvParser({ fields: csvFields });
            for (var r of revenue) {
                let obj = {};
                obj['Customer Name'] = r.customer_name;
                obj['Mobile Number'] = r.mobile_number;
                obj['Plate Number'] = r.plate_number;
                obj['With Reservation'] = r.prebooked;
                obj['Reservation ID'] = r.reservation_id;
                obj['Parking Slot'] = r.parking_slot;
                obj['Parking Fee'] = r.parking_fee;
                revenueData.push(obj);
            }
            break;
        case 'overstay':
            csvFields = ['Customer Name', 'Mobile Number', 'Plate Number',
                'With Reservation', 'Reservation ID', 'Parking Slot', 'Overstay Charges'];
            parser = new csvParser({ fields: csvFields });
            for (var r of revenue) {
                let obj = {};
                obj['Customer Name'] = r.customer_name;
                obj['Mobile Number'] = r.mobile_number;
                obj['Plate Number'] = r.plate_number;
                obj['With Reservation'] = r.prebooked;
                obj['Reservation ID'] = r.reservation_id;
                obj['Parking Slot'] = r.parking_slot;
                obj['Overstay Charges'] = r.overstay_charges;
                revenueData.push(obj);
            }
            revenueData = _.filter(revenueData, (d) => { return d['Overstay Charges'] > 0; });
            break;
        case 'passengers':
            csvFields = ['Customer Name', 'Mobile Number', 'Plate Number',
                'With Reservation', 'Reservation ID', 'Parking Slot',
                'No. Of Passengers', 'Extra Passenger Charges'];
            parser = new csvParser({ fields: csvFields });
            for (var r of revenue) {
                let obj = {};
                obj['Customer Name'] = r.customer_name;
                obj['Mobile Number'] = r.mobile_number;
                obj['Plate Number'] = r.plate_number;
                obj['With Reservation'] = r.prebooked;
                obj['Reservation ID'] = r.reservation_id;
                obj['Parking Slot'] = r.parking_slot;
                obj['No. Of Passengers'] = r.passengers;
                obj['Extra Passenger Charges'] = r.extra_passenger_charges;
                revenueData.push(obj);
            }
            revenueData = _.filter(revenueData, (d) => { return d['Extra Passenger Charges'] > 0; });
            break;
    }
    return parser.parse(revenueData);
};

exports.downloadCarMovementReport = async (reqQuery) => {
    const type = reqQuery.report_type || 'checkin';
    let condition = {};
    let csvFields = [];
    let parser = null;
    let carMovementData = [];
    csvFields = ['Customer Name', 'Mobile Number', 'Plate Number', 'Car Type', 'Vendor', 'Reservation ID', 'Parking Slot'];

    parser = new csvParser({ fields: csvFields });

    switch (type) {
        case 'checkin':
            condition = {
                include: {
                    all: true
                },
                where: {
                    created_at: {
                        [Op.and]: {
                            [Op.gte]: new Date(reqQuery.start_date),
                            [Op.lte]: new Date(reqQuery.end_date)
                        }
                    }
                }
            };
            break;
        case 'checkout':
            condition = {
                include: {
                    all: true
                },
                where: {
                    updated_at: {
                        [Op.and]: {
                            [Op.gte]: new Date(reqQuery.start_date),
                            [Op.lte]: new Date(reqQuery.end_date)
                        }
                    },
                    is_checked_out: true
                }
            };
            break;
        case 'pending':
            condition = {
                include: {
                    all: true
                },
                where: {
                    pick_up_time: {
                        /*[Op.and]: {
                            [Op.gte]: new Date(reqQuery.start_date),
                            [Op.lte]: new Date(reqQuery.end_date)
                        }*/
                        [Op.lte]: new Date()
                    },
                    is_checked_out: false
                }
            };
            break;
    }
    let data = await bookingModel.findAll(condition);
    if (!data || !data.length) {
        return parser.parse(carMovementData);
    }
    data = JSON.parse(JSON.stringify(data));

    for (let d of data) {
        let obj = {};
        obj['Car Type'] = d.carType.type;
        obj['Vendor'] = d.vendor ? d.vendor.name : null;
        obj['Parking Slot'] = d.parking.slot;
        obj['Customer Name'] = d.customer_name;
        obj['Mobile Number'] = d.mobile_number;
        obj['Plate Number'] = d.plate_number;
        obj['Reservation ID'] = d.reservation_id;

        carMovementData.push(obj);
    }

    return parser.parse(carMovementData);
};

exports.getBookingDetails = async (partPhone, ticketId) => {
    const condition = {
        where: {
            mobile_number: {
                [Op.endsWith]: partPhone
            },
            [Op.or]: {
                id: ticketId,
                reservation_id: ticketId
            },
            is_checked_out: false
        }
    };
    let booking = await bookingModel.findOne(condition);
    return booking;
};

exports.updatePickupTime = async (req, res) => {
    let condition = {
        where: {
            id: req.body.id
        }
    };
    await bookingModel.update({ pick_up_time: req.body.pick_up_time }, condition);
};