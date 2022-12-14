'use strict';

module.exports = (sequelize, DataTypes) => {
    const parking = sequelize.define('parking', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        slot: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM('vacant', 'occupied', 'overstay', 'leaving_today'),
            defaultValue: 'vacant'
        },
        display_slot: {
            type: DataTypes.STRING,
            defaultValue: null,
            unique: true
        }
    },
        {
            timestamps: true,
            underscored: true,
            tableName: "parking"
        });

    parking.associate = models => {
        parking.belongsTo(models.parkingLot, {
            foreignKey: 'parking_lot_id',
            onDelete: 'cascade'
        });

        parking.hasOne(models.booking);

    };

    return parking;
};