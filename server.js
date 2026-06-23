require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./app/config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connecté à PostgreSQL (Render)');

        // Supprimer la vue stats_summary si elle existe
        await sequelize.query('DROP VIEW IF EXISTS stats_summary CASCADE;');
        console.log('✅ Vue stats_summary supprimée');

        // Synchroniser les modèles (sans modifier les colonnes existantes)
        await sequelize.sync({ alter: false });
        console.log('✅ Modèles synchronisés');

        // Recréer la vue stats_summary
        await sequelize.query(`
            CREATE OR REPLACE VIEW stats_summary AS
            SELECT 
                sl.id,
                sl.platform,
                sl.title,
                sl.url,
                sl.icon,
                sl.color,
                sl.clicks AS total_clicks,
                COUNT(c.id) AS recent_clicks,
                MAX(c.clicked_at) AS last_click
            FROM social_links sl
            LEFT JOIN clicks c ON sl.id = c.social_link_id 
                AND c.clicked_at > NOW() - INTERVAL '30 days'
            WHERE sl.is_active = true
            GROUP BY sl.id, sl.platform, sl.title, sl.url, sl.clicks, sl.color, sl.icon, sl.is_active
            ORDER BY sl.created_at ASC;
        `);
        console.log('✅ Vue stats_summary recréée');

        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
            console.log(`📊 Environnement: ${process.env.NODE_ENV}`);
            console.log(`🗄️  Base de données: PostgreSQL Render`);
            console.log(`📡 Endpoints disponibles:`);
            console.log(`   - GET  /api/links`);
            console.log(`   - POST /api/click`);
            console.log(`   - GET  /health`);
        });
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

startServer();