module.exports = (sequelize, DataTypes) => {
    const privacyPolicy = sequelize.define('privacyPolicy', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        policy: {
            type: DataTypes.TEXT
        }
    });

    return privacyPolicy;
};