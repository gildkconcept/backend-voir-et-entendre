const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const SocialLink = require('./SocialLink');

const Click = sequelize.define('Click', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    social_link_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: SocialLink,
            key: 'id'
        }
    },
    platform: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    referer: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'clicks',
    timestamps: true,
    createdAt: 'clicked_at',
    updatedAt: false
});

SocialLink.hasMany(Click, { foreignKey: 'social_link_id' });
Click.belongsTo(SocialLink, { foreignKey: 'social_link_id' });

module.exports = Click;