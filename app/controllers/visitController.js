// app/controllers/visitController.js
const Visit = require('../models/Visit');
const SocialLink = require('../models/SocialLink');
const { Op } = require('sequelize');

// Enregistrer une visite
const trackVisit = async (req, res, next) => {
    try {
        const { visitorId } = req.body;

        if (!visitorId) {
            return res.status(400).json({
                success: false,
                error: 'visitorId est requis'
            });
        }

        // Vérifier si le visiteur a déjà été compté aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingVisit = await Visit.findOne({
            where: {
                visitor_identifier: visitorId,
                visited_at: {
                    [Op.gte]: today
                }
            }
        });

        if (existingVisit) {
            return res.json({
                success: true,
                message: 'Visite déjà comptée aujourd\'hui',
                alreadyCounted: true
            });
        }

        // Créer une nouvelle visite
        await Visit.create({
            visitor_identifier: visitorId
        });

        res.status(201).json({
            success: true,
            message: 'Visite enregistrée'
        });

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la visite:', error);
        next(error);
    }
};

// Récupérer les statistiques
const getStats = async (req, res, next) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Statistiques des visites
        const [totalVisitors, todayVisitors, weekVisitors, monthVisitors] = await Promise.all([
            Visit.count(),
            Visit.count({
                where: {
                    visited_at: {
                        [Op.gte]: today
                    }
                }
            }),
            Visit.count({
                where: {
                    visited_at: {
                        [Op.gte]: weekStart
                    }
                }
            }),
            Visit.count({
                where: {
                    visited_at: {
                        [Op.gte]: monthStart
                    }
                }
            })
        ]);

        // Statistiques des clics
        const [totalClicks, whatsappClicks, telegramClicks, websiteClicks, facebookClicks, instagramClicks, tiktokClicks] = await Promise.all([
            SocialLink.sum('clicks'),
            SocialLink.sum('clicks', { where: { platform: 'whatsapp' } }),
            SocialLink.sum('clicks', { where: { platform: 'telegram' } }),
            SocialLink.sum('clicks', { where: { platform: 'website' } }),
            SocialLink.sum('clicks', { where: { platform: 'facebook' } }),
            SocialLink.sum('clicks', { where: { platform: 'instagram' } }),
            SocialLink.sum('clicks', { where: { platform: 'tiktok' } })
        ]);

        res.json({
            success: true,
            stats: {
                visits: {
                    total: totalVisitors || 0,
                    today: todayVisitors || 0,
                    week: weekVisitors || 0,
                    month: monthVisitors || 0
                },
                clicks: {
                    total: totalClicks || 0,
                    whatsapp: whatsappClicks || 0,
                    telegram: telegramClicks || 0,
                    website: websiteClicks || 0,
                    facebook: facebookClicks || 0,
                    instagram: instagramClicks || 0,
                    tiktok: tiktokClicks || 0
                }
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        next(error);
    }
};

module.exports = {
    trackVisit,
    getStats
};