'use strict';

module.exports = (sequelize, DataTypes) => {
    const booking = sequelize.define('booking', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        prebooked: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        customer_name: {
            type: DataTypes.STRING
        },
        onsite_amount: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
        mobile_number: {
            type: DataTypes.STRING
        },
        plate_number: {
            type: DataTypes.STRING
        },
        reservation_id: {
            type: DataTypes.STRING,
            defaultValue: null
        },
        passengers: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        booking_time: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        reservation_time: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        pick_up_time: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        ready_date: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        payment_mode: {
            type: DataTypes.STRING,
            defaultValue: 'Cash'
        },
        calculated_charges: {
            type: DataTypes.REAL,
            defaultValue: null
        },
        extra_passenger_charges: {
            type: DataTypes.REAL,
            defaultValue: null
        },
        cancellation_charges: {
            type: DataTypes.REAL,
            defaultValue: null
        },
        total_amount: {
            type: DataTypes.REAL,
            defaultValue: null
        },
        overstay_charges: {
            type: DataTypes.REAL,
            defaultValue: null
        },
        is_checked_out: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        days: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        pre_booking_days: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        pre_booking_charges: {
            type: DataTypes.REAL,
            defaultValue: null
        },
        overstay_days: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        overstay_hours: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        modal_done: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('Accepted', 'Pending', 'Ready'),
            defaultValue: 'Pending'
        },
        refund: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        on_hold: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: "bookings",
        indexes: [{
            fields: ['parking_id'],
            using: 'HASH'
        }, {
            fields: ['customer_name'],
            using: 'HASH'
        }, {
            fields: ['mobile_number'],
            using: 'HASH'
        }, {
            fields: ['plate_number'],
            using: 'HASH'
        }, {
            fields: ['reservation_id'],
            using: 'HASH'
        }]
    });

    booking.associate = models => {
        booking.belongsTo(models.vendor, {
            foreignKey: 'vendor_id',
            onDelete: 'cascade'
        });
        booking.belongsTo(models.carType, {
            foreignKey: 'car_type_id',
            onDelete: 'cascade'
        });
        booking.belongsTo(models.parking, {
            foreignKey: 'parking_id',
            onDelete: 'cascade'
        });
        booking.belongsTo(models.user, {
            foreignKey: 'assigned_to',
            onDelete: 'cascade',
            as: 'assignee'
        });
        booking.belongsTo(models.user, {
            foreignKey: 'user_id',
            onDelete: 'cascade',
            as: 'user'
        });
    };

    return booking;
};