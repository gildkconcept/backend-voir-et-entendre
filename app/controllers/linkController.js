const SocialLink = require('../models/SocialLink');

// Récupérer tous les liens avec leurs clics
const getLinks = async (req, res, next) => {
    try {
        const links = await SocialLink.findAll({
            where: { is_active: true },
            attributes: ['id', 'platform', 'title', 'url', 'icon', 'color', 'clicks'],
            order: [['created_at', 'ASC']]
        });

        res.json({
            success: true,
            count: links.length,
            links: links  // ← Chaque lien a son nombre de clics
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getLinks };