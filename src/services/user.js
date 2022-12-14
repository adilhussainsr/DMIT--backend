'use strict';

const db = require('../../models');
const bcrypt = require('bcrypt');
const md5 = require('md5');
const saltRounds = 10;
const userModel = db.user;
const webpush = require('web-push');

exports.getOneUserByEmail = async (email) => {
    const user = await userModel.findOne({ where: { email } });
    if (user) {
        return user;
    }
    return null;
};

exports.getUsersList = async () => {
    const users = await userModel.findAll();
    if (users && users.length) {
        return users;
    }
    return [];
};

exports.getUserDetailById = async (id) => {
    const condition = { where: { id } };
    const userData = await userModel.findOne(condition);
    return userData;
};

exports.addUser = async (reqBody) => {
    let body = { ...reqBody };
    
    const encodedPass = await md5(body.password);
    body.password = encodedPass;

    const user = await userModel.create(body);
    return { user: user.dataValues };
};

exports.editUser = async (id, reqBody) => {
    const condition = {
        where: {
            id
        }
    };
    const user = await userModel.update(reqBody, condition);
    if (user && user.length == 1) {
        return true;
    }
    return false;
};

exports.deleteUser = async (id) => {
    const condition = {
        where: {
            id
        }
    };
    const ret = await userModel.destroy(condition);
    return ret;
};

exports.detailUser = async (id) => {
    const ret = await userModel.findByPk(id);
    if (ret) {
        return ret;
    }
    return null;
};

exports.logoutUser = async (id) => {
    const values = {
        auth_token: null
    };
    const condition = {
        where: {
            id
        }
    };
    await userModel.update(values, condition);
    return;
};

exports.saveSubscription = async (body, userId) => {
    console.log(JSON.stringify(body));
    const value = {
        notify_endpoint: body.endpoint
    };
    const condition = {
        where: {
            id: userId
        }
    };
    await userModel.update(value, condition);
    return;
}

exports.notifyUsers = async () => {
    webpush.setVapidDetails(
        'mailto:kirtidhingra@search-value.com',
        process.env.NOTIFICATION_PUBLIC_KEY,
        process.env.NOTIFICATION_PRIVATE_KEY
    );
    //let subscriptions = await userModel.findAll({attributes: ['']})
};

