const SocialLink = require('../models/SocialLink');
const Click = require('../models/Click');

// Enregistrer un clic
const trackClick = async (req, res, next) => {
    try {
        const { platform } = req.body;

        if (!platform) {
            return res.status(400).json({
                success: false,
                error: 'La plateforme est requise'
            });
        }

        // Trouver le lien
        const link = await SocialLink.findOne({
            where: { platform, is_active: true }
        });

        if (!link) {
            return res.status(404).json({
                success: false,
                error: 'Plateforme non trouvée'
            });
        }

        // Créer le clic
        await Click.create({
            social_link_id: link.id,
            platform: platform,
            ip_address: req.ip || '0.0.0.0',
            user_agent: req.headers['user-agent'] || 'Unknown',
            referer: req.headers.referer || null
        });

        // Incrémenter le compteur
        await link.increment('clicks');
        await link.reload();

        res.json({
            success: true,
            platform: platform,
            clicks: link.clicks  // ← Retourner le nombre mis à jour
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { trackClick };