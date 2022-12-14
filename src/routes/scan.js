const express = require('express');
const routes = express.Router();
const parkingCont = require('../controller/parking.js');
const validator = require('../validator/jwt_validator');
const scanCont = require('../controller/scan.js');

routes.post('/addscandetails', scanCont.addScan);
routes.post('/addlot', validator.validateToken, parkingCont.addLot);
routes.post('/privacypolicy', validator.validateToken, parkingCont.modifyPrivacyPolicy);
routes.get('/privacypolicy', validator.validateToken, parkingCont.getPrivacyPolicy);
routes.get('/createparkingslots', validator.validateToken, parkingCont.generateParkings);
routes.get('/parkingslots', validator.validateToken, parkingCont.getParkingStatus);
routes.get('/:id', validator.validateToken, parkingCont.getBooking);



module.exports = routes;