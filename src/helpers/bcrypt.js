'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;

//methods that will create new hash of an password string.
exports.getHash = async txtTobcrypt => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(txtTobcrypt, saltRounds, (err, hash) => {
            if(err) {
                console.log('error while encrypting --------- ', err);
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
};

//methods that compare the password.
exports.checkPassword = async (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, function(err, res) {
            // res == true
            if(err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
};
