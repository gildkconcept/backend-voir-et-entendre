// app/models/Visit.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visit = sequelize.define('Visit', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    visited_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    visitor_identifier: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'visits',
    timestamps: false,
    createdAt: false,
    updatedAt: false
});

module.exports = Visit;