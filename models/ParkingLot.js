'use strict';

module.exports = (sequelize, DataTypes) => {
    const parkingLot = sequelize.define('parkingLot', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        lot: {
            type: DataTypes.STRING
        },
        sub_lot: {
            type: DataTypes.INTEGER
        },
        rows: {
            type: DataTypes.INTEGER
        },
        sections: {
            type: DataTypes.INTEGER
        },
        min_duration: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        max_duration: {
            type: DataTypes.INTEGER
        },
        data_entered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        timestamps: true,
        underscored: true,
        tableName: "parking_lots"
    });

    parkingLot.associate = models => {
        parkingLot.belongsToMany(models.carType, {through: 'parking_lot_car_type'});
        parkingLot.hasMany(models.parking);
    };

    return parkingLot;
};