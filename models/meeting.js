'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Meeting = loader.database.define('meetings', {
    meetingId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    location: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull:false
    },
    startTime: {
        type: Sequelize.TIME,
    },
    endTime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    comment: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    createdBy: {
        type: Sequelize.STRING, // id_str
        allowNull: false
    },
    isPrivate: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Meeting;