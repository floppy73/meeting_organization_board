'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Participant = loader.database.define('participants', {
    meetingId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Participant;