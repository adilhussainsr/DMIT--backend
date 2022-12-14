'use strict';

const jwt = require('jsonwebtoken')

exports.getToken = (userId, email) => {
    const dataObj = {id: userId, email};
    const token = jwt.sign(dataObj, process.env.SECRETKEY);
    return token;
};