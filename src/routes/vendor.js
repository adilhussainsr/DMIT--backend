const express = require('express');
const routes = express.Router();
const vendorCont = require('../controller/vendor.js');
const validator = require('../validator/jwt_validator');

routes.get('/', validator.validateToken, vendorCont.listVendors);
routes.post('/add', validator.validateToken, vendorCont.addVendor);
routes.put('/edit', validator.validateToken, vendorCont.editVendor);
routes.delete('/delete/:id', validator.validateToken, vendorCont.deleteVendor);
routes.get('/:id', validator.validateToken, vendorCont.vendorDetail);

module.exports = routes;