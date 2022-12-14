const express = require('express');
const routes = express.Router();
const bookingCont = require('../controller/booking.js');
const validator = require('../validator/jwt_validator');
const multer = require('multer');
const fieldSize = 419430400;

routes.post('/checkin', validator.validateToken, bookingCont.checkin);
routes.get('/receipt/:id', validator.validateToken, bookingCont.receipt);
routes.get('/checkout/:id', bookingCont.checkout);
routes.post('/search', bookingCont.searchBooking);
routes.get('/status/:id', validator.validateToken, bookingCont.checkedOut);
routes.post('/suggestions', validator.validateToken, bookingCont.searchSuggestions);
routes.get('/inventory', validator.validateToken, bookingCont.inventory);
routes.post('/revenue', validator.validateToken, bookingCont.revenueReport);
routes.post('/edit', validator.validateToken, bookingCont.editBooking);
routes.post('/carmovement', validator.validateToken, bookingCont.carMovement);
routes.put('/editbooking', bookingCont.editBooking);
routes.get('/:page', validator.validateToken, bookingCont.dashboard);
routes.post('/', validator.validateToken, bookingCont.dashboardWithPage);
routes.post('/upload', validator.validateToken, multer({ dest: 'tmp/bankFile/', limits: { fieldSize } }).single('csvfile'), bookingCont.uploadData);
routes.get('/downloadrevenue', validator.validateToken, bookingCont.downloadRevenueReport);
routes.get('/downloadcarmovement', validator.validateToken, bookingCont.downloadCarMovementReport);
routes.get('/getready', bookingCont.getCarReady);
routes.post('/modifypickuptime', bookingCont.modifyPickupTime);
routes.post('/assignuser', validator.validateToken, bookingCont.assignUser);


module.exports = routes;