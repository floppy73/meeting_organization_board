'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const User = loader.database.define('users',{
    userId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    photoUrl: {
        type: Sequelize.STRING,
        validate: {
            isUrl: true
        },
        allowNull: false
    },
    playerName: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false
});

module.exports = User;