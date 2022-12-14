'use strict';

module.exports = (sequelize, DataTypes) => {
    const scan = sequelize.define('scan', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.STRING
        },
        datetime: {
            type: DataTypes.STRING
        },
        fullname: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        fathername: {
            type: DataTypes.STRING
        },
        mothername: {
            type: DataTypes.STRING
        },
        pincode: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        state: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        dob: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        bloodgroup: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        atdleft: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        atdright: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
    },
        {
            timestamps: true,
            underscored: true
        });

    scan.associate = models => {
     
    };

    return scan;
};