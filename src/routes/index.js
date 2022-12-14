const express = require('express');
const routes = express.Router();
const userRoute = require('./user');
const vendorRoute = require('./vendor');
const carTypeRoute = require('./carType');
const bookingRoute = require('./booking');
const parkingRoute = require('./parking');
const scanRoute = require('./scan');

routes.use('/user', userRoute);
routes.use('/vendor', vendorRoute);
routes.use('/cartype', carTypeRoute);
routes.use('/booking', bookingRoute);
routes.use('/parking', parkingRoute);
routes.use('/scan', scanRoute);

module.exports = routes;