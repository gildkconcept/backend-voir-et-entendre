const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SocialLink = sequelize.define('SocialLink', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    platform: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(7),
        defaultValue: '#2563EB'
    },
    clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'social_links',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = SocialLink;