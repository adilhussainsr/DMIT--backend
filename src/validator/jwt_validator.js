'use strict';

var jwt = require('jsonwebtoken');
const httpHelper = require('../helpers/http');
const constant = require('../helpers/constants');
const code = constant.RESPONSE_STATUS_CODES;
const responseMsg = constant.RESPONSE_MSG;
const userService = require('../services/user');

exports.validateToken = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'] || req.headers.authorization; // Express headers are auto converted to lowercase

        if (token) {
            const decoded = await verifyJWT(token);
            req.decoded = decoded;
            const result = await userService.getUserDetailById(decoded.id);
            if (result) {
                req.userData = result;
                next();
            } else {
                return httpHelper.sendCustomError(res, code.STATUS401, responseMsg.UNAUTHORIZED, {});
            }

        } else {
            return httpHelper.sendCustomError(res, code.STATUS401, responseMsg.INVALID_TOKEN, {});
        }
    } catch(error) {
        return httpHelper.sendError(res, error.toString());
    }
};

var verifyJWT = async(token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
            if(err){
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};
