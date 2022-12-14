'use strict';

const bookingService = require('../services/booking');
const httpHelper = require('../helpers/http');
const constants = require('../helpers/constants');
const { http } = require('winston');
const code = constants.RESPONSE_STATUS_CODES;
const responseMsg = constants.RESPONSE_MSG;

exports.checkin = async (req, res) => {
    try {
        const booking = await bookingService.checkin(req);
        console.log("The booking in chekin");
        console.log(booking)
        if (booking && booking.val) {
            return httpHelper.sendSuccess(res, { id: booking.val, msg: booking.msg });
        } else if (!booking.val && booking.msg) {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, booking.msg);
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.BOOKING_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.receipt = async (req, res) => {
    try {
        const receipt = await bookingService.getBooking(req.params.id);
        if (receipt) {
            return httpHelper.sendSuccess(res, { receipt });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.RECEIPT_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.checkout = async (req, res) => {
    try {
        const receipt = await bookingService.checkout(req.params.id);
        if (receipt) {
            return httpHelper.sendSuccess(res, { receipt });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.RECEIPT_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.searchBooking = async (req, res) => { 
    try {
        const booking = await bookingService.searchBooking(req.body);
        if (booking) {
            return httpHelper.sendSuccess(res, { booking });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.RECEIPT_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.checkedOut = async (req, res) => {
    try {
        const bookingStatus = await bookingService.checkoutCompleted(req.params.id);
        if (bookingStatus) {
            return httpHelper.sendSuccess(res, { is_checked_out: bookingStatus });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.CHECKOUT_COMPLETION_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.searchSuggestions = async (req, res) => {
    try {
        const reqObj = req.body;
        const bookings = await bookingService.searchSuggestions(reqObj);
        if (bookings) {
            return httpHelper.sendSuccess(res, { bookings });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.inventory = async (req, res) => {
    try {
        if (req.userData.inventory_report_access) {
            const invnentory = await bookingService.getInventory();
            if (invnentory) {
                return httpHelper.sendSuccess(res, { invnentory });
            } else {
                return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);
            }
        } else {
            httpHelper.sendCustomSuccess(res, code.STATUS400, responseMsg.NO_ACCESS);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.revenueReport = async (req, res) => {
    try {
        if (req.userData.revenue_report_access) {
            const body = req.body;
            const revenue = await bookingService.getRevenue(body);
            if (revenue) {
                return httpHelper.sendSuccess(res, { revenue });
            } else {
                return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);
            }
        } else {
            httpHelper.sendCustomSuccess(res, code.STATUS400, responseMsg.NO_ACCESS);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.editBooking = async (req, res) => {
    try {
        const booking = await bookingService.updateBooking(req.body);
        if (booking) {
            return httpHelper.sendSuccess(res, { msg: responseMsg.UPDATE_SUCCESSFUL });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.UPDATE_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.assignUser = async (req, res) => {
    try {

        const booking = await bookingService.updateAssignUser(req.body);
        if (booking) {
            return httpHelper.sendSuccess(res, { msg: responseMsg.UPDATE_SUCCESSFUL });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.UPDATE_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.carMovement = async (req, res) => {
    try {
        if (req.userData.car_movement_record_access) {
            const data = await bookingService.carMovementReport(req.body);
            if (data) {
                return httpHelper.sendSuccess(res, { data });
            } else {
                return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);
            }
        } else {
            httpHelper.sendCustomSuccess(res, code.STATUS400, responseMsg.NO_ACCESS);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.editBooking = async (req, res) => {
    try {
        await bookingService.updateBooking(req.body);
        return httpHelper.sendSuccess(res, { msg: responseMsg.UPDATE_SUCCESSFUL });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.dashboard = async (req, res) => {
    const page  = req.params.page;
    try {
        if(req.userData.is_admin === true){
            const data = await bookingService.getDashboardData(page);
            if (data) {
                return httpHelper.sendSuccess(res, { data });
            }
        }else{
            const data = await bookingService.getDashboardDataForUser(page,req.userData.id);
            if (data) {
                return httpHelper.sendSuccess(res, { data });
            }
        }    
        return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};


exports.dashboardWithPage = async (req, res) => {
    try {
        const data = await bookingService.getDashboardDataByPage(req);
        if (data) {
            return httpHelper.sendSuccess(res, { data });
        }
        return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.NO_DATA_FOUND);
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.uploadData = async (req, res) => {
    try {
        if (!req.file) {
            return httpHelper.sendCustomError(res, code.STATUS400, 'Please upload a csv file.')
        }
        await bookingService.uploadData(req);
        return httpHelper.sendSuccess(res, { msg: 'Uploaded data successfully.' });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.downloadRevenueReport = async (req, res) => {
    try {
        if (req.userData.revenue_report_access) {
            const revenueType = req.query.revenue_type;
            const vendor = req.query.vendor || null;
            const paymentMode = req.query.payment_mode || 'All';
            const startDate = req.query.start_date;
            const endDate = req.query.end_date;
            const userId = req.query.user_id;
            const revenueCsv = await bookingService.downloadRevenueReport(revenueType, vendor, startDate, endDate, paymentMode, userId);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", "attachment; filename=Revenue.csv");
            res.status(200).end(revenueCsv);
        } else {
            httpHelper.sendCustomSuccess(res, code.STATUS400, responseMsg.NO_ACCESS);
        }

    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.downloadCarMovementReport = async (req, res) => {
    try {
        if (req.userData.car_movement_record_access) {
            const carMovementCsv = await bookingService.downloadCarMovementReport(req.query);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", "attachment; filename=Car-Movement.csv");
            res.status(200).end(carMovementCsv);
        } else {
            httpHelper.sendCustomSuccess(res, code.STATUS400, responseMsg.NO_ACCESS);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.getCarReady = async (req, res) => {
    try {
        const partPhone = req.query.phone;
        const ticketId = req.query.ticket_id;
        const booking = await bookingService.getBookingDetails(partPhone, ticketId);
        if (booking) {
            return httpHelper.sendSuccess(res, { booking });
        } else {
            httpHelper.sendCustomSuccess(res, code.STATUS400, responseMsg.NO_DATA_FOUND);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};
const userService = require('../services/user');
exports.modifyPickupTime = async (req, res) => {
    try {
        await bookingService.updatePickupTime(req);
        await userService.notifyUsers();
        return httpHelper.sendSuccess(res, { msg: 'Pick up time has been updated.' });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};
