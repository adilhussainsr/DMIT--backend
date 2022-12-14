'use strict';

module.exports = (sequelize, DataTypes) => {
    const carType = sequelize.define('carType', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        type: {
            type: DataTypes.STRING
        },
        regular_charges: {
            type: DataTypes.FLOAT
        },
        hourly_overstay_charges: {
            type: DataTypes.FLOAT
        },
        onsite_charges: {
            type: DataTypes.REAL,
            defaultValue: 0
        }
    },
    {
        timestamps: true,
        underscored: true,
        tableName: "car_types"
    });

    carType.associate = models => {
        carType.hasMany(models.booking);
        carType.belongsToMany(models.parkingLot, {through: 'parking_lot_car_type'});
    };

    return carType;
};