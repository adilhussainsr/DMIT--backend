'use strict';

const userService = require('../services/user');
const httpHelper = require('../helpers/http');
const constants = require('../helpers/constants');
const bcrypt = require("bcrypt");
const md5 = require('md5');
const common = require('../helpers/common');
const code = constants.RESPONSE_STATUS_CODES;
const responseMsg = constants.RESPONSE_MSG;

exports.login = async (req, res) => {
    try {
        const email = req.body.email.value;
        var user = await userService.getOneUserByEmail(email);

        if (user) {
            var password = req.body.password.value;
            password = await md5(password);
            var verifyPass = password === user.password?true:false;
         
            if (verifyPass === true) {
                const token = common.getToken(user.id, email);
                const dataToUpdate = { auth_token: token};
                const userId = user.id;
                const userNew = await userService.editUser(userId, dataToUpdate);
            
                return httpHelper.sendSuccess(res, {
                  msg: responseMsg.LOGGED_IN,
                  token: token,
                  user_id: user.id,
                  user: { user_data: user },
                });
            } else {
                return httpHelper.sendCustomErrorValid(res, code.STATUS401, responseMsg.INVALID_PASSWORD);
            }
        } else {
            return httpHelper.sendCustomErrorValid(res, code.STATUS401, responseMsg.INVALID_UERNAME);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await userService.getUsersList();
        return httpHelper.sendSuccess(res, { users });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.addUser = async (req, res) => {
    try {
        const email = req.body.data.email.value;
        var userfound = await userService.getOneUserByEmail(email);

        if (userfound) {
            return httpHelper.sendCustomErrorValid(res, code.STATUS401, responseMsg.EXISTS_UERNAME);
        }
        const bodyReq = {
          email: req.body.data.email.value,
          phone: req.body.data.phone.value,
          name: req.body.data.name.value,
          password: req.body.data.password.value,
          role:"1",
        };
      
        const user = await userService.addUser(bodyReq);
        return httpHelper.sendSuccess(res, user);

    } catch (err) {
        console.log(JSON.stringify(err));
        return httpHelper.sendError(res, JSON.stringify(err));
    }
};

exports.editUser = async (req, res) => {
    try {
        const userId = req.body.id;
        const reqBody = { ...req.body };
        delete reqBody['id'];
        const user = await userService.editUser(userId, reqBody);
        if (user) {
            return httpHelper.sendSuccess(res, { msg: responseMsg.UPDATE_SUCCESSFUL });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.UPDATE_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const status = await userService.deleteUser(userId);
        if (status === 1) {
            return httpHelper.sendSuccess(res, { msg: responseMsg.DELETE_SUCCESSFUL });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.DELETE_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.userDetail = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.detailUser(userId);
        if (user) {
            return httpHelper.sendSuccess(res, { user });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.GETUSER_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.logout = async (req, res) => {
    try {
        await userService.logoutUser(req.userData.id);
        return httpHelper.sendSuccess(res, { user });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.getProfile = async (req, res) => {
    try {
        const profile = JSON.parse(JSON.stringify(req.userData));

        if (profile) {
            delete profile['password'];
            delete profile['auth_token'];
            return httpHelper.sendSuccess(res, { profile });
        } else {
            return httpHelper.sendCustomSuccess(res, code.STATUS204, responseMsg.GETUSER_ERROR);
        }
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};

exports.subscribeNotifications = async (req, res) => {
    try {
        if (!req.body || !req.body.endpoint) {
            return httpHelper.sendCustomSuccess(res, code.STATUS400, responseMsg.INVALID_SUBSCRIPTION_REQ);
        }
        await userService.saveSubscription(req.body);
        return httpHelper.sendSuccess(res, { msg: 'Subscription Saved.' });
    } catch (err) {
        console.log(err.toString());
        return httpHelper.sendError(res, err.toString());
    }
};