const express = require('express');
const routes = express.Router();
const carTypeCont = require('../controller/carType.js');
const validator = require('../validator/jwt_validator');

routes.get('/', validator.validateToken, carTypeCont.listCarTypes);
routes.post('/add', validator.validateToken, carTypeCont.addCarType);
routes.put('/edit', validator.validateToken, carTypeCont.editCarType);
routes.delete('/delete/:id', validator.validateToken, carTypeCont.deleteCarType);
routes.get('/:id', validator.validateToken, carTypeCont.carTypeDetail);

module.exports = routes;