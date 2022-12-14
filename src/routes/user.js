const express = require('express');
const routes = express.Router();
const userCont = require('../controller/user.js');
const validator = require('../validator/jwt_validator');

routes.get('/test', (req, res) => {
    console.log(JSON.stringify(req.body));
    res.status(200).send({ token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZUlkIjoxLCJkZXZpY2VJZCI6IjhkYmZmNjI2NjhhMWY0YjgiLCJpYXQiOjE1ODA5Nzg1MjZ9.wcQxr8sIlL_xsCWBPnOEnDKIZBW1iXZFMcqJmLvWo8E` });

});
//routes.get('/test', (req, res) => res.send('Hi, User tested!!!!'));
routes.get('/profile', validator.validateToken, validator.validateToken, userCont.getProfile);
routes.post('/login', userCont.login);
routes.get('/', validator.validateToken, userCont.listUsers);
routes.post('/add', userCont.addUser);
routes.put('/edit', validator.validateToken, userCont.editUser);
routes.delete('/delete/:id', validator.validateToken, userCont.deleteUser);
routes.get('/:id', validator.validateToken, userCont.userDetail);
routes.get('/logout', validator.validateToken, userCont.logout);
routes.post('/subscribe', validator.validateToken, userCont.subscribeNotifications);


module.exports = routes;