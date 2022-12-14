'use strict';

module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        auth_token: {
            type: DataTypes.STRING
        },
        logo: {
            type: DataTypes.STRING
        },
        website: {
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
        role: {
            type: DataTypes.STRING(5),
            allowNull: true
        },
        verified: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        business_operator: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        franchise: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        scanning: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        counselling: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        }
    },
        {
            timestamps: true,
            underscored: true
        });

    user.associate = models => {
     
    };

    return user;
};