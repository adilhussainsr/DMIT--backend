'use strict';

module.exports = (sequelize, DataTypes) => {
    const vendor = sequelize.define('vendor', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        initials: {
            allowNull: false,
            type: DataTypes.STRING
        },
        onsie_charge_applicable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        timestamps: true,
        underscored: true,
        tableName: 'vendors'
    });
    vendor.associate = models => {
        vendor.hasMany(models.booking);
    };

    return vendor;
};